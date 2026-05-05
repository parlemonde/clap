export const envDefaults = {
    APP_SECRET: '1234',
    BETTER_AUTH_SECRET: '',
    HOST_URL: 'http://localhost:3000',
    BETTER_AUTH_URL: 'http://localhost:3000',
    // DB and Otel
    DATABASE_URL: 'postgresql://postgres:example@localhost:5432/clap',
    OTEL_EXPORTER_OTLP_ENDPOINT: 'http://localhost:4318',
    // AWS
    AWS_ACCESS_KEY_ID: '',
    AWS_SECRET_ACCESS_KEY: '',
    AWS_SESSION_TOKEN: '',
    AWS_REGION: '',
    S3_BUCKET_NAME: '',
    // SSO
    CLIENT_ID: '',
    CLIENT_SECRET: '',
    // Websockets
    COLLABORATION_SERVER_SECRET: '',
    COLLABORATION_SERVER_URL: 'ws://localhost:9000',
    // Emails
    HOST_DOMAIN: 'clap.parlemonde.org',
    NODEMAILER_HOST: '',
    NODEMAILER_PORT: '',
    NODEMAILER_USER: '',
    NODEMAILER_PASS: '',
    // Db seed
    ADMIN_PASSWORD: '',
    ADMIN_EMAIL: '',
    ADMIN_NAME: '',
    // Runtime
    NODE_ENV: 'dev',
    NEXT_RUNTIME: 'node',
};

export function getEnvVariable(key: keyof typeof envDefaults): string {
    return process.env[key] ?? envDefaults[key];
}
