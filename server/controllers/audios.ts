import path from 'path';
import { v4 as uuidv4 } from 'uuid';

import { uploadFile, deleteFile } from '../fileUpload';
import { streamFile } from '../fileUpload/streamFile';
import { AppError } from '../middlewares/handle-errors';
import { Controller } from './controller';

const audioController = new Controller('/audios');

audioController.get({ path: '/:filename' }, (req, res, next) => {
    streamFile('audios', req.params.filename, req, res, next);
});

audioController.upload({ path: '/', multerFieldName: 'audio' }, async (req, res) => {
    if (!req.file) {
        throw new AppError('badRequest', ["Error, 'audio' field is missing"]);
    }

    // 1- Get file name
    const uuid = uuidv4();
    const extension = path.extname(req.file.originalname).substring(1);
    const filename = `${uuid}.${extension}`;

    const url = await uploadFile('audios', filename, req.file.buffer);
    res.sendJSON({
        url,
    });
});

audioController.delete({ path: '/:filename' }, async (req, res) => {
    await deleteFile('audios', req.params.filename);
    res.status(204).send();
});

export { audioController };
