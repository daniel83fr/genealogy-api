import PersonController from '../src/api/personController';
import * as mongoDbConnector from '../src/api/mongoDbConnector';
import CacheService from '../src/services/cache_service';

describe('personController', () => {
  let connector: mongoDbConnector.MongoConnector;
  let cacheService: CacheService;

  const aPerson = {"_id":"5e6556427af677179baf2e5a","firstName":"Daniel","lastName":"Manuelpillai","gender":"Male","birth":{"year":"1983"},"isDead":false,"profileId":"daniel.manuelpillai"}
  const items = { toArray: ()=>[aPerson] };
  const col = { find : (query: any, projection: any)=> items }
  const mydb = { name: 'myDb', collection: (x:string) => col };
  beforeEach(() => {
    connector = new mongoDbConnector.MongoConnector('connectionString');
    spyOn(connector, 'initClient').and.returnValue(Promise.resolve({ db: () => mydb, close: () => {} }));
    cacheService = new CacheService('folder');

  });

  // it('should get persons list from cache if available', async () => {
  //   spyOn(cacheService, 'getPersonListCache').and.returnValues([{ "id": "AAAA"}, {"id": "BBBB"}]);
  //   const controller = new PersonController(connector, cacheService);
  //   const persons = await controller.getPersonList();
  //   expect(persons.length).toBe(2);
  // });

  // it('should get persons list if cache not available', async () => {
  //   spyOn(cacheService, 'getPersonListCache').and.returnValue(undefined);
  //   spyOn(cacheService, 'setPersonListCache');
  //   const controller = new PersonController(connector, cacheService);
  //   const persons = await controller.getPersonList();
  //   expect(persons.length).toBe(1);
  //   expect(JSON.stringify(persons[0])).toBe('{"_id":"5e6556427af677179baf2e5a","firstName":"Daniel","lastName":"Manuelpillai","gender":"Male","yearOfBirth":"1983","isDead":false,"profileId":"daniel.manuelpillai"}');
  // });
});
