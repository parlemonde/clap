import type { JSONSchemaType } from 'ajv';
import { getRepository } from 'typeorm';

import { Language } from '../entities/language';
import { UserType } from '../entities/user';
import { ajv, sendInvalidDataError } from '../lib/json-schema-validator';
import { Controller } from './controller';

const languageController = new Controller('/languages');

languageController.get({ path: '' }, async (_req, res) => {
    const languages = await getRepository(Language).find();
    res.sendJSON(languages);
});

type PostLanguageData = {
    label: string;
    value: string;
};
const POST_LANGUAGE_SCHEMA: JSONSchemaType<PostLanguageData> = {
    type: 'object',
    properties: {
        label: {
            type: 'string',
            maxLength: 30,
        },
        value: {
            type: 'string',
            minLength: 2,
            maxLength: 2,
        },
    },
    required: ['label', 'value'],
    additionalProperties: false,
};
const postLanguageValidator = ajv.compile(POST_LANGUAGE_SCHEMA);
languageController.post({ path: '', userType: UserType.ADMIN }, async (req, res, next) => {
    const user = req.user;
    if (user === undefined) {
        next();
        return;
    }

    const data = req.body;
    if (!postLanguageValidator(data)) {
        sendInvalidDataError(postLanguageValidator);
        return;
    }

    const newLanguage = new Language();
    newLanguage.label = data.label;
    newLanguage.value = data.value;
    await getRepository(Language).insert(newLanguage);
    res.sendJSON(newLanguage);
});

languageController.delete({ path: '/:value', userType: UserType.ADMIN }, async (req, res) => {
    await getRepository(Language).delete({ value: req.params.value || '' });
    res.status(204).send();
});

export { languageController };
