const prisma = require('../../config/database');

class BaseRepository {
  constructor(modelName) {
    this.model = prisma[modelName];
    this.modelName = modelName;
  }

  async findMany(params = {}) {
    return this.model.findMany(params);
  }

  async findUnique(params) {
    return this.model.findUnique(params);
  }

  async findFirst(params) {
    return this.model.findFirst(params);
  }

  async count(params = {}) {
    return this.model.count(params);
  }

  async create(params) {
    return this.model.create(params);
  }

  async update(params) {
    return this.model.update(params);
  }

  async delete(params) {
    return this.model.delete(params);
  }

  async upsert(params) {
    return this.model.upsert(params);
  }

  async aggregate(params) {
    return this.model.aggregate(params);
  }

  async groupBy(params) {
    return this.model.groupBy(params);
  }
}

module.exports = BaseRepository;
