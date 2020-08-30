import LoggerService from '../services/logger_service';
import {
  MongoConnector,
  mongoDbDatabase,
  auditCollection,
  memberCollection,
} from './mongoDbConnector';

export const ObjectId = require('mongodb').ObjectID;

export default class AuditController {
  logger: LoggerService = new LoggerService('auditController');

  connector: MongoConnector;

  constructor(connector: MongoConnector) {
    this.connector = connector;
  }

  getAuditLastEntries(number: number) : Promise<any> {
    // Get Last updates:
    // - profiles
    // - links
    // - photos
    return this.connector.initClient()
      .then((client) => {
        const db = client.db(mongoDbDatabase);
        const query = {};
        return db.collection(auditCollection).find(query, {})
          .sort({ _id: -1 })
          .limit(number)
          .toArray()
          .then((res: any[]) => {
            client.close();
            let items: any[] = [];
            let users: any[] = [];
            res.forEach(x => {
              let elm: any = {};
              elm.user = x.payload.updatedBy;
              users.push(ObjectId(elm.user));
              elm.id = x.id.toString();
              users.push(x.id);
              elm.timestamp = x.timestamp;
              elm.action = x.action;
              items.push(elm);
            });

            return this.connector.getArrayFromMongoDb(mongoDbDatabase, memberCollection, {}, {})
             .then((m: any[]) => {
              let dico:any = {};
                m.forEach(i=>{
                  let id1 = i._id.toString();
                  dico[id1] = i.firstName;

                });
                items.forEach((x:any)=> {
                  x.user = dico[x.user];
                  x.id = dico[x.id];
                });
                return items;
              });
          });
      })
      .catch((err) => { throw err; });
  }
}
