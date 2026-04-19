import { runMigrations, seedAdminUser, seedDefaultLanguage } from './bootstrap';
import { createDatabaseConnection } from './runtime';

const start = async () => {
    const { backend, db, onClose } = await createDatabaseConnection();
    await runMigrations(db, backend);
    await seedAdminUser(db);
    await seedDefaultLanguage(db);
    await onClose();
};

start().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
