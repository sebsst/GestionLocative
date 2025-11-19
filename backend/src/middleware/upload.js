import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directories if they don't exist
const uploadsDir = path.join(__dirname, '../../uploads');
const worksDir = path.join(uploadsDir, 'works');
const propertiesDir = path.join(uploadsDir, 'properties');

// Ensure base uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(worksDir)) {
  fs.mkdirSync(worksDir, { recursive: true });
}
if (!fs.existsSync(propertiesDir)) {
  fs.mkdirSync(propertiesDir, { recursive: true });
}

// Configure storage for works
const worksStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, worksDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'work-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure storage for properties
const propertiesStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure directory exists
    if (!fs.existsSync(propertiesDir)) {
      fs.mkdirSync(propertiesDir, { recursive: true });
    }

    cb(null, propertiesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'property-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers PDF, JPG, PNG, DOC et DOCX sont autorisés'));
  }
};

// Create multer instances
export const uploadWork = multer({
  storage: worksStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter: fileFilter
});

export const uploadProperty = multer({
  storage: propertiesStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter: fileFilter
});

// Legacy export for backward compatibility
export const upload = uploadWork;
