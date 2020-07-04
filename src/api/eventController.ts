import LoggerService from "../services/logger_service";
import { MongoConnector, getTodayBirthdaysFromMongoDb, getTodayDeathdaysFromMongoDb, getTodayMarriagedaysFromMongoDb } from "./mongoDbConnector";
import LoginController from "./loginController";

export default class EventController {
  logger: LoggerService = new LoggerService('eventController');

  connector: MongoConnector;

  constructor(connector: MongoConnector) {
    this.connector = connector;
  }

  getTodayBirthdays(user: any) {
    LoginController.CheckUserAuthenticated(user);

    return getTodayBirthdaysFromMongoDb()
      .catch((err: any) => {
        throw err;
      })
      .then((res: any) => res);
  }

  getTodayDeathdays(user: any) {
    LoginController.CheckUserAuthenticated(user);

    return getTodayDeathdaysFromMongoDb()
      .catch((err: any) => {
        throw err;
      })
      .then((res: any) => res);
  }

  getTodayMarriagedays(user: any) {
    LoginController.CheckUserAuthenticated(user);
    return getTodayMarriagedaysFromMongoDb()
      .catch((err: any) => {
        throw err;
      })
      .then((res: any) => res);
  }

}
