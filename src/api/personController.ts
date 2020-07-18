import {
  memberCollection,
  mongoDbDatabase,
  MongoConnector,
  updatePersonFromMongoDb,
  createPersonFromMongoDb,
  deleteProfileFromMongoDb,
  relationCollection

} from './mongoDbConnector';
import ProfileService from '../services/profile_service';
import CacheService from '../services/cache_service';

import LoggerService from '../services/logger_service';
import LoginController from './loginController';

const ObjectId = require('mongodb').ObjectID;

export const cacheFolder = '../cache';

export default class PersonController {

  logger: LoggerService = new LoggerService('personController');

  profileService: ProfileService = new ProfileService();

  cacheService: CacheService = new CacheService(cacheFolder);

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

  async getNodes(db: any) {
    try {

      const membersCollection = db.collection('members');

      let data: any = await membersCollection.find({}, { "_id": 1 }).toArray();

      console.log(data[0])
      return data;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async getEdges(db: any) {
    try {

      const membersCollection = db.collection('members');

      let data: any = await membersCollection.find({}, { person1_id: 1, person2_id: 1 }).toArray();

      console.log(data[0])
      return data;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }


  async getRelation(_id1: string, _id2: string) {

    let p1: any;
    let p2: any;

    this.logger.info('Dijkstra');
    const Graph = require('node-dijkstra')

    const route = new Graph()

    const client = await this.connector.initClient();
    let nodes: any = [];
    let edges: any = [];

    try {
      const db = client.db(mongoDbDatabase);


      let query = {};
      const validGuid = new RegExp('^[0-9a-fA-F]{24}$').test(_id1);
      if (validGuid) {
        query = { "$or": [{ "profileId": _id1 }, { "_id": ObjectId(_id1) }] }
      } else {
        query = { "profileId": _id1 }
      }

      p1 = await db.collection('members').findOne(query);

      const validGuid1 = new RegExp('^[0-9a-fA-F]{24}$').test(_id2);
      if (validGuid1) {
        query = { "$or": [{ "profileId": _id2 }, { "_id": ObjectId(_id2) }] }
      } else {
        query = { "profileId": _id2 }
      }

      p2 = await db.collection('members').findOne(query);

      if (p1._id.toString() == p2._id.toString()) {
        client.close();
        return [{ link: 'self' }]
      }
      else {
        nodes = await db.collection('members').find({}, { fields: { '_id': 1 } }).toArray();
        edges = await db.collection('relations').find({}, { fields: { person1_id: 1, person2_id: 1 } }).toArray();


        let edgesDico: any = {}
        for (let i = 0; i < edges.length; i++) {
          let key1 = edges[i].person1_id.toString();
          let key2 = edges[i].person2_id.toString();
          if (key1 in edgesDico === false) {
            edgesDico[key1] = {}
          }
          if (key2 in edgesDico === false) {
            edgesDico[key2] = {}
          }

          edgesDico[key1][key2] = 1;
          edgesDico[key2][key1] = 1;
        }

        for (let i = 0; i < nodes.length; i++) {
          let nodeKey = nodes[i]._id.toString();
          if (edgesDico[nodeKey] != undefined) {
            route.addNode(nodeKey, edgesDico[nodeKey])
          }
        }
        let route1 = route.path(p1._id.toString(), p2._id.toString());

        let persons: any[] = await db.collection('members').find({ _id: { $in: route1.map((x: any) => ObjectId(x)) } }).toArray();
        let rels: any[] = await db.collection('relations').find({
          $or:
            [{ person1_id: { $in: route1.map((x: any) => ObjectId(x)) } }, { person2_id: { $in: route1.map((x: any) => ObjectId(x)) } }]
        }).toArray();

        let path = []
        for (let i = 0; i < route1.length - 1; i++) {

          var n1 = route1[i];
          var n2 = route1[i + 1]
          let link = 'unknown';
          var person1 = persons.find((x: any) => x._id.toString() == n1);
          var person2 = persons.find((x: any) => x._id.toString() == n2);
          var r1 = rels.find((x: any) => x.person1_id.toString() == n1 && x.person2_id.toString() == n2)
          if (r1 != undefined) {
            link = r1.type == 'Spouse' ? 'spouse' : 'child'
          }

          var r2 = rels.find((x: any) => x.person1_id.toString() == n2 && x.person2_id.toString() == n1)
          if (r2 != undefined) {
            link = r2.type == 'Spouse' ? 'spouse' : 'parent'
          }

          let pathItem = { person1: PersonController.mapping(person1), person2: PersonController.mapping(person2), link: link }
          path.push(pathItem);
        }

        client.close();
        return path


     
      }





    } catch (err) {
      console.log(err);
      client.close();
      return null;
    }


  }

  async getPersonList() {
    const cache = this.cacheService.getPersonListCache();
    if (cache !== undefined) {
      this.logger.debug('getPersonList from cache');
      return cache;
    }

    const client = await this.connector.initClient();
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

    try {
      const db = client.db(mongoDbDatabase);
      const membersCollection = db.collection('members');

      let data: any = await membersCollection.find({}, projection).toArray();
      data = data.map(PersonController.mapping);
      data = data.sort(PersonController.sortByName);
      client.close();
      this.cacheService.setPersonListCache(data)

     
      return data;
    } catch (err) {
      client.close();
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

    let res1:any = await this.connector.getItemFromMongoDb(mongoDbDatabase, memberCollection, query, projection);
    if (!res1.isDead) {
      PersonController.CheckUserAuthenticated(user);
    }

    let r = this.mapPrivate(res1);
    let spouse = await db.collection('relations').find({$or: [ { person1_id : r._id}, {person2_id: r._id}], type:"Spouse"}).toArray();
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
