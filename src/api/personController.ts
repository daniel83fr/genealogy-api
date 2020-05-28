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
import PhotoController from './photoController';

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
        profileId: element?.profileId,
      };
    }

    getPersonList(cacheCount: number, cacheDate: string) {
      this.logger.info('Get person list');
      this.logger.info(cacheCount?.toString());
      this.logger.info(JSON.stringify(cacheDate));

      const query = {};
      const projection = {
        firstName: 1,
        lastName: 1,
        maidenName: 1,
        birthDate: 1,
        gender: 1,
        deathDate: 1,
        isDead: 1,
        profileId: 1,
      };

      return this.connector.initClient()
        .then((client) => {
          const db = client.db(mongoDbDatabase);

          return this.connector.getLastUpdate(db, memberCollection)
            .then((lastUpdate) => {
              console.log(`cache: ${cacheDate}, lastUpdate: ${lastUpdate}`);
              if (lastUpdate > cacheDate || cacheDate == undefined) {
                return true;
              }

              return this.connector.getCollectionSize(db, memberCollection)
                .then((count) => count != cacheCount);
            })
            .then((shouldUpdate) => {
              client.close();
              if (shouldUpdate == true) {
                console.log(`should update: ${shouldUpdate}`);
                return this.connector.getArrayFromMongoDb(mongoDbDatabase, memberCollection, query, projection)
                  .then((res: any[]) => res.map(PersonController.mapping))
                  .then((res) => res.sort(PersonController.sortByName))
                  .then((res) => ({ isUpToDate: false, users: res }));
              }
              return { isUpToDate: true };
            });
        });
    }

    async getProfile(_id: string) {
      console.log(_id);

      const client = await this.connector.initClient();
      const db = client.db(mongoDbDatabase);

      let profileId = await this.getProfileId(_id, db);
      if (profileId == null) {
        profileId = _id;
      }
      const data:any = {};
      data.currentPerson = await this.getPerson(profileId, db);
      data.mother = await this.getParent(profileId, 'Female', db);
      data.father = await this.getParent(profileId, 'Male', db);
      data.siblings = await this.getSiblings(profileId, db);
      data.children = await this.getChildren(profileId, db);
      data.spouses = await this.getSpouses(profileId, db);

      const photoController = new PhotoController(this.connector);
      data.photos = await photoController.getPhotosById(profileId, db);
      client.close();
      return data;
    }

    getProfileId(profileId: string, db: any) {
      let query = { 'profileId' : `${profileId}` };
      return this.connector.getItemFromMongoDbAndDb(db, memberCollection, query, {})
        .catch(() =>{
          return profileId
        })
        .then((res: any) => {
          console.log(JSON.stringify(res));
          if (res == null) {
            return profileId;
          }
          return `${res._id}`;
        });
    }

      async getPrivateProfile(_id: string, user: any) {
        const client = await this.connector.initClient();
        const db = client.db(mongoDbDatabase);
  
        let profileId = await this.getProfileId(_id, db);
        if (profileId == null) {
          profileId = _id;
        }

    console.log(_id)

    
      return this.getProfileId(_id, db)
        .then((res)=>{
          
          let profile = res;

          if (res == null) {
            profile = _id;
          }
  
          this.logger.info('Get private infos by id');


         PersonController.CheckUserAuthenticated(user);
          const query = { _id: ObjectId(profile) }
          const projection = {};
          return this.connector.getItemFromMongoDb(mongoDbDatabase, memberCollection, query, projection)
            .catch((err: any) => {
              throw err;
            })
            .then(res=>res);
        });
    }
    getPerson(_id: string, db: any) {
      this.logger.info('Get person by Id');

      const query = { _id: ObjectId(_id) };
      const projection = {};

      return this.connector.getItemFromMongoDbAndDb(db, memberCollection, query, projection)
        .catch((err: any) => {
          throw err;
        })
        .then((res: any) => PersonController.mapping(res));
    }

    getParent(_id: string, gender: string, db: any) {
      this.logger.info(`Get ${gender === 'Male' ? 'Father' : 'Mother'} by id `);

      return getParentByIdFromMongoDb(_id, gender, db)
        .catch((err: any) => {
          throw err;
        })
        .then((res: object) => PersonController.mapping(res));
    }

    getChildren(_id: string, db:any) {
      this.logger.info('Get children by id');

      return getChildrenByIdFromMongoDb(_id, db)
        .catch((err: any) => {
          throw err;
        })
        .then((res: any[]) => res.map(PersonController.mapping))
        .then((res) => res.sort(PersonController.sortByYearOfBirth));
    }

    getSpouses(_id: string, db: any) {
      this.logger.info('Get spouses by id');

      return getSpousesByIdFromMongoDb(_id, db)
        .catch((err) => {
          throw err;
        })
        .then((res) => res.map(PersonController.mapping));
    }

    static sortByYearOfBirth(a:any, b:any) {
      const keyA = new Date(a.yearOfBirth);
      const keyB = new Date(b.yearOfBirth);
      if (keyA < keyB) return -1;
      if (keyA > keyB) return 1;
      return 0;
    }

    static sortByName(a:any, b:any) {
      const keyA = `${a.lastName ?? ''} ${a.firstName ?? ''}`;
      const keyB = `${b.lastName ?? ''} ${b.firstName ?? ''}`;
      if (keyA < keyB) return -1;
      if (keyA > keyB) return 1;
      return 0;
    }

    getSiblings(_id: string, db: any) {
      this.logger.info('Get siblings by id');

      return getSiblingsByIdFromMongoDb(_id, db)
        .catch((err) => {
          throw err;
        })
        .then((res) => res.map(PersonController.mapping))
        .then((res) => res.sort(PersonController.sortByYearOfBirth));
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
        console.log(patch)
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
