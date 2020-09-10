import LoggerService from '../services/logger_service';

export default class SettingController {
  logger: LoggerService = new LoggerService('settingController');

  about() {
    this.logger.info('about');
    return {
      version: process.env.VERSION,
      name: 'Genealogy Api',
      author: 'Daniel Manuelpillai',
      contact: 'daniel83fr@gmail.com',
      date: new Date()
    }
  }
}
