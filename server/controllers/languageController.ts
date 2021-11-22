import { NextFunction, Request, Response } from "express";
import { getRepository } from "typeorm";

import { Language } from "../entities/language";
import { UserType } from "../entities/user";
import { uploadFile } from "../fileUpload";
import { fileToTranslations } from "../translations";

import { Controller, del, get, post, put, oneFile } from "./controller";

export class LanguageController extends Controller {
  constructor() {
    super("languages");
  }

  @get()
  public async getLanguages(_: Request, res: Response): Promise<void> {
    const languages: Language[] = await getRepository(Language).find();
    res.sendJSON(languages);
  }

  @get({ path: "/:id" })
  public async getLanguage(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id: string = req.params.id || "";
    const language: Language | undefined = await getRepository(Language).findOne(id);
    if (language === undefined) {
      next(); // will send 404 error
      return;
    }
    res.sendJSON(language);
  }

  @post({ userType: UserType.PLMO_ADMIN })
  public async addLanguage(req: Request, res: Response): Promise<void> {
    const language: Language = new Language(); // create a new language
    language.label = req.body.label;
    language.value = req.body.value;
    await getRepository(Language).save(language); // save new language
    res.sendJSON(language); // send new language
  }

  @put({ path: "/:id", userType: UserType.PLMO_ADMIN })
  public async editLanguage(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id: string = req.params.id || "";
    const language: Language | undefined = await getRepository(Language).findOne(id);
    if (language === undefined) {
      next();
      return;
    }
    language.label = req.body.label;
    language.value = req.body.value;
    await getRepository(Language).save(language);
    res.sendJSON(language); // send updated language
  }

  @del({ path: "/:id", userType: UserType.PLMO_ADMIN })
  public async deleteLanguage(req: Request, res: Response): Promise<void> {
    const id: string = req.params.id || "";
    await getRepository(Language).delete({ value: id });
    res.status(204).send();
  }

  @oneFile({ path: "/:value/po", userType: UserType.PLMO_ADMIN })
  public async addPOTranslations(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (!req.file?.buffer) {
      next();
      return;
    }
    const value = (req.params.value || "").slice(0, 2);
    const language: Language | undefined = await getRepository(Language).findOne({ where: { value } });
    if (language === undefined) {
      next();
      return;
    }

    const newTranslations = await fileToTranslations(req.file.buffer);
    await uploadFile(`locales/${language.value}.json`, Buffer.from(JSON.stringify(newTranslations), "utf-8"));
    res.sendJSON({ success: true });
  }
}
