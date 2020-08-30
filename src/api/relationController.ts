import {
  mongoDbDatabase,
  MongoConnector,
} from './mongoDbConnector';

import ProfileService from '../services/profile_service';
import CacheService from '../services/cache_service';

import LoggerService from '../services/logger_service';

const ObjectId = require('mongodb').ObjectID;

export const cacheFolder = '../cache';

export default class RelationController {

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

          let pathItem = { person1: RelationController.mapping(person1), person2: RelationController.mapping(person2), link: link }
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
}
