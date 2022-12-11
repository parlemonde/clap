import path from 'path';
import { v4 as uuidv4 } from 'uuid';

import { uploadFile, deleteFile } from '../fileUpload';
import { streamFile } from '../fileUpload/streamFile';
import { AppError } from '../middlewares/handle-errors';
import { Controller } from './controller';

const audioController = new Controller('/audios');

audioController.get({ path: '/:filename' }, (req, res, next) => {
    const fileurl = `audios/${req.params.filename}`;
    streamFile(fileurl, req, res, next);
});

audioController.upload({ path: '/', multerFieldName: 'audio' }, async (req, res) => {
    if (!req.file) {
        throw new AppError('badRequest', ["Error, 'audio' field is missing"]);
    }

    // 1- Get file name
    const uuid = uuidv4();
    const extension = path.extname(req.file.originalname).substring(1);
    const filename = `audios/${uuid}.${extension}`;

    const url = await uploadFile(filename, req.file.buffer);
    res.sendJSON({
        url,
    });
});

audioController.delete({ path: '/:filename' }, async (req, res) => {
    const fileurl = `audios/${req.params.filename}`;
    await deleteFile(fileurl);
    res.status(204).send();
});

export { audioController };
