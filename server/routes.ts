import { Router } from 'express';

import { audioController } from './controllers/audios';
import { imageController } from './controllers/images';
import { languageController } from './controllers/languages';
import { localesController } from './controllers/locales';
import { planController } from './controllers/plans';
import { projectController } from './controllers/projects';
import { questionController } from './controllers/questions';
import { questionTemplateController } from './controllers/questions-templates';
import { scenarioController } from './controllers/scenarios';
import { themeController } from './controllers/themes';
import { userController } from './controllers/users';

const routes = Router();

routes.use(audioController.name, audioController.router);
routes.use(imageController.name, imageController.router);
routes.use(languageController.name, languageController.router);
routes.use(localesController.name, localesController.router);
routes.use(planController.name, planController.router);
routes.use(projectController.name, projectController.router);
routes.use(questionController.name, questionController.router);
routes.use(questionTemplateController.name, questionTemplateController.router);
routes.use(scenarioController.name, scenarioController.router);
routes.use(themeController.name, themeController.router);
routes.use(userController.name, userController.router);

export { routes };
