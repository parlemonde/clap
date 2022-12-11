import type { DefinedError, ValidateFunction } from 'ajv';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

import { AppError } from '../middlewares/handle-errors';

const ajv = new Ajv({ allowUnionTypes: true });
addFormats(ajv);

const sendInvalidDataError = (validateFunction: ValidateFunction<unknown>): void => {
    const errors = validateFunction.errors as DefinedError[];
    const errorMsgs = [];
    for (const error of errors) {
        errorMsgs.push(error.schemaPath + ' ' + (error.message || ''));
    }
    throw new AppError('badRequest', errorMsgs);
};

export { ajv, sendInvalidDataError };
