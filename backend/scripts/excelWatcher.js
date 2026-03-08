const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');
const { importExcelData } = require('../services/excelImportService');

/**
 * Initializes a file watcher for a specific directory.
 * When an Excel file is added or modified, it triggers the import service.
 */
const initExcelWatcher = (io) => {
  // Use a relative path from the processed location
  const watchDir = path.join(__dirname, '../../excel-imports');
  
  if (!fs.existsSync(watchDir)) {
    fs.mkdirSync(watchDir, { recursive: true });
    console.log(`Watcher: Created directory ${watchDir}`);
  }

  const watcher = chokidar.watch(watchDir, {
    ignored: [
      /(^|[\/\\])\../, // ignore dotfiles
      /~\$.*/          // ignore Excel temporary files
    ],
    persistent: true,
    awaitWriteFinish: {
      stabilityThreshold: 1000,
      pollInterval: 100
    }
  });

  watcher.on('add', async (filePath) => {
    if (filePath.endsWith('.xlsx')) {
      console.log(`Watcher: New file detected - ${filePath}`);
      try {
        const results = await importExcelData(filePath, io);
        console.log('Watcher: Auto-import results:', results);
      } catch (err) {
        console.error('Watcher: Auto-import failed', err);
      }
    }
  });

  watcher.on('change', async (filePath) => {
    if (filePath.endsWith('.xlsx')) {
      console.log(`Watcher: File changed - ${filePath}`);
      try {
        const results = await importExcelData(filePath, io);
        console.log('Watcher: Auto-sync results:', results);
      } catch (err) {
        console.error('Watcher: Auto-sync failed', err);
      }
    }
  });

  console.log(`Watcher: Monitoring ${watchDir} for student data updates...`);
  
  return watcher;
};

module.exports = { initExcelWatcher };
