import { GraphQLResolver } from '../src/api/graphQLResolver';
import PersonController from '../src/api/personController';

describe('GraphQLResolver queries', () => {
  it('should implement all methods', async () => {
    const r = new GraphQLResolver(<PersonController><unknown>null);
    expect(Object.keys(r.queries).length).toEqual(21);
  });

  it('getAuditLastEntries', async () => {
    const r = new GraphQLResolver(<PersonController><unknown>null);
    expect(Object.keys(r.queries).includes('getAuditLastEntries'));
    const spy = spyOn(r, 'getAuditLastEntries');
    const args = { number: 4 };
    await r.queries.getAuditLastEntries(args);
    expect(spy).toHaveBeenCalledWith(4);
  });

  it('getChildrenById', async () => {
    const controllerFake = jasmine.createSpyObj('PersonController', ['getChildrenById']);
    const r = new GraphQLResolver(controllerFake);
    expect(Object.keys(r.queries).includes('getChildrenById'));
    const args = { _id: 'aPersonId' };
    await r.queries.getChildrenById(args);
    expect(controllerFake.getChildrenById).toHaveBeenCalledWith('aPersonId');
  });

  it('getFatherById', async () => {
    const controllerFake = jasmine.createSpyObj('PersonController', ['getParentById']);
    const r = new GraphQLResolver(controllerFake);
    expect(Object.keys(r.queries).includes('getFatherById'));
    const args = { _id: 'aPersonId' };
    await r.queries.getFatherById(args);
    expect(controllerFake.getParentById).toHaveBeenCalledWith('aPersonId', 'Male');
  });

  it('getMotherById', async () => {
    const controllerFake = jasmine.createSpyObj('PersonController', ['getParentById']);
    const r = new GraphQLResolver(controllerFake);
    expect(Object.keys(r.queries).includes('getMotherById'));
    const args = { _id: 'aPersonId' };
    await r.queries.getMotherById(args);
    expect(controllerFake.getParentById).toHaveBeenCalledWith('aPersonId', 'Female');
  });

  it('getPersonById', async () => {
    const controllerFake = jasmine.createSpyObj('PersonController', ['getPersonById']);
    const r = new GraphQLResolver(controllerFake);
    expect(Object.keys(r.queries).includes('getPersonById'));
    const args = { _id: 'aPersonId' };
    await r.queries.getPersonById(args);
    expect(controllerFake.getPersonById).toHaveBeenCalledWith('aPersonId');
  });

  it('getSiblingsById', async () => {
    const controllerFake = jasmine.createSpyObj('PersonController', ['getSiblingsById']);
    const r = new GraphQLResolver(controllerFake);
    expect(Object.keys(r.queries).includes('getSiblingsById'));
    const args = { _id: 'aPersonId' };
    await r.queries.getSiblingsById(args);
    expect(controllerFake.getSiblingsById).toHaveBeenCalledWith('aPersonId');
  });

  it('getSpousesById', async () => {
    const controllerFake = jasmine.createSpyObj('PersonController', ['getSpousesById']);
    const r = new GraphQLResolver(controllerFake);
    expect(Object.keys(r.queries).includes('getSpousesById'));
    const args = { _id: 'aPersonId' };
    await r.queries.getSpousesById(args);
    expect(controllerFake.getSpousesById).toHaveBeenCalledWith('aPersonId');
  });

  it('getPersons', async () => {
    const controllerFake = jasmine.createSpyObj('PersonController', ['getPersonList']);
    const r = new GraphQLResolver(controllerFake);
    expect(Object.keys(r.queries).includes('getPersons'));
    const args = { _id: 'aPersonId' };
    await r.queries.getPersons(args);
    expect(controllerFake.getPersonList).toHaveBeenCalled();
  });

  it('getPrivateInfoById', async () => {
    const controllerFake = jasmine.createSpyObj('PersonController', ['getPrivateInfoById']);
    const r = new GraphQLResolver(controllerFake);
    expect(Object.keys(r.queries).includes('getPrivateInfoById'));
    const args = { _id: 'aPersonId' };
    const context = { user: 'Daniel' };
    await r.queries.getPrivateInfoById(args, context);
    expect(controllerFake.getPrivateInfoById).toHaveBeenCalledWith('aPersonId', 'Daniel');
  });

  it('getUnusedPersons', async () => {
    const r = new GraphQLResolver(<PersonController><unknown>null);
    expect(Object.keys(r.queries).includes('getUnusedPersons'));
    const spy = spyOn(r, 'getUnusedPersons');
    await r.queries.getUnusedPersons();
    expect(spy).toHaveBeenCalled();
  });

  it('shouldResetCache', async () => {
    const r = new GraphQLResolver(<PersonController><unknown>null);
    expect(Object.keys(r.queries).includes('shouldResetCache'));
    const spy = spyOn(r, 'shouldResetCache');
    const args = { lastEntry: '2016-07-27T07:45:00Z' };
    await r.queries.shouldResetCache(args);
    expect(spy).toHaveBeenCalledWith(new Date(args.lastEntry));
  });

  it('shouldResetPersonCache', async () => {
    const r = new GraphQLResolver(<PersonController><unknown>null);
    expect(Object.keys(r.queries).includes('shouldResetPersonCache'));
    const spy = spyOn(r, 'shouldResetPersonCache');
    const args = { _id: 'aPersonId', lastEntry: '2016-07-27T07:45:00Z' };
    await r.queries.shouldResetPersonCache(args);
    expect(spy).toHaveBeenCalledWith(args._id, new Date(args.lastEntry));
  });

  it('login', async () => {
    const r = new GraphQLResolver(<PersonController><unknown>null);
    expect(Object.keys(r.queries).includes('login'));
    const spy = spyOn(r, 'login');
    const args = { login: 'login', password: 'password' };
    await r.queries.login(args);
    expect(spy).toHaveBeenCalledWith(args.login, args.password);
  });

  it('register', async () => {
    const r = new GraphQLResolver(<PersonController><unknown>null);
    expect(Object.keys(r.queries).includes('register'));
    const spy = spyOn(r, 'register');
    const args = { id: 'aPersonId', login: 'login', password: 'password' };
    await r.queries.register(args);
    expect(spy).toHaveBeenCalledWith(args.id, args.login, args.password);
  });

  it('me', async () => {
    const r = new GraphQLResolver(<PersonController><unknown>null);
    expect(Object.keys(r.queries).includes('me'));
    const spy = spyOn(r, 'me');
    const args = {};
    const context = { user: 'Daniel' };
    await r.queries.me(args, context);
    expect(spy).toHaveBeenCalledWith(context.user);
  });

  it('getPhotosById', async () => {
    const r = new GraphQLResolver(<PersonController><unknown>null);
    expect(Object.keys(r.queries).includes('getPhotosById'));
    const spy = spyOn(r, 'getPhotosById');
    const args = { _id: 'anId' };
    await r.queries.getPhotosById(args);
    expect(spy).toHaveBeenCalledWith(args._id);
  });

  it('getPhotoProfile', async () => {
    const r = new GraphQLResolver(<PersonController><unknown>null);
    expect(Object.keys(r.queries).includes('getPhotoProfile'));
    const spy = spyOn(r, 'getPhotoProfile');
    const args = { _id: 'anId' };
    await r.queries.getPhotoProfile(args);
    expect(spy).toHaveBeenCalledWith(args._id);
  });

  it('getPhotosRandom', async () => {
    const r = new GraphQLResolver(<PersonController><unknown>null);
    expect(Object.keys(r.queries).includes('getPhotosRandom'));
    const spy = spyOn(r, 'getPhotosRandom');
    const args = { number: 5 };
    await r.queries.getPhotosRandom(args);
    expect(spy).toHaveBeenCalledWith(args.number);
  });

  it('getTodayBirthdays', async () => {
    const r = new GraphQLResolver(<PersonController><unknown>null);
    expect(Object.keys(r.queries).includes('getTodayBirthdays'));
    const spy = spyOn(r, 'getTodayBirthdays');
    const args = {};
    const context = { user: 'Daniel' };
    await r.queries.getTodayBirthdays(args, context);
    expect(spy).toHaveBeenCalledWith(context.user);
  });

  it('getTodayDeathdays', async () => {
    const r = new GraphQLResolver(<PersonController><unknown>null);
    expect(Object.keys(r.queries).includes('getTodayDeathdays'));
    const spy = spyOn(r, 'getTodayDeathdays');
    const args = {};
    const context = { user: 'Daniel' };
    await r.queries.getTodayDeathdays(args, context);
    expect(spy).toHaveBeenCalledWith(context.user);
  });

  it('getTodayMarriagedays', async () => {
    const r = new GraphQLResolver(<PersonController><unknown>null);
    expect(Object.keys(r.queries).includes('getTodayMarriagedays'));
    const spy = spyOn(r, 'getTodayMarriagedays');
    const args = {};
    const context = { user: 'Daniel' };
    await r.queries.getTodayMarriagedays(args, context);
    expect(spy).toHaveBeenCalledWith(context.user);
  });
});

describe('GraphQLResolver mutations', () => {
  it('should implement all methods', async () => {
    const r = new GraphQLResolver(<PersonController><unknown>null);
    expect(Object.keys(r.mutations).length).toEqual(15);
  });

  it('updatePersonPrivateInfo', async () => {
    const r = new GraphQLResolver(<PersonController><unknown>null);
    expect(Object.keys(r.mutations).includes('updatePersonPrivateInfo'));
    const spy = spyOn(r, 'updatePersonPrivateInfo');
    const args = { _id: 'anId', patch: {} };
    const context = { user: 'Daniel' };
    await r.mutations.updatePersonPrivateInfo(args, context);
    expect(spy).toHaveBeenCalledWith(args._id, args.patch, context.user);
  });

  it('addPhoto', async () => {
    const r = new GraphQLResolver(<PersonController><unknown>null);
    expect(Object.keys(r.mutations).includes('addPhoto'));
    const spy = spyOn(r, 'addPhoto');
    const args = { url: 'url', deleteHash: 'hash', persons: [] };
    const context = { user: 'Daniel' };
    await r.mutations.addPhoto(args, context);
    expect(spy).toHaveBeenCalledWith(args.url, args.deleteHash, args.persons, context.user);
  });

  it('removeLink', async () => {
    const r = new GraphQLResolver(<PersonController><unknown>null);
    expect(Object.keys(r.mutations).includes('removeLink'));
    const spy = spyOn(r, 'removeLink');
    const args = { _id1: 'id1', _id2: 'id2' };
    await r.mutations.removeLink(args);
    expect(spy).toHaveBeenCalledWith(args._id1, args._id2);
  });

  it('removeSiblingLink', async () => {
    const r = new GraphQLResolver(<PersonController><unknown>null);
    expect(Object.keys(r.mutations).includes('removeSiblingLink'));
    const spy = spyOn(r, 'removeSiblingLink');
    const args = { _id1: 'id1', _id2: 'id2' };
    await r.mutations.removeSiblingLink(args);
    expect(spy).toHaveBeenCalledWith(args._id1, args._id2);
  });

  it('addParentLink', async () => {
    const r = new GraphQLResolver(<PersonController><unknown>null);
    expect(Object.keys(r.mutations).includes('addParentLink'));
    const spy = spyOn(r, 'addParentLink');
    const args = { _id: 'id1', _parentId: 'id2' };
    await r.mutations.addParentLink(args);
    expect(spy).toHaveBeenCalledWith(args._id, args._parentId);
  });

  it('addChildLink', async () => {
    const r = new GraphQLResolver(<PersonController><unknown>null);
    expect(Object.keys(r.mutations).includes('addParentLink'));
    const spy = spyOn(r, 'addParentLink');
    const args = { _childId: 'id1', _id: 'id2' };
    await r.mutations.addChildLink(args);
    expect(spy).toHaveBeenCalledWith(args._childId, args._id);
  });

  it('addSpouseLink', async () => {
    const r = new GraphQLResolver(<PersonController><unknown>null);
    expect(Object.keys(r.mutations).includes('addSpouseLink'));
    const spy = spyOn(r, 'addSpouseLink');
    const args = { _id1: 'id1', _id2: 'id2' };
    await r.mutations.addSpouseLink(args);
    expect(spy).toHaveBeenCalledWith(args._id1, args._id2);
  });

  it('addSiblingLink', async () => {
    const r = new GraphQLResolver(<PersonController><unknown>null);
    expect(Object.keys(r.mutations).includes('addSiblingLink'));
    const spy = spyOn(r, 'addSiblingLink');
    const args = { _id1: 'id1', _id2: 'id2' };
    await r.mutations.addSiblingLink(args);
    expect(spy).toHaveBeenCalledWith(args._id1, args._id2);
  });

  it('createPerson', async () => {
    const r = new GraphQLResolver(<PersonController><unknown>null);
    expect(Object.keys(r.mutations).includes('createPerson'));
    const spy = spyOn(r, 'createPerson');
    const args = { person: {} };
    await r.mutations.createPerson(args);
    expect(spy).toHaveBeenCalledWith(args.person);
  });

  it('updatePerson', async () => {
    const r = new GraphQLResolver(<PersonController><unknown>null);
    expect(Object.keys(r.mutations).includes('updatePerson'));
    const spy = spyOn(r, 'updatePerson');
    const args = { _id: 'anId', patch: {} };
    await r.mutations.updatePerson(args);
    expect(spy).toHaveBeenCalledWith(args._id, args.patch);
  });

  it('removeProfile', async () => {
    const r = new GraphQLResolver(<PersonController><unknown>null);
    expect(Object.keys(r.mutations).includes('removeProfile'));
    const spy = spyOn(r, 'removeProfile');
    const args = { _id: 'anId' };
    await r.mutations.removeProfile(args);
    expect(spy).toHaveBeenCalledWith(args._id);
  });

  it('removeProfile', async () => {
    const r = new GraphQLResolver(<PersonController><unknown>null);
    expect(Object.keys(r.mutations).includes('removeProfile'));
    const spy = spyOn(r, 'removeProfile');
    const args = { _id: 'anId' };
    await r.mutations.removeProfile(args);
    expect(spy).toHaveBeenCalledWith(args._id);
  });

  it('setProfilePicture', async () => {
    const r = new GraphQLResolver(<PersonController><unknown>null);
    expect(Object.keys(r.mutations).includes('setProfilePicture'));
    const spy = spyOn(r, 'setProfilePicture');
    const args = { person: 'anId' , image: 'url'};
    await r.mutations.setProfilePicture(args);
    expect(spy).toHaveBeenCalledWith(args.person, args.image);
  });

  it('deletePhoto', async () => {
    const r = new GraphQLResolver(<PersonController><unknown>null);
    expect(Object.keys(r.mutations).includes('deletePhoto'));
    const spy = spyOn(r, 'deletePhoto');
    const args = { image: 'url'};
    await r.mutations.deletePhoto(args);
    expect(spy).toHaveBeenCalledWith(args.image);
  });

  it('addPhotoTag', async () => {
    const r = new GraphQLResolver(<PersonController><unknown>null);
    expect(Object.keys(r.mutations).includes('addPhotoTag'));
    const spy = spyOn(r, 'addPhotoTag');
    const args = { tag: 'anId' , image: 'url'};
    await r.mutations.addPhotoTag(args);
    expect(spy).toHaveBeenCalledWith(args.image, args.tag);
  });

  it('removePhotoTag', async () => {
    const r = new GraphQLResolver(<PersonController><unknown>null);
    expect(Object.keys(r.mutations).includes('removePhotoTag'));
    const spy = spyOn(r, 'removePhotoTag');
    const args = { tag: 'anId' , image: 'url'};
    await r.mutations.removePhotoTag(args);
    expect(spy).toHaveBeenCalledWith(args.image, args.tag);
  });
});