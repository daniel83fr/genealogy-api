import AdminController, * as adminController from '../src/api/adminController';
import * as mongoDbConnector from '../src/api/mongoDbConnector';

describe('adController', () => {
  let connector: mongoDbConnector.MongoConnector;
  const mydb = { name: 'myDb' };
  beforeEach(() => {
    connector = new mongoDbConnector.MongoConnector('connectionString');

    spyOn(connector, 'initClient').and.returnValue(Promise.resolve({ db: () => mydb, close: () => {} }));
  });
});
