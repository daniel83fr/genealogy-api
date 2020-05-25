import LoggerService from '../services/logger_service';
import {
  MongoConnector, mongoDbDatabase, auditCollection,
} from './mongoDbConnector';


export default class PhotoController {
  logger: LoggerService = new LoggerService('photoController');

  connector: MongoConnector;

  constructor(connector: MongoConnector) {
    this.connector = connector;
  }

  getAuditLastEntries(number: number) {
    this.logger.info('Get Audit');

    return this.connector.initClient()
      .then((client) => {
        const db = client.db(mongoDbDatabase);
        const query = {};
        const projection = {
          timestamp: 1,
          type: 1,
          id: 1,
          user: 1,
        };
        return db.collection(auditCollection).find(query, projection)
          .sort({ _id: 1 })
          .limit(number)
          .toArray()
          .then((res: any) => {
            client.close();
            return res;
          });
      })
      .catch((err) => { throw err; });
  }
}
