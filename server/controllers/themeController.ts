import { NextFunction, Request, Response } from "express";
import { getRepository } from "typeorm";

import { Theme } from "../entities/theme";
// import { ThemeRepository } from "../customRepositories/themeRepository";
// import { Image } from "../entities/image";
import { User, UserType } from "../entities/user";
import { AppError } from "../middlewares/handleErrors";

// import { deleteImage } from "../fileUpload";
import { Controller, del, get, post, put } from "./controller";

async function updateThemeOrder(themeId: number, newOrder: number): Promise<void> {
  const theme: Theme | undefined = await getRepository(Theme).findOne(themeId);
  if (theme === undefined) {
    return;
  }
  const updatedTheme = new Theme();
  updatedTheme.id = themeId;
  updatedTheme.order = newOrder;
  await getRepository(Theme).save(updatedTheme);
}

export class ThemesController extends Controller {
  constructor() {
    super("themes");
  }

  @get()
  public async getThemes(req: Request, res: Response): Promise<void> {
    const { query } = req;
    const params: Array<{ isPublished?: boolean; user?: { id: number } }> = [];
    if (query.isPublished !== undefined) {
      params.push({ isPublished: query.isPublished === "true" || query.isPublished === "" });
    }
    if ((query.userId !== undefined || query.user !== undefined) && req.user !== undefined) {
      params.push({ user: { id: req.user.id } });
    }
    const themes: Theme[] = await getRepository(Theme).find({ where: params });
    res.sendJSON(themes);
  }

  @get({ path: "/:id" })
  public async getTheme(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id: number = parseInt(req.params.id, 10) || 0;
    const theme: Theme | undefined = await getRepository(Theme).findOne(id);
    if (theme === undefined) {
      next(); // will send 404 error
      return;
    }
    res.sendJSON(theme);
  }

  @post({ userType: UserType.CLASS })
  public async addTheme(req: Request, res: Response): Promise<void> {
    const theme: Theme = new Theme(); // create a new theme
    theme.isPublished = req.body.isPublished || false;
    theme.names = req.body.names || {};
    theme.order = 0;
    theme.user = null;

    if (Object.keys(theme.names).length === 0) {
      throw new AppError("Theme names can't be empty", 0);
    }

    if (theme.isPublished) {
      const themeNb = await getRepository(Theme).count({ where: { isPublished: true } });
      theme.order = themeNb + 1;
    }

    if (req.body.userId !== undefined && req.user !== undefined) {
      theme.user = new User();
      theme.user.id = req.user.id;
    }

    await getRepository(Theme).save(theme); // save new theme
    res.sendJSON(theme); // send new theme
  }

  @put({ path: "/update-order", userType: UserType.PLMO_ADMIN })
  public async editThemesOrder(req: Request, res: Response): Promise<void> {
    const themesOrderPromises: Array<Promise<void>> = [];
    const themesOrder: [number] = req.body.themesOrder || [];

    for (let order = 0; order < themesOrder.length; order++) {
      themesOrderPromises.push(updateThemeOrder(themesOrder[order], order));
    }

    await Promise.all(themesOrderPromises);
    res.status(204).send();
  }

  @put({ path: "/:id", userType: UserType.PLMO_ADMIN })
  public async editTheme(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id: number = parseInt(req.params.id, 10) || 0;
    const theme: Theme | undefined = await getRepository(Theme).findOne(id);
    if (theme === undefined) {
      next();
      return;
    }

    theme.isPublished = req.body.isPublished || theme.isPublished;
    theme.names = req.body.names || theme.names;
    if (Object.keys(theme.names).length === 0) {
      throw new AppError("Theme names can't be empty", 0);
    }

    await getRepository(Theme).save(theme);
    res.sendJSON(theme); // send updated theme
  }

  @del({ path: "/:id", userType: UserType.PLMO_ADMIN })
  public async deleteTheme(req: Request, res: Response): Promise<void> {
    const id: number = parseInt(req.params.id, 10) || 0;
    await getRepository(Theme).delete(id);
    res.status(204).send();
  }

  // @oneImage({ path: "/:id/image", tableName: "themes", userType: UserType.PLMO_ADMIN })
  // public async addImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  //   if (req.imageID === undefined || req.image === undefined) {
  //     next();
  //     return;
  //   }

  //   const id: number = parseInt(req.params.id, 10) || 0;
  //   const theme: Theme | undefined = await getRepository(Theme).findOne(id, { relations: ["image"] });
  //   if (theme === undefined) {
  //     await getRepository(Image).delete(req.imageID);
  //     await deleteImage(req.image);
  //     next();
  //     return;
  //   }

  //   // delete previous image
  //   if (theme.image) {
  //     await deleteImage(theme.image);
  //     await getRepository(Image).delete(theme.image.id);
  //   }

  //   theme.image = req.image;
  //   await getRepository(Theme).save(theme);
  //   res.sendJSON(theme.image);
  // }

  // @del({ path: "/:id/image" })
  // public async deleteThemeImage(req: Request, res: Response): Promise<void> {
  //   const id: number = parseInt(req.params.id, 10) || 0;
  //   const theme: Theme | undefined = await getRepository(Theme).findOne(id, { relations: ["image"] });
  //   // if (theme !== undefined && theme.image) {
  //   //   await deleteImage(theme.image);
  //   //   await getRepository(Image).delete(theme.image.id);
  //   // }
  //   res.status(204).send();
  // }
}
