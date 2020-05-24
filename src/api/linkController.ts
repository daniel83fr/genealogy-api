import {
  MongoConnector, mongoDbDatabase, relationCollection,

} from './mongoDbConnector';

import LoggerService from '../services/logger_service';

const ObjectId = require('mongodb').ObjectID;


export default class LinkController {
  logger: LoggerService = new LoggerService('linkController');

  connector: MongoConnector;

  constructor(connector: MongoConnector) {
    this.connector = connector;
  }

  removeLink(id1: string, id2: string) {
    const objId1 = ObjectId(id1);
    const objId2 = ObjectId(id2);
    this.logger.info('Remove link');
    return this.connector.initClient()
      .then((client) => {
        const db = client.db(mongoDbDatabase);
        const query = { $or: [{ person1_id: objId1, person2_id: objId2 }, { person1_id: objId2, person2_id: objId1 }] };
        return this.connector.getItemFromMongoDbAndDb(db, relationCollection, query, {})
          .then((dataToDelete) => this.connector.deleteManyFromMongoDbAndDb(db, relationCollection, query)
            .then(() => this.connector.insertAudit(db, 'Relation', 'Remove link', [objId1, objId2], dataToDelete)))
          .then(() => {
            client.close();
            return `Deleted link between ${id1} and ${id2}`;
          });
      })
      .catch((err) => {
        throw err;
      });
  }

  removeSiblingLink(id1: string, id2: string) {
    const objId1 = ObjectId(id1);
    this.logger.info('Remove sibling link');

    return this.connector.initClient()
      .then((client) => {
        const db = client.db(mongoDbDatabase);
        return this.connector.getArrayFromMongoDbAndDb(db, relationCollection, { type: 'Parent', person2_id: objId1 }, {})
          .then((parents) => {
            client.close();
            console.log(JSON.stringify(parents));
            return parents.forEach((element: { person1_id: any; }) => this.removeLink(element.person1_id.toString(), id2));
          })
          .then(() => `Deleted siblings link between ${id1} and ${id2}`);
      })
      .catch((err) => {
        throw err;
      });
  }

  addParentLink(id: string, parentId: string) {
    this.logger.info('Add parent link');
    const objId = ObjectId(id);
    const objParentId = ObjectId(parentId);

    return this.connector.initClient()
      .then((client: any) => {
        const db = client.db(mongoDbDatabase);
        return this.connector.insertItem(db, relationCollection, { person1_id: objParentId, person2_id: objId, type: 'Parent' })
          .then((res) => this.connector.insertAudit(db, 'Relation', 'Add parent link', [ObjectId(parentId), ObjectId(id)], res))
          .then(() => {
            client.close();
            return `Added link between ${parentId} and ${id}`;
          });
      })
      .catch((err) => {
        throw err;
      });
  }

  addSpouseLink(id1: string, id2: string) {
    this.logger.info('Add spouse link');
    const objId1 = ObjectId(id1);
    const objId2 = ObjectId(id2);

    return this.connector.initClient()
      .then((client) => {
        const db = client.db(mongoDbDatabase);
        return this.connector.insertItem(db, relationCollection, { person1_id: objId1, person2_id: objId2, type: 'Spouse' })
          .then((res) => {
            this.connector.insertAudit(db, 'Relation', 'Add spouse link', [objId1, objId2], res);
          })
          .then(() => {
            client.close();
            return `Added link between ${id1} and ${id2}`;
          });
      })
      .catch((err) => {
        throw err;
      });
  }

  addSiblingLink(id1: string, id2: string) {
    this.logger.info('Add spouse link');

    return this.connector.initClient()
      .then((client) => {
        const db = client.db(mongoDbDatabase);
        return this.connector.getArrayFromMongoDbAndDb(db, relationCollection, { type: 'Parent', person2_id: ObjectId(id1) }, {})
          .then((parents) => {
            client.close();
            return parents.forEach(async (element: { person1_id: any; }) => this.addParentLink(id2, element.person1_id.toString()));
          });
      })
      .then(() => `Added link between ${id1} and ${id2}`)
      .catch((err) => { throw err; });
  }
}
