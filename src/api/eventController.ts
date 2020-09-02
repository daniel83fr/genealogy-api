import LoggerService from '../services/logger_service';
import { PostgresConnector } from './postgresConnector';

export default class EventController {
  logger: LoggerService = new LoggerService('eventController');

  async getEvents(date: string) {
    const from = new Date(date);
    this.logger.debug('getEvents');
    try {
      const connector = new PostgresConnector();
      return connector.GetEvents(from)
        .then((res: any) => {
          return res.map(EventController.mappingFromDb);
        })
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
      _id: row.id,
      type: row.type,
      anniversary: row.anniversary,
      year: row.year,
      month: row.month,
      day: row.month,
      firstName: row.first_name,
      lastName: row.last_name,
      profileId: row.profile_id ?? row.id,
    };
  }
}
