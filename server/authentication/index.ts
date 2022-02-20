import type { RequestHandler } from 'express';
import { Router } from 'express';
import morgan from 'morgan';

import { handleErrors } from '../middlewares/handleErrors';
import { jsonify } from '../middlewares/jsonify';
import { login } from './login';
import { logout } from './logout';
import { resetPassword, updatePassword, verifyEmail } from './password';
import { loginWithPlmSSO } from './plmSSO';
import { refreshToken, rejectAccessToken } from './refreshToken';

const authRouter = Router();
authRouter.post('/token', morgan('dev') as RequestHandler, jsonify, handleErrors(refreshToken));
authRouter.post('/token/reject', morgan('dev') as RequestHandler, jsonify, handleErrors(rejectAccessToken));
authRouter.post('/login', morgan('dev') as RequestHandler, jsonify, handleErrors(login));
authRouter.post('/login/reset-password', morgan('dev') as RequestHandler, jsonify, handleErrors(resetPassword));
authRouter.post('/login/update-password', morgan('dev') as RequestHandler, jsonify, handleErrors(updatePassword));
authRouter.post('/login/verify-email', morgan('dev') as RequestHandler, jsonify, handleErrors(verifyEmail));
authRouter.post('/login-sso-plm', morgan('dev') as RequestHandler, jsonify, handleErrors(loginWithPlmSSO));
authRouter.post('/logout', morgan('dev') as RequestHandler, jsonify, handleErrors(logout));

export { authRouter };
