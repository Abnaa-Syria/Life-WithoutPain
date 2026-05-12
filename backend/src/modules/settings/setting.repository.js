const BaseRepository = require('../../shared/repositories/BaseRepository');

class SystemSettingRepository extends BaseRepository {
  constructor() {
    super('systemSetting');
  }
}
module.exports = new SystemSettingRepository();
