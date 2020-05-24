import LinkController, * as linkController from '../src/api/linkController';
import * as mongoDbConnector from '../src/api/mongoDbConnector';

describe('linkController', () => {
  let connector: mongoDbConnector.MongoConnector;
  const mydb = { name: 'myDb' };
  beforeEach(() => {
    connector = new mongoDbConnector.MongoConnector('connectionString');

    spyOn(connector, 'initClient').and.returnValue(Promise.resolve({ db: () => mydb, close: () => {} }));
  });

  it('should remove direct link', async () => {
    const id1 = '5ebc5b01df64a80017c4c5b4';
    const id2 = '5ebc5b01df64a80017c4c5b6';

    const objId1 = mongoDbConnector.ObjectId(id1);
    const objId2 = mongoDbConnector.ObjectId(id2);

    const data = {
      person1_id: objId1,
      person2_id: objId2,
      type: 'Parent',
    };
    const spyGet = spyOn(connector, 'getItemFromMongoDbAndDb').and.returnValue(Promise.resolve(data));
    const spyDelete = spyOn(connector, 'deleteManyFromMongoDbAndDb').and.returnValue(Promise.resolve({}));
    const spyAudit = spyOn(connector, 'insertAudit');

    const controller = new LinkController(connector);

    const result = await controller.removeLink(id1, id2);
    expect(result).toEqual(`Deleted link between ${id1} and ${id2}`);

    const query = { $or: [Object({ person1_id: objId1, person2_id: objId2 }), Object({ person1_id: objId2, person2_id: objId1 })] };
    expect(spyGet).toHaveBeenCalledWith(mydb, 'relations', query, {});
    expect(spyDelete).toHaveBeenCalledWith(mydb, 'relations', query);
    expect(spyAudit).toHaveBeenCalledWith(mydb, 'Relation', 'Remove link', [objId1, objId2], data);
  });

  it('should raise error when remove link failed', async () => {
    spyOn(connector, 'getItemFromMongoDbAndDb').and.throwError('an error');
    const controller = new LinkController(connector);
    const id1 = '5ebc5b01df64a80017c4c5b4';
    const id2 = '5ebc5b01df64a80017c4c5b6';

    controller.removeLink(id1, id2)
      .catch((err) => {
        expect(err).toEqual(Error('an error'));
      });
  });

  it('should remove sibling link', async () => {
    const id1 = '5ebc5b01df64a80017c4c5b4';
    const id2 = '5ebc5b01df64a80017c4c5b6';
    const idParent = '5ebc5b01df64a80017c4c5b2';

    const objId1 = mongoDbConnector.ObjectId(id1);
    const objId2 = mongoDbConnector.ObjectId(id2);
    const objIdParent = mongoDbConnector.ObjectId(idParent);

    const data = [{
      person1_id: objIdParent,
      person2_id: objId1,
      type: 'Parent',
    }];
    const spyGet = spyOn(connector, 'getArrayFromMongoDbAndDb').and.returnValue(Promise.resolve(data));

    const controller = new LinkController(connector);
    const spyRemoveLink = spyOn(controller, 'removeLink');

    const result = await controller.removeSiblingLink(id1, id2);
    expect(result).toEqual(`Deleted siblings link between ${id1} and ${id2}`);

    const query = { type: 'Parent', person2_id: objId1 };
    expect(spyGet).toHaveBeenCalledWith(mydb, 'relations', query, {});
    expect(spyRemoveLink).toHaveBeenCalledWith(idParent, id2);
  });

  it('should raise error when remove sibling link failed', async () => {
    spyOn(connector, 'getArrayFromMongoDbAndDb').and.throwError('an error');
    const controller = new LinkController(connector);
    const id1 = '5ebc5b01df64a80017c4c5b4';
    const id2 = '5ebc5b01df64a80017c4c5b6';

    controller.removeSiblingLink(id1, id2)
      .catch((err) => {
        expect(err).toEqual(Error('an error'));
      });
  });

  it('should add parent link', async () => {
    const id = '5ebc5b01df64a80017c4c5b4';
    const idParent = '5ebc5b01df64a80017c4c5b6';

    const objId = mongoDbConnector.ObjectId(id);
    const objIdParent = mongoDbConnector.ObjectId(idParent);

    const data = { res: 'insert result' };
    const spyInsert = spyOn(connector, 'insertItem').and.returnValue(Promise.resolve(data));
    const spyAudit = spyOn(connector, 'insertAudit');

    const controller = new LinkController(connector);

    const result = await controller.addParentLink(id, idParent);
    expect(result).toEqual(`Added link between ${idParent} and ${id}`);

    const query = { person1_id: objIdParent, person2_id: objId, type: 'Parent' };
    expect(spyInsert).toHaveBeenCalledWith(mydb, 'relations', query);
    expect(spyAudit).toHaveBeenCalledWith(mydb, 'Relation', 'Add parent link', [objIdParent, objId], data);
  });

  it('should add sibling link', async () => {
    const id1 = '5ebc5b01df64a80017c4c5b4';
    const id2 = '5ebc5b01df64a80017c4c5b6';
    const idParent = '5ebc5b01df64a80017c4c5b2';

    const objId1 = mongoDbConnector.ObjectId(id1);
    const objId2 = mongoDbConnector.ObjectId(id2);
    const objIdParent = mongoDbConnector.ObjectId(idParent);

    const data = [{
      person1_id: objIdParent,
      person2_id: objId1,
      type: 'Parent',
    }];
    const spyGet = spyOn(connector, 'getArrayFromMongoDbAndDb').and.returnValue(Promise.resolve(data));

    const controller = new LinkController(connector);
    const spyParentLink = spyOn(controller, 'addParentLink');

    const result = await controller.addSiblingLink(id1, id2);
    expect(result).toEqual(`Added link between ${id1} and ${id2}`);

    const query = { type: 'Parent', person2_id: objId1 };
    expect(spyGet).toHaveBeenCalledWith(mydb, 'relations', query, {});
    expect(spyParentLink).toHaveBeenCalledWith( id2, idParent);
  });

  it('should raise error when remove sibling link failed', async () => {
    spyOn(connector, 'getArrayFromMongoDbAndDb').and.throwError('an error');
    const controller = new LinkController(connector);
    const id1 = '5ebc5b01df64a80017c4c5b4';
    const id2 = '5ebc5b01df64a80017c4c5b6';

    controller.removeSiblingLink(id1, id2)
      .catch((err) => {
        expect(err).toEqual(Error('an error'));
      });
  });

  it('should raise error when add sibling link failed', async () => {
    spyOn(connector, 'getArrayFromMongoDbAndDb').and.throwError('an error');
    const controller = new LinkController(connector);
    const id1 = '5ebc5b01df64a80017c4c5b4';
    const id2 = '5ebc5b01df64a80017c4c5b6';

    controller.addSiblingLink(id1, id2)
      .catch((err) => {
        expect(err).toEqual(Error('an error'));
      });
  });

  it('should add spouse link', async () => {
    const id1 = '5ebc5b01df64a80017c4c5b4';
    const id2 = '5ebc5b01df64a80017c4c5b6';

    const objId1 = mongoDbConnector.ObjectId(id1);
    const objId2 = mongoDbConnector.ObjectId(id2);

    const data = { res: 'insert result' };
    const spyInsert = spyOn(connector, 'insertItem').and.returnValue(Promise.resolve(data));
    const spyAudit = spyOn(connector, 'insertAudit');

    const controller = new LinkController(connector);

    const result = await controller.addSpouseLink(id1, id2);
    expect(result).toEqual(`Added link between ${id1} and ${id2}`);

    const query = { person1_id: objId1, person2_id: objId2, type: 'Spouse' };
    expect(spyInsert).toHaveBeenCalledWith(mydb, 'relations', query);
    expect(spyAudit).toHaveBeenCalledWith(mydb, 'Relation', 'Add spouse link', [objId1, objId2], data);
  });

  it('should raise error when add spouse link failed', async () => {
    spyOn(connector, 'insertItem').and.throwError('an error');
    const controller = new LinkController(connector);
    const id1 = '5ebc5b01df64a80017c4c5b4';
    const id2 = '5ebc5b01df64a80017c4c5b6';

    controller.addSpouseLink(id1, id2)
      .catch((err) => {
        expect(err).toEqual(Error('an error'));
      });
  });

  it('should add parent link', async () => {
    const id = '5ebc5b01df64a80017c4c5b4';
    const idParent = '5ebc5b01df64a80017c4c5b6';

    const objId = mongoDbConnector.ObjectId(id);
    const objIdParent = mongoDbConnector.ObjectId(idParent);

    const data = { res: 'insert result' };
    const spyInsert = spyOn(connector, 'insertItem').and.returnValue(Promise.resolve(data));
    const spyAudit = spyOn(connector, 'insertAudit');

    const controller = new LinkController(connector);

    const result = await controller.addParentLink(idParent, id);
    expect(result).toEqual(`Added link between ${id} and ${idParent}`);

    const query = { person1_id: objId, person2_id: objIdParent, type: 'Parent' };
    expect(spyInsert).toHaveBeenCalledWith(mydb, 'relations', query);
    expect(spyAudit).toHaveBeenCalledWith(mydb, 'Relation', 'Add parent link', [objId, objIdParent], data);
  });

  it('should raise error when add parent link failed', async () => {
    spyOn(connector, 'insertItem').and.throwError('an error');
    const controller = new LinkController(connector);
    const id1 = '5ebc5b01df64a80017c4c5b4';
    const id2 = '5ebc5b01df64a80017c4c5b6';

    controller.addParentLink(id1, id2)
      .catch((err) => {
        expect(err).toEqual(Error('an error'));
      });
  });
});

