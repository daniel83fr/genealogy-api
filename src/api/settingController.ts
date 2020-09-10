import LoggerService from '../services/logger_service';

export default class SettingController {
  logger: LoggerService = new LoggerService('settingController');

  getVersion() {
    this.logger.info('get version');
    return process.env.VERSION;
  }

  about() {
    this.logger.info('about');
    return {
      version: this.getVersion(),
      name: 'Genealogy Api',
      date: new Date()
    }
  }
}
