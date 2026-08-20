import multer from 'multer';
import path from 'path';
import { generateId } from '../utils/id.js';
import config from '../config/index.js';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/csv',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, config.uploads.dir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${generateId()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.uploads.maxFileSize },
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
      if (err.message === 'Type de fichier non autorisé.') {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_FILE_TYPE', message: 'Type de fichier non autorisé.' },
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
