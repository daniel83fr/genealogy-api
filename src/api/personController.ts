import {
  memberCollection,
  mongoDbDatabase,
  getParentByIdFromMongoDb,
  getChildrenByIdFromMongoDb,
  getSpousesByIdFromMongoDb,
  getSiblingsByIdFromMongoDb,
  MongoConnector,
  updatePersonFromMongoDb,
  createPersonFromMongoDb,
  deleteProfileFromMongoDb,

} from './mongoDbConnector';

import LoggerService from '../services/logger_service';
import LoginController from './loginController';

const ObjectId = require('mongodb').ObjectID;


export default class PersonController {
    logger: LoggerService = new LoggerService('personController');

    connector: MongoConnector;

    constructor(connector: MongoConnector) {
      this.connector = connector;

      if (this.connector === undefined) {
        throw Error('connector undefined1');
      }
    }


    static mapping(element: any) {
      const yearOfBirth = element?.birthDate?.substring(0, 4);
      const yearOfDeath = element?.deathDate?.substring(0, 4);
      return {
        _id: element?._id,
        firstName: element?.firstName,
        lastName: element?.lastName,
        maidenName: element?.maidenName,
        gender: element?.gender,
        yearOfBirth: yearOfBirth === '0000' ? null : yearOfBirth,
        yearOfDeath: yearOfDeath === '0000' ? null : yearOfDeath,
        isDead: element?.isDead ?? false,
      };
    }

    getPersonList() {
      this.logger.info('Get person list');

      const query = {};
      const projection = {
        firstName: 1,
        lastName: 1,
        maidenName: 1,
        birthDate: 1,
        gender: 1,
        deathDate: 1,
        isDead: 1,
      };

      return this.connector.getArrayFromMongoDb(mongoDbDatabase, memberCollection, query, projection)
        .then((res: any[]) => res.map(PersonController.mapping));
    }

    getPerson(_id: string) {
      this.logger.info('Get person by Id');

      const query = { _id: ObjectId(_id) };
      const projection = {};

      return this.connector.getItemFromMongoDb(mongoDbDatabase, memberCollection, query, projection)
        .catch((err: any) => {
          throw err;
        })
        .then((res: any) => PersonController.mapping(res));
    }

    getParent(_id: string, gender: string) {
      this.logger.info(`Get ${gender === 'Male' ? 'Father' : 'Mother'} by id `);

      return getParentByIdFromMongoDb(_id, gender)
        .catch((err: any) => {
          throw err;
        })
        .then((res: object) => PersonController.mapping(res));
    }

    getChildren(_id: string) {
      this.logger.info('Get children by id');

      return getChildrenByIdFromMongoDb(_id)
        .catch((err: any) => {
          throw err;
        })
        .then((res: any[]) => res.map(PersonController.mapping));
    }

    getSpouses(_id: string) {
      this.logger.info('Get spouses by id');

      return getSpousesByIdFromMongoDb(_id)
        .catch((err) => {
          throw err;
        })
        .then((res) => res.map(PersonController.mapping));
    }

    getSiblings(_id: string) {
      this.logger.info('Get siblings by id');

      return getSiblingsByIdFromMongoDb(_id)
        .catch((err) => {
          throw err;
        })
        .then((res) => res.map(PersonController.mapping));
    }

    getPrivateInfo(_id: string, user: any) {
      this.logger.info('Get private infos by id');
      PersonController.CheckUserAuthenticated(user);
      const query = { _id: ObjectId(_id) };
      const projection = {};
      return this.connector.getItemFromMongoDb(mongoDbDatabase, memberCollection, query, projection)
        .catch((err: any) => {
          throw err;
        })
        .then((res: any) => PersonController.mapping(res));
    }

    static CheckUserAuthenticated(user: any) {
      if (!user) {
        throw Error('Not authenticated, please login first');
      }
    }

    removeProfile(id: string) {
      this.logger.info('Remove profile');
      return deleteProfileFromMongoDb(id)
        .catch((err: any) => {
          throw err;
        })
        .then((res: any) => res);
    }


    updatePerson(_id: string, patch: any) {
      if (patch === {}) {
        return null;
      }
      this.logger.info('UpdatePersons');

      this.logger.info(_id);
      this.logger.info(JSON.stringify(patch));

      return updatePersonFromMongoDb(_id, patch)
        .catch((err) => {
          throw err;
        })
        .then((res: any) => res);
    }

    createPerson(person: any) {
      this.logger.info('Create Person');

      return createPersonFromMongoDb(person)
        .catch((err) => {
          throw err;
        })
        .then((res: any) => res);
    }

    updatePersonPrivateInfo(_id: string, patch: any, user: any) {
      if (patch === {}) {
        return null;
      }
      LoginController.CheckUserAuthenticated(user);
      this.logger.info('UpdatePersonspivate');
  
      this.logger.info(_id);
      this.logger.info(JSON.stringify(patch));
  
      return updatePersonFromMongoDb(_id, patch)
        .catch((err) => {
          throw err;
        })
        .then((res: any) => res);
    }
}
