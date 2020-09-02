import LoggerService from "../services/logger_service";
import { MongoConnector, getTodayBirthdaysFromMongoDb, getTodayDeathdaysFromMongoDb, getTodayMarriagedaysFromMongoDb, getEventsFromMongoDb, mongoDbDatabase } from "./mongoDbConnector";
import LoginController from "./loginController";
import { PostgresConnector } from "./postgresConnector";

export default class EventController {
  logger: LoggerService = new LoggerService('eventController');

  connector: MongoConnector;

  constructor(connector: MongoConnector) {
    this.connector = connector;
  }

  async getEvents(date: string) {
    console.log(date)

    var from = new Date(date);
    console.log(from.toString())
    this.logger.debug('getEvents');
    try {
      const connector = new PostgresConnector();
      return connector.GetEvents(from)
        .then((res: any) => {
          let dataNew = res.map(EventController.mappingFromDb);
         
          return dataNew;
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
