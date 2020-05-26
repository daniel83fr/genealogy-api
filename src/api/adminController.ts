import LoggerService from '../services/logger_service';
import {
  MongoConnector, mongoDbDatabase, auditCollection, memberCollection, credentialsCollection, ObjectId,
} from './mongoDbConnector';


export default class AdminController {
  logger: LoggerService = new LoggerService('adminController');

  connector: MongoConnector;

  constructor(connector: MongoConnector) {
    this.connector = connector;
  }

  runMassUpdate() {
    this.logger.info('Run mass update');
    return;
    return this.connector.initClient()
      .then((client) => {
        const db = client.db(mongoDbDatabase);
        const members = db.collection(memberCollection);
        const credentials = db.collection(credentialsCollection);
        credentials.find({}).toArray().then(
          (res: any[]) => {
            res.forEach((element) => {
              members.updateOne({ _id: ObjectId(element.id) }, { $set: { profileId: element.login } });
            });
          },
        );


        return 'Done';
      })
      .catch((err) => { throw err; });
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
