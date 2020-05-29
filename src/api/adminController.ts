import LoggerService from '../services/logger_service';
import {
  MongoConnector, mongoDbDatabase, auditCollection, memberCollection, credentialsCollection,
} from './mongoDbConnector';
export const ObjectId = require('mongodb').ObjectID;

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




            console.log(JSON.stringify(users));

            return this.connector.getArrayFromMongoDb(mongoDbDatabase, memberCollection, {}, {})
             .then((m: any[]) => {
              let dico:any = {};
              
                m.forEach(i=>{
                  let id1 = i._id.toString();
                  dico[id1] = i.firstName;

                });
              
                items.forEach((x:any)=> {
                  x.user =dico[x.user];
                  x.id =dico[x.id];
                });
                return items;
               
              });
          });
      })
      .catch((err) => { throw err; });
  }
}
