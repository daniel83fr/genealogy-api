import AuditController from '../src/api/auditController';
import * as mongoDbConnector from '../src/api/mongoDbConnector';

describe('auditController', () => {
  let connector: mongoDbConnector.MongoConnector;
  const mydb = { name: 'myDb' };
  beforeEach(() => {
    connector = new mongoDbConnector.MongoConnector('connectionString');

    spyOn(connector, 'initClient').and.returnValue(Promise.resolve({ db: () => mydb, close: () => {} }));
  });


 
});
