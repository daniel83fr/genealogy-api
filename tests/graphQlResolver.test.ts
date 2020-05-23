import { GraphQlResolver } from '../src/api/resolvers';
import PersonController from '../src/api/personController';

describe('GraphQLResolver', () => {
  // it('should implement schema', async () => {
  //   const r = new GraphQlResolver();
  //   expect(Object.keys(r.queries).length).toEqual(21);

  //   expect(Object.keys(r.queries).sort()).toEqual([

  //     'getFatherById',
  //     'getMotherById',
  //     'getPersonById',
  //     'getPersons',
  //     'getPhotoProfile',
  //     'getPhotosById',
  //     'getPhotosRandom',
  //     'getPrivateInfoById',
  //     'getSiblingsById',
  //     'getSpousesById',
  //     'getTodayBirthdays',
  //     'getTodayDeathdays',
  //     'getTodayMarriagedays',
  //     'getUnusedPersons',
  //     'login',
  //     'me',
  //     'register',
  //     'shouldResetCache',
  //     'shouldResetPersonCache',
  //   ]);

  //   expect(Object.keys(r.mutations).length).toEqual(15);
  //   expect(Object.keys(r.mutations).sort()).toEqual([

  //     'addChildLink',
  //     'addParentLink',
  //     'addPhoto',
  //     'addPhotoTag',
  //     'addSiblingLink',
  //     'addSpouseLink',
  //     'createPerson',
  //     'deletePhoto',
  //     'removeLink',
  //     'removePhotoTag',
  //     'removeProfile',
  //     'removeSiblingLink',
  //     'setProfilePicture',
  //     'updatePerson',
  //     'updatePersonPrivateInfo',
  //   ]);
  // });

  it('getAuditLastEntries', async () => {
    const r = new GraphQlResolver(<PersonController><unknown>null);
    expect(Object.keys(r.queries).includes('getAuditLastEntries'));
    const spy = spyOn(r, 'getAuditLastEntries').and.returnValue(Promise.resolve([{}]));
    const args = { number: 4 };
    await r.queries.getAuditLastEntries(args);
    expect(spy).toHaveBeenCalledWith(4);
  });

  it('getChildrenById', async () => {
    const controllerFake = jasmine.createSpyObj('PersonController', ['getChildrenById']);
    const r = new GraphQlResolver(controllerFake);
    expect(Object.keys(r.queries).includes('getChildrenById'));
    const args = { _id: 'aPersonId' };
    await r.queries.getChildrenById(args);
    expect(controllerFake.getChildrenById).toHaveBeenCalledWith('aPersonId');
  });

  it('getFatherById', async () => {
    const controllerFake = jasmine.createSpyObj('PersonController', ['getParentById']);
    const r = new GraphQlResolver(controllerFake);
    expect(Object.keys(r.queries).includes('getFatherById'));
    const args = { _id: 'aPersonId' };
    await r.queries.getFatherById(args);
    expect(controllerFake.getParentById).toHaveBeenCalledWith('aPersonId', 'Male');
  });

  it('getMotherById', async () => {
    const controllerFake = jasmine.createSpyObj('PersonController', ['getParentById']);
    const r = new GraphQlResolver(controllerFake);
    expect(Object.keys(r.queries).includes('getMotherById'));
    const args = { _id: 'aPersonId' };
    await r.queries.getMotherById(args);
    expect(controllerFake.getParentById).toHaveBeenCalledWith('aPersonId', 'Female');
  });

  it('getPersonById', async () => {
    const controllerFake = jasmine.createSpyObj('PersonController', ['getPersonById']);
    const r = new GraphQlResolver(controllerFake);
    expect(Object.keys(r.queries).includes('getPersonById'));
    const args = { _id: 'aPersonId' };
    await r.queries.getPersonById(args);
    expect(controllerFake.getPersonById).toHaveBeenCalledWith('aPersonId');
  });

  it('getSiblingsById', async () => {
    const controllerFake = jasmine.createSpyObj('PersonController', ['getSiblingsById']);
    const r = new GraphQlResolver(controllerFake);
    expect(Object.keys(r.queries).includes('getSiblingsById'));
    const args = { _id: 'aPersonId' };
    await r.queries.getSiblingsById(args);
    expect(controllerFake.getSiblingsById).toHaveBeenCalledWith('aPersonId');
  });

  it('getSpousesById', async () => {
    const controllerFake = jasmine.createSpyObj('PersonController', ['getSpousesById']);
    const r = new GraphQlResolver(controllerFake);
    expect(Object.keys(r.queries).includes('getSpousesById'));
    const args = { _id: 'aPersonId' };
    await r.queries.getSpousesById(args);
    expect(controllerFake.getSpousesById).toHaveBeenCalledWith('aPersonId');
  });

});
