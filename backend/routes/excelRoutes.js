const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { importExcelData } = require('../services/excelImportService');

// Configure multer for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `upload-${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.xlsx' || ext === '.xls' || ext === '.csv') {
      cb(null, true);
    } else {
      cb(new Error('Only Excel/CSV files are allowed'));
    }
  }
});

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const io = req.app.get('io');
    const results = await importExcelData(req.file.path, io);

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({ 
      message: 'Import completed', 
      details: results 
    });
  } catch (error) {
    res.status(500).json({ message: 'Import failed', error: error.message });
  }
});

module.exports = router;
