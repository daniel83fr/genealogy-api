import {
  memberCollection,
  mongoDbDatabase,
  MongoConnector,
  updatePersonFromMongoDb,
  createPersonFromMongoDb,
  deleteProfileFromMongoDb,

} from './mongoDbConnector';
import ProfileService from '../services/profile_service';
import CacheService from '../services/cache_service';

import LoggerService from '../services/logger_service';
import LoginController from './loginController';
import { PostgresConnector } from './postgresConnector';

const ObjectId = require('mongodb').ObjectID;

export const cacheFolder = '../cache';

export default class PersonController {

  logger: LoggerService = new LoggerService('personController');

  profileService: ProfileService = new ProfileService();

  cacheService: CacheService = new CacheService(cacheFolder);

  connector: MongoConnector;

  constructor(connector: MongoConnector, cacheService: CacheService | undefined = undefined) {
    this.connector = connector;

    if (this.connector === undefined) {
      throw Error('connector undefined');
    }

    if (cacheService !== undefined) {
      this.cacheService = cacheService;
    }
  }

  static mapping(element: any) {
    const yearOfBirth = element?.birth?.year;
    const yearOfDeath = element?.death?.year;
    return {
      _id: element?._id,
      firstName: element?.firstName,
      lastName: element?.lastName,
      maidenName: element?.maidenName,
      gender: element?.gender,
      yearOfBirth: yearOfBirth === '0000' ? null : yearOfBirth,
      yearOfDeath: yearOfDeath === '0000' ? null : yearOfDeath,
      monthOfBirth: element?.birth?.month,
      monthOfDeath: element?.death?.month,
      dayOfBirth: element?.birth?.day,
      dayOfDeath: element?.death?.day,
      isDead: element?.isDead ?? false,
      profileId: element?.profileId,
    };
  }

  static mappingFromDb(row: any) {

    return {
      _id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      maidenName: row.maiden_name,
      gender: row.gender,
      yearOfBirth: row.year_of_birth,
      yearOfDeath: row.year_of_death,
      isDead: row.is_dead ?? false,
      profileId: row.profile_id ?? row.id,
    };
  }

  searchPerson(filter: string, page: number = 1, pageSize: number = 20) {
    this.logger.debug('searchPerson');
    try {
      const connector = new PostgresConnector();
      return connector.GetPersonList(filter, page, pageSize)
        .then((res: any) => {
          let dataNew = res.map(PersonController.mappingFromDb);
          dataNew = dataNew.sort(PersonController.sortByName);
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

  getPersonList() {
    const cache = this.cacheService.getPersonListCache();
    if (cache !== undefined) {
      this.logger.debug('getPersonList from cache');
      return cache;
    }

    try {
      const connector = new PostgresConnector();

      return connector.GetPersonList()
        .then((res: any) => {
          let dataNew = res.map(PersonController.mappingFromDb);
          dataNew = dataNew.sort(PersonController.sortByName);
          this.cacheService.setPersonListCache(dataNew);
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

  async getProfile(_id: string) {

    const cache = this.cacheService.getProfileCache(_id);
    if (cache !== undefined) {
      this.logger.debug('getProfile from cache');
      return cache;
    }

    const client = await this.connector.initClient();
    try {
      const db = client.db(mongoDbDatabase);
      const data: any = await this.profileService.getProfileByIdFromMongoDb(_id, db);
      client.close();

      this.cacheService.setProfileCache(_id, data);

      return data;
    } catch (err) {
      client.close();
      console.log(err);
      return {};
    }
  }

  async getPrivateProfile(_id: string, user: any) {
    const client = await this.connector.initClient();
    const db = client.db(mongoDbDatabase);

    this.logger.info('Get private infos by id');

    const validGuid = new RegExp('^[0-9a-fA-F]{24}$').test(_id);
    let query = {};
    if (validGuid) {
      query = { "$or": [{ "profileId": _id }, { "_id": ObjectId(_id) }] }
    } else {
      query = { "profileId": _id }
    }

    const projection = {};

    let res1: any = await this.connector.getItemFromMongoDb(mongoDbDatabase, memberCollection, query, projection);
    if (!res1.isDead) {
      PersonController.CheckUserAuthenticated(user);
    }

    let r = this.mapPrivate(res1);
    let spouse = await db.collection('relations').find({ $or: [{ person1_id: r._id }, { person2_id: r._id }], type: "Spouse" }).toArray();
    r.weddingDate = spouse[0]?.wedding?.weddingDate;
    r.weddingLocationCountry = spouse[0]?.wedding?.country;
    r.weddingLocationCity = spouse[0]?.wedding?.city;
    return r;

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



  static sortByYearOfBirth(a: any, b: any) {
    const keyA = new Date(a.yearOfBirth);
    const keyB = new Date(b.yearOfBirth);
    if (keyA < keyB) return -1;
    if (keyA > keyB) return 1;
    return 0;
  }

  static sortByName(a: any, b: any) {
    const keyA = `${a.lastName ?? ''} ${a.firstName ?? ''}`;
    const keyB = `${b.lastName ?? ''} ${b.firstName ?? ''}`;
    if (keyA < keyB) return -1;
    if (keyA > keyB) return 1;
    return 0;
  }







  static CheckUserAuthenticated(user: any) {
    if (!user) {
      throw Error('Not authenticated, please login first');
    }
  }

  removeProfile(id: string) {
    this.logger.info('Remove profile');
    this.cacheService.clearPersonListCache();
    this.cacheService.clearProfileCache(id);

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

    this.cacheService.clearPersonListCache();
    this.cacheService.clearProfileCache(_id);

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
    this.cacheService.clearPersonListCache();
    return createPersonFromMongoDb(person)
      .catch((err) => {
        throw err;
      })
      .then((res: any) => res);
  }

  updatePersonPrivateInfo(_id: string, patch: any, user: any) {
    LoginController.CheckUserAuthenticated(user);
    this.logger.info('UpdatePersonspivate');

    this.logger.info(_id);
    this.logger.info(JSON.stringify(patch));

    return updatePersonFromMongoDb(_id, patch)
      .catch((err) => {
        console.log(err);
        throw err;
      })
      .then((res1: any) => {
        return this.mapPrivate(res1);
      });
  }

  mapPrivate(person: any) {
    let res1 = person
    res1.birthDate = res1?.birth?.birthDate;
    res1.birthLocationCountry = res1?.birth?.country;
    res1.birthLocationCity = res1?.birth?.city;
    if (res1.isDead === undefined) {
      res1.isDead = false;
    }

    if (!res1.isDead) {
      res1.email = res1.contacts?.email;
      res1.currentLocationCountry = res1?.currentLocation?.country;
      res1.currentLocationCity = res1?.currentLocation?.city;
    }
    res1.deathLocation = res1?.death?.country;
    res1.deathDate = res1?.death?.deathDate;
    res1.deathLocationCountry = res1?.death?.country;
    res1.deathLocationCity = res1?.death?.city;
    return res1;
  }
}
