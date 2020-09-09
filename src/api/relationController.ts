
import ProfileService from '../services/profile_service';
import CacheService from '../services/cache_service';

import LoggerService from '../services/logger_service';
import { PostgresConnector } from './postgresConnector';

export const cacheFolder = '../cache';

export default class RelationController {

  logger: LoggerService = new LoggerService('personController');

  profileService: ProfileService = new ProfileService();

  cacheService: CacheService = new CacheService(cacheFolder);

  static mapping(element: any) {
    return {
      _id: element?.id,
      firstName: element?.first_name,
      lastName: element?.last_name,
    };
  }

  async getRelation(_id1: string, _id2: string) {

    let p1: any;
    let p2: any;

    this.logger.info('Dijkstra');
    const Graph = require('node-dijkstra')

    const route = new Graph()

    let nodes: any = [];
    let edges: any = [];

    try {

      const connector = new PostgresConnector();
     
      p1 = await connector.getIdFromProfile(_id1);
      p2 = await connector.getIdFromProfile(_id2);

      if (p1 == p2) {
        return [{ link: 'self' }]
      }
      else {

      
        edges = await connector.getAllLinks();
        nodes = await connector.getAllProfileIds();
   
    
       let edgesDico: any = {}
        for (let i = 0; i < edges.length; i++) {
          let key1 = edges[i].person1;
          let key2 = edges[i].person2;
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
          let nodeKey = nodes[i].id;
          if (edgesDico[nodeKey] != undefined) {
            route.addNode(nodeKey, edgesDico[nodeKey])
          }
        }
        let route1 = route.path(p1, p2);
        
        let path = []
        for (let i = 0; i < route1.length - 1; i++) {

          var n1 = route1[i];
          var n2 = route1[i + 1]
          let link = 'unknown';
          var person1 = nodes.find((x: any) => x.id == n1);
          var person2 = nodes.find((x: any) => x.id == n2);
          var r1 = edges.find((x: any) => (x.person1 == n1 && x.person2 == n2))
          if (r1 != undefined) {
            link = r1.type == 'Spouse' ? 'spouse' : 'child'
          }

          var r2 = edges.find((x: any) => x.person1== n2 && x.person2 == n1)
          if (r2 != undefined) {
            link = r2.type == 'Spouse' ? 'spouse' : 'parent'
          }

          let pathItem = { person1: RelationController.mapping(person1), person2: RelationController.mapping(person2), link: link }
          path.push(pathItem);
        }

        return path


     
      }
    } catch (err) {
      console.log(err);
      return null;
    }


  }
}
