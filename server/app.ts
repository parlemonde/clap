import 'dotenv/config';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Router } from 'express';
import type { Request } from 'express';
import RateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import next from 'next';
import path from 'path';

import { authRouter } from './authentication';
import { connectToDatabase } from './lib/database';
import { logger } from './lib/logger';
import { normalizePort, onError } from './lib/server';
import { authenticate } from './middlewares/authenticate';
import { crsfProtection } from './middlewares/csrf-check';
import { handleErrors } from './middlewares/handle-errors';
import { jsonify } from './middlewares/jsonify';
import { removeTrailingSlash } from './middlewares/remove-trailing-slash';
import { routes } from './routes';
import { getLocales } from './translations/getLocales';
import { getDefaultDirectives } from './utils/get-default-directives';

const IS_DEV = process.env.NODE_ENV !== 'production';
const frontendHandler = next({ dev: IS_DEV });
const handle = frontendHandler.getRequestHandler();
const morganHandler = morgan(IS_DEV ? 'dev' : 'combined', {
    skip: (req: Request) => req.path === '/',
});

async function startApp() {
    // --- Connect to DB ---
    const connection = await connectToDatabase();
    if (connection === null) {
        throw new Error('Could not connect to database...');
    }
    logger.info(`Database connection established: ${connection.isConnected}`);

    // Prepare frontend routes
    await frontendHandler.prepare();

    // --- Init express ---
    const app = express();
    app.enable('strict routing');

    // --- Set up rate limiter ---
    // maximum of 30 requests per minute
    const limiter = RateLimit({
        windowMs: 1 * 60 * 1000, // 1 minute
        max: IS_DEV ? 600 : 120,
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    });
    // apply rate limiter to all requests
    app.use(limiter);

    // --- Add middlewares ---
    const directives = getDefaultDirectives();
    if (IS_DEV) {
        directives['default-src'] = ["'self'", "'unsafe-eval'", "'unsafe-inline'", 'blob:'];
        directives['script-src'] = ["'self'", "'unsafe-eval'", "'unsafe-inline'", 'blob:'];
    }
    app.use(
        helmet({
            contentSecurityPolicy: {
                directives,
            },
            crossOriginResourcePolicy: {
                policy: 'cross-origin',
            },
            crossOriginEmbedderPolicy: false,
        }),
    );
    app.use(cors());
    app.use(removeTrailingSlash);
    app.use(bodyParser.json());
    app.use(cookieParser());
    app.use(crsfProtection());
    app.use(jsonify);

    // --- BACKEND ---
    const backRouter = Router();
    backRouter.use(morganHandler);
    backRouter.get('/', (_, res) => {
        res.status(200).send('Hello World Clap!');
    });
    backRouter.use('/', authRouter);
    backRouter.use('/', routes);
    backRouter.use((_, res) => {
        res.status(404).send('Error 404 - Not found.');
    });
    app.use('/api', backRouter);

    // --- FRONTEND ---
    app.get('/creer', (_req, res) => {
        res.redirect('/create');
    });
    app.get('/admin', (_req, res) => {
        res.redirect('/admin/themes');
    });
    app.use(`/static/pdf`, express.static(path.join(__dirname, './static/pdf')));
    app.use(`/static/xml`, express.static(path.join(__dirname, './static/xml')));
    app.use(express.static(path.join(__dirname, '../../public'))); // app.js is located at ./dist/server and public at ./public
    app.get('/_next/*', (req, res) => {
        handle(req, res).catch((e) => console.error(e));
    });
    app.get(
        '*',
        morganHandler,
        handleErrors(authenticate()),
        handleErrors(async (req, res) => {
            if (req.path.slice(1, 6) === 'admin' && (!req.user || req.user.type === 0)) {
                res.redirect('/create');
                return;
            }
            req.currentLocale = req.cookies?.['app-language'] || req.user?.languageCode || 'fr';
            req.csrfToken = req.getCsrfToken();
            req.locales = await getLocales(req.currentLocale);
            return handle(req, res).catch((e) => console.error(e));
        }),
    );

    // --- 404 ---
    app.use(morganHandler, (_, res) => {
        res.status(404).send('Error 404 - Not found.');
    });

    // --- Start server ---
    const port = normalizePort(process.env.PORT || '5000');
    if (port === false) {
        logger.error(`Exiting. Invalid port to use: %s`, port);
    } else {
        const server = app.listen(port);
        server.on('error', onError);
        server.on('listening', () => {
            logger.info(`App listening on port ${port}!`);
        });
    }
}

startApp().catch((e: Error) => console.error(e));
