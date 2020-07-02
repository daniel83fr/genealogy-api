import fs from 'fs';
import {
  memberCollection,
  mongoDbDatabase,
  MongoConnector,
  updatePersonFromMongoDb,
  createPersonFromMongoDb,
  deleteProfileFromMongoDb,
  relationCollection

} from './mongoDbConnector';
import ProfileService from '../services/profile_service'

import LoggerService from '../services/logger_service';
import LoginController from './loginController';
import path from 'path';


const ObjectId = require('mongodb').ObjectID;

export const cacheFolder = '../cache';

export default class PersonController {

  logger: LoggerService = new LoggerService('personController');

  profileService: ProfileService = new ProfileService();

  connector: MongoConnector;

  constructor(connector: MongoConnector) {
    this.connector = connector;

    if (this.connector === undefined) {
      throw Error('connector undefined1');
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
      isDead: element?.isDead ?? false,
      profileId: element?.profileId,
    };
  }

  getNodes(db: any) {
    this.logger.info('Get person by Id');

    return this.connector.getArrayFromMongoDbAndDb(db, memberCollection, {}, {_id: 1})
      .catch((err: any) => {
        throw err;
      })
      .then((res: any) => res);
  }

  getEdges(db: any) {
    return this.connector.getArrayFromMongoDbAndDb(db, relationCollection, {}, {person1_id: 1,person2_id: 1})
      .catch((err: any) => {
        throw err;
      })
      .then((res: any) => res);
  }


  async getRelation(_id1: string, _id2: string){


    this.logger.info('Dijkstra');
    const Graph = require('node-dijkstra')

    const route = new Graph()

    const client = await this.connector.initClient();
    let nodes: any = [];
    let edges: any = [];

    try {
      const db = client.db(mongoDbDatabase);
      let nodes = await this.getNodes(db);
      let edges = await this.getEdges(db);
      console.log(nodes.length);
      console.log(edges.length);
      client.close();

    } catch(error) {
      console.log(error);
      client.close();
    }

    for(let i = 0;i< nodes.length;i++){
      let e:any= {};
      for(let j = 0; j< edges.length; j++){
        if(edges[j].person1_id.toString() == nodes[i]._id.toString()){
          e[edges[j].person2_id.toString()] = 1;
        }
        if(edges[j].person2_id.toString() == nodes[i]._id.toString()){
          e[edges[j].person1_id.toString()] = 1;
        }
      }
      route.addNode(nodes[i]._id.toString(), e)
    }

    return route.path(_id1, _id2)
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
      birth: { year: 1 },
      gender: 1,
      deathDate: { year: 1 },
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

    const cacheFile = `${cacheFolder}/profile_${_id}.json`;
    if (fs.existsSync(cacheFile)) {
      const cachedProfile = fs.readFileSync(cacheFile, 'utf8');
      return JSON.parse(cachedProfile);
    }

    const client = await this.connector.initClient();
    try {
      const db = client.db(mongoDbDatabase);
      const data: any = await this.profileService.getProfileByIdFromMongoDb(_id, db);
      client.close();
      fs.writeFileSync(cacheFile, JSON.stringify(data));
      return data;
    } catch (error) {
      client.close();
      console.log(error);
      return {};
    }
  }


  getProfileId(profileId: string, db: any) {
    let query = { 'profileId': `${profileId}` };
    return this.connector.getItemFromMongoDbAndDb(db, memberCollection, query, {})
      .catch(() => {
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
      .then((res) => {

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
          .then(res => res);
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
    const cacheFile = `${cacheFolder}/profile_${id}.json`;
    if (fs.existsSync(cacheFile)) {
      fs.unlinkSync(cacheFile);
    }
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

    const cacheFile = `${cacheFolder}/profile_${_id}.json`;
    if (fs.existsSync(cacheFile)) {
      fs.unlinkSync(cacheFile);
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
