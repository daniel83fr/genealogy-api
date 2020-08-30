import LoggerService from '../services/logger_service';

export default class SettingController {
  logger: LoggerService = new LoggerService('settingController');

  getVersion() {
    this.logger.info('get version'); 
    return process.env.VERSION;
  }
}
