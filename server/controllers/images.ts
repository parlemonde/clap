import path from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

import { uploadFile, deleteFile } from '../fileUpload';
import { streamFile } from '../fileUpload/streamFile';
import { AppError } from '../middlewares/handle-errors';
import { Controller } from './controller';

const imageController = new Controller('/images');

imageController.get({ path: '/:filename' }, (req, res, next) => {
    streamFile('images', req.params.filename, req, res, next);
});

imageController.upload({ path: '/', multerFieldName: 'image' }, async (req, res) => {
    if (!req.file) {
        throw new AppError('badRequest', ["Error, 'image' field is missing"]);
    }

    // 1- Get file name
    const uuid = uuidv4();
    let extension = path.extname(req.file.originalname).substring(1);
    const needReFormat = !['jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension);
    if (needReFormat) {
        extension = 'jpeg';
    }
    const filename = `${uuid}.${extension}`;

    // 2- Resize image if needed to max width: 1920.
    //    Use `.rotate()` to keep original image orientation metadata.
    const imageProcess = sharp(req.file.buffer).rotate().resize(1920, null, {
        withoutEnlargement: true,
    });
    const imageBuffer = await imageProcess.toBuffer();
    const url = await uploadFile('images', filename, imageBuffer);
    res.sendJSON({
        url,
    });
});

imageController.delete({ path: '/:filename' }, async (req, res) => {
    await deleteFile('images', req.params.filename);
    res.status(204).send();
});

export { imageController };
