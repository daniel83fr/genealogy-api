import LoggerService from '../services/logger_service';
import { PostgresConnector } from './postgresConnector';

export default class AuditController {
  logger: LoggerService = new LoggerService('auditController');

  getAuditLastEntries(number: number) {

    this.logger.debug('getAuditLastEntries');
    try {
      const connector = new PostgresConnector();
      return connector.getAuditEntries(number)
        .then((res: any) => res.map(AuditController.mappingFromDb))
        .catch((err: any) => {
          console.error(err);
          return [];
        });
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  static mappingFromDb(row: any) {
    return {

      type: row.type,
      user: row.user,
      action: row.action,
      timestamp: row.timestamp,
    };
  }
}
