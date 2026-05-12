const SystemSettingRepository = require('./setting.repository');

class SettingService {
  static async list(isAdmin) {
    const where = isAdmin ? {} : { isPublic: true };
    return SystemSettingRepository.findMany({ where, orderBy: { key: 'asc' } });
  }

  static async create(data) {
    return SystemSettingRepository.create({ data });
  }

  static async update(id, data) {
    return SystemSettingRepository.update({ where: { id: parseInt(id) }, data });
  }

  static async delete(id) {
    return SystemSettingRepository.delete({ where: { id: parseInt(id) } });
  }
}

module.exports = SettingService;
