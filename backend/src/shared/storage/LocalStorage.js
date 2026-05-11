const fs = require('fs');
const path = require('path');
const StorageProvider = require('./StorageProvider');
const config = require('../../config');

class LocalStorage extends StorageProvider {
  constructor() {
    super();
    this.uploadDir = config.upload.dir;
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(file, destination) {
    const destDir = path.join(this.uploadDir, destination || '');
    const dir = path.dirname(destDir);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return file.filename || file.path;
  }

  async delete(filePath) {
    const fullPath = path.join(this.uploadDir, filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }

  getUrl(filePath) {
    return `/uploads/${filePath}`;
  }
}

module.exports = LocalStorage;
