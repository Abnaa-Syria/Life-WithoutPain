class StorageProvider {
  async upload(file, destination) { throw new Error('Not implemented'); }
  async delete(filePath) { throw new Error('Not implemented'); }
  getUrl(filePath) { throw new Error('Not implemented'); }
}

module.exports = StorageProvider;
