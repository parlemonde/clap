import { Router } from "express";

import { Controller } from "../controllers/controller";
import * as controllers from "../controllers";
import { jsonify } from "../middlewares/jsonify";

const routes = Router();
routes.use(jsonify);

const cc = (controllers as unknown) as { [key: string]: new () => Controller };

for (const controller of Object.keys(cc)) {
  const c = new cc[controller]();
  routes.use(`/${c.path}`, c.router);
}

export { routes };