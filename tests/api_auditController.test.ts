import AuditController from '../src/api/auditController';
import * as mongoDbConnector from '../src/api/mongoDbConnector';

describe('auditController', () => {
  let connector: mongoDbConnector.MongoConnector;
  const mydb = { name: 'myDb' };
  beforeEach(() => {
    connector = new mongoDbConnector.MongoConnector('connectionString');

    spyOn(connector, 'initClient').and.returnValue(Promise.resolve({ db: () => mydb, close: () => {} }));
  });

  it('should get last modification audit', async () => {
    const controller = new AuditController(connector);
    //const audit = await controller.getAuditLastEntries(5);
    // expect(audit.toArray().length).toBe(5);
  });

 
});
