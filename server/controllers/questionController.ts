import { NextFunction, Request, Response } from "express";
import { getRepository } from "typeorm";

import { Project } from "../entities/project";
import { Question } from "../entities/question";
import { Scenario } from "../entities/scenario";
import { Sound } from "../entities/sound";
import { UserType } from "../entities/user";

import { Controller, del, get, post, put } from "./controller";

function getOptions(req: Request): { isDefault?: boolean; scenarioId?: number; languageCode?: string } {
  const isDefault: string | undefined = (req.query.isDefault as string | undefined) || undefined;
  const scenarioId: number | undefined = parseInt((req.query.scenarioId as string | undefined) || "", 10) || undefined;
  const languageCode: string | undefined = (req.query.languageCode as string | undefined) || undefined;

  const where: { isDefault?: boolean; scenarioId?: number; languageCode?: string } = {};
  if (isDefault !== undefined) {
    where.isDefault = isDefault === "true";
  }
  if (scenarioId !== undefined) {
    where.scenarioId = scenarioId;
  }
  if (languageCode !== undefined) {
    where.languageCode = languageCode;
  }

  return where;
}

async function updateQuestionOrder(questionId: number, newOrder: number, userType: UserType): Promise<void> {
  const question: Question | undefined = await getRepository(Question).findOne(questionId);
  if (question === undefined || (question.isDefault && userType < UserType.PLMO_ADMIN)) {
    return;
  }
  await getRepository(Question).update(questionId, { index: newOrder });
}

export class QuestionController extends Controller {
  constructor() {
    super("questions");
  }

  @get()
  public async getQuestions(req: Request, res: Response): Promise<void> {
    const options = {
      where: getOptions(req),
      order: { isDefault: "DESC" as const, index: "ASC" as const },
    };
    const questions = await getRepository(Question).find(options);
    res.sendJSON(questions);
  }

  @get({ path: "/:id" })
  public async getQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id = parseInt(req.params.id || "", 10) || 0;
    const options = {
      where: { id, ...getOptions(req) },
    };
    const question = await getRepository(Question).findOne(options);
    if (question === undefined) {
      next();
      return;
    }
    res.sendJSON(question);
  }

  @post({ userType: UserType.CLASS })
  public async addQuestion(req: Request, res: Response): Promise<void> {
    const scenarioId = parseInt(req.body.scenarioId || "", 10) || 0;
    const languageCode = req.body.languageCode || "";

    const scenario: Scenario | undefined = await getRepository(Scenario).findOne({
      where: { id: scenarioId, languageCode },
    });
    if (scenario === undefined) {
      throw new Error("Scenario not found !");
    }

    const q: string = (req.body.question || "").slice(0, 280);
    if (q.length === 0) {
      throw new Error("Question is empty !");
    }

    const question: Question = new Question();
    question.languageCode = scenario.languageCode;
    question.scenarioId = scenario.id;
    question.isDefault = req.body.isDefault !== undefined ? req.body.isDefault : false;
    question.question = q;
    question.index = req.body.index || 0;

    if (req.body.projectId !== undefined) {
      question.project = new Project();
      question.project.id = req.body.projectId;
    }

    await getRepository(Question).save(question);
    res.sendJSON(question);
  }

  @put({ path: "/update-order", userType: UserType.CLASS })
  public async editThemesOrder(req: Request, res: Response): Promise<void> {
    const questionsOrderPromises: Array<Promise<void>> = [];
    const questionsOrder: [number] = req.body.order || [];

    for (let order = 0; order < questionsOrder.length; order++) {
      questionsOrderPromises.push(updateQuestionOrder(questionsOrder[order], order, req.user?.type || UserType.CLASS));
    }

    await Promise.all(questionsOrderPromises);
    res.status(204).send();
  }

  @put({ path: "/:id", userType: UserType.CLASS })
  public async editQuestion(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id || "", 10) || 0;
    const question: Question | undefined = await getRepository(Question).findOne({
      where: { id },
    });
    if (question === undefined) {
      throw new Error("Question not found !");
    }

    question.id = id;
    if (req.body.isDefault !== undefined) {
      question.isDefault = req.body.isDefault;
    }
    if (req.body.question !== undefined && req.body.question.length > 0) {
      question.question = (req.body.question || "").slice(0, 280);
    }
    if (req.body.index !== undefined) {
      question.index = req.body.index;
    }
    if (req.body.voiceOff !== undefined) {
      question.voiceOff = (req.body.voiceOff || "").slice(0, 280);
    }
    if (req.body.voiceOffBeginTime !== undefined && req.body.voiceOffBeginTime.length > 0) {
      question.voiceOffBeginTime = req.body.voiceOffBeginTime;
    }
    if (req.body.soundId !== undefined) {
      question.sound = new Sound();
      question.sound.id = req.body.soundId;
    }
    await getRepository(Question).save(question);
    res.sendJSON(question);
  }

  @del({ path: "/:id", userType: UserType.CLASS })
  public async deleteQuestion(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id || "", 10) || 0;
    await getRepository(Question).delete({ id });
    res.status(204).send();
  }
}
