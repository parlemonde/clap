import * as argon2 from 'argon2';
import mysql from 'mysql2';
import path from 'path';
import type { Connection, ConnectionOptions } from 'typeorm';
import { createConnection, getRepository } from 'typeorm';

import { Language } from '../entities/language';
import { User, UserType } from '../entities/user';
import { sleep } from '../utils/sleep';
import { logger } from './logger';

const DEFAULT_PORT = '3306';
const DB_NAME: string = process.env.DB_DB || process.env.DB_NAME || 'plmo';

const getDBConfig = (): ConnectionOptions | null => {
    let connectionOptions: ConnectionOptions;
    if (process.env.DATABASE_URL) {
        connectionOptions = {
            type: 'mysql',
            url: process.env.DATABASE_URL,
        };
    } else {
        connectionOptions = {
            database: DB_NAME,
            host: process.env.DB_HOST,
            password: process.env.DB_PASS,
            port: parseInt(process.env.DB_PORT || DEFAULT_PORT, 10),
            type: 'mysql',
            username: process.env.DB_USER,
            extra: process.env.DB_SSL
                ? {
                      ssl: true,
                  }
                : { ssl: false },
        };
    }

    const options = {
        logging: process.env.NODE_ENV !== 'production',
        entities: [path.join(__dirname, '../entities/*.js')],
        migrations: [path.join(__dirname, '../migration/**/*.js')],
        synchronize: true,
        charset: 'utf8mb4_unicode_ci',
        ...connectionOptions,
    };
    return options;
};

function query(q: string, connection: mysql.Connection): Promise<void> {
    return new Promise((resolve, reject) => {
        connection.query(q, (error: Error) => {
            if (error) {
                reject(error);
                return;
            }
            resolve();
        });
    });
}

async function createDB(): Promise<void> {
    try {
        const connection = mysql.createConnection({
            charset: 'utf8mb4_unicode_ci',
            host: process.env.DB_HOST,
            password: process.env.DB_PASS,
            user: process.env.DB_USER,
        });
        await query(`CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET = 'utf8mb4' COLLATE = 'utf8mb4_unicode_ci';`, connection);
        logger.info('Database PLMO created!');
    } catch (e) {
        logger.error(e);
    }
}

async function createFrenchLanguage(): Promise<void> {
    const count = await getRepository(Language).count({ where: { value: 'fr' } });
    if (count > 0) {
        return;
    }
    const language = new Language();
    language.label = 'Français';
    language.value = 'fr';
    await getRepository(Language).save(language);
    logger.info('Language fr created!');
}

async function createSuperAdminUser(): Promise<void> {
    if (!process.env.ADMIN_PSEUDO || !process.env.ADMIN_PASSWORD) {
        return;
    }
    try {
        const adminPseudo = process.env.ADMIN_PSEUDO;
        const adminPassword = process.env.ADMIN_PASSWORD;
        const count = await getRepository(User).count({ where: { pseudo: adminPseudo } });
        if (count > 0) {
            return;
        }
        const user = new User();
        user.email = process.env.ADMIN_EMAIL || 'admin.1village@parlemonde.org';
        user.pseudo = adminPseudo;
        user.school = 'Asso Par Le Monde';
        user.type = UserType.PLMO_ADMIN;
        user.languageCode = 'fr';
        user.passwordHash = await argon2.hash(adminPassword);
        user.accountRegistration = 0;
        await getRepository(User).save(user);
        logger.info('Super user Admin created!');
    } catch {
        return;
    }
}

export async function connectToDatabase(tries: number = 10): Promise<Connection | null> {
    if (tries === 0) {
        return null;
    }
    try {
        const config = getDBConfig();
        if (config === null) {
            return null;
        }
        const connection = await createConnection(config);
        await createFrenchLanguage();
        await createSuperAdminUser();
        return connection;
    } catch (e) {
        logger.error(e);
        logger.info('Could not connect to database. Retry in 10 seconds...');
        if (((e as Error) || '').toString().includes('Unknown database')) {
            await createDB();
        }
        await sleep(10000);
        return connectToDatabase(tries - 1);
    }
}
