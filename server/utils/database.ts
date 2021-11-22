import * as argon2 from "argon2";
import mysql from "mysql";
import path from "path";
import { Client } from "pg";
import { Connection, createConnection, ConnectionOptions, getRepository, EntityManager } from "typeorm";

import { Language } from "../entities/language";
import { User, UserType } from "../entities/user";

import { logger } from "./logger";
import { sleep } from "./utils";

const DEFAULT_TYPE = "mysql" as const;
const DEFAULT_PORT = "3306";
const DEFAULT_NAME = "plmo";

const getDBConfig = (): ConnectionOptions | null => {
  if (!process.env.DB_TYPE || (process.env.DB_TYPE !== "mysql" && process.env.DB_TYPE !== "mariadb" && process.env.DB_TYPE !== "postgres")) {
    return null;
  }

  let connectionOptions: ConnectionOptions;
  if (process.env.DATABASE_URL) {
    connectionOptions = {
      type: (process.env.DB_TYPE || DEFAULT_TYPE) as "mariadb" | "postgres" | "mysql",
      url: process.env.DATABASE_URL,
    };
  } else {
    connectionOptions = {
      database: process.env.DB_DB || process.env.DB_NAME || DEFAULT_NAME,
      host: process.env.DB_HOST,
      password: process.env.DB_PASS,
      port: parseInt(process.env.DB_PORT || DEFAULT_PORT, 10),
      type: (process.env.DB_TYPE || DEFAULT_TYPE) as "mariadb" | "postgres" | "mysql",
      username: process.env.DB_USER,
      extra: process.env.DB_SSL
        ? {
            ssl: true,
          }
        : { ssl: false },
    };
  }

  const options = {
    logging: process.env.NODE_ENV !== "production",
    entities: [path.join(__dirname, "../entities/*.js")],
    migrations: [path.join(__dirname, "../migration/**/*.js")],
    synchronize: true,
    timezone: "utc",
    ...connectionOptions,
  };
  if (options.type === "mysql" || options.type === "mariadb") {
    options.charset = "utf8mb4_unicode_ci";
  }
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

async function createMySQLDB(): Promise<void> {
  try {
    const connection = mysql.createConnection({
      charset: "utf8mb4_unicode_ci",
      host: process.env.DB_HOST,
      password: process.env.DB_PASS,
      timezone: "utc",
      user: process.env.DB_USER,
    });
    const dbName: string = process.env.DB_NAME || DEFAULT_NAME;
    await query(`CREATE DATABASE IF NOT EXISTS ${dbName} CHARACTER SET = 'utf8mb4' COLLATE = 'utf8mb4_unicode_ci';`, connection);
    logger.info("Database PLMO created!");
  } catch (e) {
    logger.error(e);
  }
}

async function createPostgresDB(): Promise<void> {
  let connectionData:
    | {
        connectionString: string;
      }
    | {
        host: string;
        user: string;
        password: string;
        database: string;
      };
  let dbName: string;
  if (process.env.DATABASE_URL) {
    const url_parts = process.env.DATABASE_URL.split("/");
    dbName = url_parts.pop() || DEFAULT_NAME;
    url_parts.push("postgres");
    connectionData = {
      connectionString: url_parts.join("/"),
    };
  } else {
    dbName = process.env.DB_DB || process.env.DB_NAME || DEFAULT_NAME;
    connectionData = {
      host: process.env.DB_HOST || "",
      password: process.env.DB_PASS || "",
      user: process.env.DB_USER || "",
      database: "postgres",
    };
  }
  const client = new Client(connectionData);
  await client.connect();
  await client.query(`CREATE DATABASE ${dbName};`);
  logger.info(`Database ${dbName} created!`);
  await client.end();
}

async function createSequences(connection: Connection): Promise<void> {
  await connection.transaction(async (manager: EntityManager) => {
    if (process.env.DB_TYPE && process.env.DB_TYPE === "postgres") {
      await manager.query(`CREATE SEQUENCE IF NOT EXISTS SCENARIO_SEQUENCE START WITH 1 INCREMENT BY 1`);
    } else {
      await manager.query(`CREATE TABLE sequence (id INT NOT NULL)`);
      await manager.query(`INSERT INTO sequence VALUES (0)`);
    }
  });
}

async function createFrenchLanguage(): Promise<void> {
  const count = await getRepository(Language).count({ where: { value: "fr" } });
  if (count > 0) {
    return;
  }
  const language = new Language();
  language.label = "Français";
  language.value = "fr";
  await getRepository(Language).save(language);
  logger.info("Language fr created!");
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
    user.email = process.env.ADMIN_EMAIL || "admin.1village@parlemonde.org";
    user.pseudo = adminPseudo;
    user.level = "";
    user.school = "Asso Par Le Monde";
    user.type = UserType.PLMO_ADMIN;
    user.languageCode = "fr";
    user.passwordHash = await argon2.hash(adminPassword);
    user.accountRegistration = 0;
    await getRepository(User).save(user);
    logger.info("Super user Admin created!");
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
    try {
      await createSequences(connection);
    } catch (e) {
      /**/
    }
    await createFrenchLanguage();
    await createSuperAdminUser();
    return connection;
  } catch (e) {
    logger.error(e);
    logger.info("Could not connect to database. Retry in 10 seconds...");
    if (((e as Error).message || "").split(":")[0] === "ER_BAD_DB_ERROR") {
      await createMySQLDB();
    } else if (((e as Error) || "").toString().includes("Unknown database")) {
      try {
        await createPostgresDB();
      } catch (e2) {
        logger.info("Could not create database...");
        return null;
      }
    }
    await sleep(10000);
    return connectToDatabase(tries - 1);
  }
}
