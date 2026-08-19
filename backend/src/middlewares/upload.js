import multer from 'multer';
import path from 'path';
import { generateId } from '../utils/id.js';

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${generateId()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 },
});

export function parseDocumentUpload(req, res, next) {
  const uploadMiddleware = upload.array('files', 20);

  uploadMiddleware(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: { code: 'FILE_TOO_LARGE', message: 'Un fichier dépasse la taille maximale autorisée.' },
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          error: { code: 'TOO_MANY_FILES', message: 'Trop de fichiers.' },
        });
      }
      return next(err);
    }

    if (req.body.payload && typeof req.body.payload === 'string') {
      try {
        req.body = JSON.parse(req.body.payload);
      } catch {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_PAYLOAD', message: 'Payload invalide.' },
        });
      }
    }

    next();
  });
}
