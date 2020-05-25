import { GraphQLResolver } from '../src/api/graphQLResolver';
import schema from '../src/api/schema';
import { printSchema, validateSchema } from 'graphql';


describe('GraphQLResolver queries', () => {
  it('should implement all methods', async () => {
    const r = new GraphQLResolver();
    expect(Object.keys(r.queries).length).toEqual(18);
  });

  it('getAuditLastEntries', async () => {
    const adminControllerFake = jasmine.createSpyObj('AdminController', ['getAuditLastEntries']);
    const r = new GraphQLResolver();
    r.adminController = adminControllerFake;
    expect(Object.keys(r.queries).includes('getAuditLastEntries'));
    expect(schema.getQueryType()?.getFields()['getAuditLastEntries']).not.toBeUndefined();
    const args = { number: 4 };
    await r.queries.getAuditLastEntries(args);
    expect(adminControllerFake.getAuditLastEntries).toHaveBeenCalledWith(4);
  });

  it('getChildren', async () => {
    const personControllerFake = jasmine.createSpyObj('PersonController', ['getChildren']);
    const r = new GraphQLResolver();
    r.personController = personControllerFake;
    expect(Object.keys(r.queries).includes('getChildren'));
    const args = { _id: 'aPersonId' };
    await r.queries.getChildren(args);
    expect(personControllerFake.getChildren).toHaveBeenCalledWith('aPersonId');
    expect(schema.getQueryType()?.getFields()['getChildren']).not.toBeUndefined();
  });

  it('getFather', async () => {
    const personControllerFake = jasmine.createSpyObj('PersonController', ['getParent']);
    const r = new GraphQLResolver();
    r.personController = personControllerFake;
    expect(Object.keys(r.queries).includes('getFather'));
    const args = { _id: 'aPersonId' };
    await r.queries.getFather(args);
    expect(personControllerFake.getParent).toHaveBeenCalledWith('aPersonId', 'Male');
    expect(schema.getQueryType()?.getFields()['getFather']).not.toBeUndefined();
  });

  it('getMother', async () => {
    const personControllerFake = jasmine.createSpyObj('PersonController', ['getParent']);
    const r = new GraphQLResolver();
    r.personController = personControllerFake;
    expect(Object.keys(r.queries).includes('getMother'));
    const args = { _id: 'aPersonId' };
    await r.queries.getMother(args);
    expect(personControllerFake.getParent).toHaveBeenCalledWith('aPersonId', 'Female');
    expect(schema.getQueryType()?.getFields()['getMother']).not.toBeUndefined();
  });

  it('getPerson', async () => {
    const personControllerFake = jasmine.createSpyObj('PersonController', ['getPerson']);
    const r = new GraphQLResolver();
    r.personController = personControllerFake;
    expect(Object.keys(r.queries).includes('getPerson'));
    expect(schema.getQueryType()?.getFields()['getPerson']).not.toBeUndefined();
    const args = { _id: 'aPersonId' };
    await r.queries.getPerson(args);
    expect(personControllerFake.getPerson).toHaveBeenCalledWith('aPersonId');

  });

  it('getSiblings', async () => {
    const personControllerFake = jasmine.createSpyObj('PersonController', ['getSiblings']);
    const r = new GraphQLResolver();
    r.personController = personControllerFake;
    expect(Object.keys(r.queries).includes('getSiblings'));
    expect(schema.getQueryType()?.getFields()['getSiblings']).not.toBeUndefined();
    const args = { _id: 'aPersonId' };
    await r.queries.getSiblings(args);
    expect(personControllerFake.getSiblings).toHaveBeenCalledWith('aPersonId');
  });

  it('getSpouses', async () => {
    const personControllerFake = jasmine.createSpyObj('PersonController', ['getSpouses']);
    const r = new GraphQLResolver();
    r.personController = personControllerFake;
    expect(Object.keys(r.queries).includes('getSpouses'));
    expect(schema.getQueryType()?.getFields()['getSpouses']).not.toBeUndefined();
    const args = { _id: 'aPersonId' };
    await r.queries.getSpouses(args);
    expect(personControllerFake.getSpouses).toHaveBeenCalledWith('aPersonId');
  });

  it('getPersonList', async () => {
    const personControllerFake = jasmine.createSpyObj('PersonController', ['getPersonList']);
    const r = new GraphQLResolver();
    r.personController = personControllerFake;
    expect(Object.keys(r.queries).includes('getPersonList'));
    expect(schema.getQueryType()?.getFields()['getPersonList']).not.toBeUndefined();
    const args = { _id: 'aPersonId' };
    await r.queries.getPersonList(args);
    expect(personControllerFake.getPersonList).toHaveBeenCalled();
  });

  it('getPrivateInfo', async () => {
    const personControllerFake = jasmine.createSpyObj('PersonController', ['getPrivateInfo']);
    const r = new GraphQLResolver();
    r.personController = personControllerFake;
    expect(Object.keys(r.queries).includes('getPrivateInfo'));
    expect(schema.getQueryType()?.getFields()['getPrivateInfo']).not.toBeUndefined();
    const args = { _id: 'aPersonId' };
    const context = { user: 'Daniel' };
    await r.queries.getPrivateInfo(args, context);
    expect(personControllerFake.getPrivateInfo).toHaveBeenCalledWith('aPersonId', 'Daniel');
  });

  it('login', async () => {
    const loginControllerFake = jasmine.createSpyObj('LoginController', ['login']);
    const r = new GraphQLResolver();
    r.loginController = loginControllerFake;
    expect(Object.keys(r.queries).includes('login'));
    const args = { login: 'login', password: 'password' };
    await r.queries.login(args);
    expect(loginControllerFake.login).toHaveBeenCalledWith(args.login, args.password);
  });

  it('register', async () => {
    const loginControllerFake = jasmine.createSpyObj('LoginController', ['register']);
    const r = new GraphQLResolver();
    r.loginController = loginControllerFake;
    const args = { id: 'aPersonId', login: 'login', password: 'password' };
    await r.queries.register(args);
    expect(loginControllerFake.register).toHaveBeenCalledWith(args.id, args.login, args.password);
  });

  it('me', async () => {
    const loginControllerFake = jasmine.createSpyObj('LoginController', ['me']);
    const r = new GraphQLResolver();
    r.loginController = loginControllerFake;
    expect(Object.keys(r.queries).includes('me'));
    const args = {};
    const context = { user: 'Daniel' };
    await r.queries.me(args, context);
    expect(loginControllerFake.me).toHaveBeenCalledWith(context.user);
  });

  it('getPhotosById', async () => {
    const photoControllerFake = jasmine.createSpyObj('photoController', ['getPhotosById']);
    const r = new GraphQLResolver();
    r.photoController = photoControllerFake;
    expect(Object.keys(r.queries).includes('getPhotosById'));
    const args = { _id: 'anId' };
    await r.queries.getPhotosById(args);
    expect(photoControllerFake.getPhotosById).toHaveBeenCalledWith(args._id);
  });

  it('getPhotoProfile', async () => {
    const photoControllerFake = jasmine.createSpyObj('photoController', ['getPhotoProfile']);
    const r = new GraphQLResolver();
    r.photoController = photoControllerFake;
    expect(Object.keys(r.queries).includes('getPhotoProfile'));
    const args = { _id: 'anId' };
    await r.queries.getPhotoProfile(args);
    expect(photoControllerFake.getPhotoProfile).toHaveBeenCalledWith(args._id);
  });

  it('getPhotosRandom', async () => {
    const photoControllerFake = jasmine.createSpyObj('photoController', ['getPhotosRandom']);
    const r = new GraphQLResolver();
    r.photoController = photoControllerFake;
    expect(Object.keys(r.queries).includes('getPhotosRandom'));
    const args = { number: 5 };
    await r.queries.getPhotosRandom(args);
    expect(photoControllerFake.getPhotosRandom).toHaveBeenCalledWith(args.number);
  });

  it('getTodayBirthdays', async () => {
    const eventControllerFake = jasmine.createSpyObj('eventController', ['getTodayBirthdays']);
    const r = new GraphQLResolver();
    r.eventController = eventControllerFake;
    expect(Object.keys(r.queries).includes('getTodayBirthdays'));
    const args = {};
    const context = { user: 'Daniel' };
    await r.queries.getTodayBirthdays(args, context);
    expect(eventControllerFake.getTodayBirthdays).toHaveBeenCalledWith(context.user);
  });

  it('getTodayDeathdays', async () => {
    const eventControllerFake = jasmine.createSpyObj('eventController', ['getTodayDeathdays']);
    const r = new GraphQLResolver();
    r.eventController = eventControllerFake;
    expect(Object.keys(r.queries).includes('getTodayDeathdays'));
    const args = {};
    const context = { user: 'Daniel' };
    await r.queries.getTodayDeathdays(args, context);
    expect(eventControllerFake.getTodayDeathdays).toHaveBeenCalledWith(context.user);
  });

  it('getTodayMarriagedays', async () => {
    const eventControllerFake = jasmine.createSpyObj('eventController', ['getTodayMarriagedays']);
    const r = new GraphQLResolver();
    r.eventController = eventControllerFake;
    expect(Object.keys(r.queries).includes('getTodayMarriagedays'));
    const args = {};
    const context = { user: 'Daniel' };
    await r.queries.getTodayMarriagedays(args, context);
    expect(eventControllerFake.getTodayMarriagedays).toHaveBeenCalledWith(context.user);
  });
});

describe('GraphQLResolver mutations', () => {
  it('should implement all methods', async () => {
    const r = new GraphQLResolver();
    expect(Object.keys(r.mutations).length).toEqual(15);
  });

  it('updatePersonPrivateInfo', async () => {
    const personControllerFake = jasmine.createSpyObj('personController', ['updatePersonPrivateInfo']);
    const r = new GraphQLResolver();
    r.personController = personControllerFake;
    expect(Object.keys(r.mutations).includes('updatePersonPrivateInfo'));
    const args = { _id: 'anId', patch: {} };
    const context = { user: 'Daniel' };
    await r.mutations.updatePersonPrivateInfo(args, context);
    expect(personControllerFake.updatePersonPrivateInfo).toHaveBeenCalledWith(args._id, args.patch, context.user);
  });

  it('addPhoto', async () => {
    const photoControllerFake = jasmine.createSpyObj('photoController', ['addPhoto']);
    const r = new GraphQLResolver();
    r.photoController = photoControllerFake;
    expect(Object.keys(r.mutations).includes('addPhoto'));
    const args = { url: 'url', deleteHash: 'hash', persons: [] };
    const context = { user: 'Daniel' };
    await r.mutations.addPhoto(args, context);
    expect(photoControllerFake.addPhoto).toHaveBeenCalledWith(args.url, args.deleteHash, args.persons, context.user);
  });

  it('removeLink', async () => {
    const controllerFake = jasmine.createSpyObj('LinkController', ['removeLink']);
    const r = new GraphQLResolver();
    r.linkController = controllerFake;
    expect(Object.keys(r.mutations).includes('removeLink'));
    const args = { _id1: 'id1', _id2: 'id2' };
    await r.mutations.removeLink(args);
    expect(controllerFake.removeLink).toHaveBeenCalledWith(args._id1, args._id2);
  });

  it('removeSiblingLink', async () => {
    const controllerFake = jasmine.createSpyObj('LinkController', ['removeSiblingLink']);
    const r = new GraphQLResolver();
    r.linkController = controllerFake;
    expect(Object.keys(r.mutations).includes('removeSiblingLink'));
    const args = { _id1: 'id1', _id2: 'id2' };
    await r.mutations.removeSiblingLink(args);
    expect(controllerFake.removeSiblingLink).toHaveBeenCalledWith(args._id1, args._id2);
  });

  it('addParentLink', async () => {
    const controllerFake = jasmine.createSpyObj('LinkController', ['addParentLink']);
    const r = new GraphQLResolver();
    r.linkController = controllerFake;
    expect(Object.keys(r.mutations).includes('addParentLink'));
    const args = { _id: 'id1', _parentId: 'id2' };
    await r.mutations.addParentLink(args);
    expect(controllerFake.addParentLink).toHaveBeenCalledWith(args._id, args._parentId);
  });

  it('addChildLink', async () => {
    const controllerFake = jasmine.createSpyObj('LinkController', ['addParentLink']);
    const r = new GraphQLResolver();
    r.linkController = controllerFake;
    expect(Object.keys(r.mutations).includes('addParentLink'));
    const args = { _childId: 'id1', _id: 'id2' };
    await r.mutations.addChildLink(args);
    expect(controllerFake.addParentLink).toHaveBeenCalledWith(args._childId, args._id);
  });

  it('addSpouseLink', async () => {
    const controllerFake = jasmine.createSpyObj('LinkController', ['addSpouseLink']);
    const r = new GraphQLResolver();
    r.linkController = controllerFake;
    expect(Object.keys(r.mutations).includes('addSpouseLink'));
    const args = { _id1: 'id1', _id2: 'id2' };
    await r.mutations.addSpouseLink(args);
    expect(controllerFake.addSpouseLink).toHaveBeenCalledWith(args._id1, args._id2);
  });

  it('addSiblingLink', async () => {
    const controllerFake = jasmine.createSpyObj('LinkController', ['addSiblingLink']);
    const r = new GraphQLResolver();
    r.linkController = controllerFake;
    expect(Object.keys(r.mutations).includes('addSiblingLink'));
    const args = { _id1: 'id1', _id2: 'id2' };
    await r.mutations.addSiblingLink(args);
    expect(controllerFake.addSiblingLink).toHaveBeenCalledWith(args._id1, args._id2);
  });

  it('createPerson', async () => {
    const controllerFake = jasmine.createSpyObj('PersonController', ['createPerson']);
    const r = new GraphQLResolver();
    r.personController = controllerFake;
    expect(Object.keys(r.mutations).includes('createPerson'));
    const args = { person: {} };
    await r.mutations.createPerson(args);
    expect(controllerFake.createPerson).toHaveBeenCalledWith(args.person);
  });

  it('updatePerson', async () => {
    const controllerFake = jasmine.createSpyObj('PersonController', ['updatePerson']);
    const r = new GraphQLResolver();
    r.personController = controllerFake;
    expect(Object.keys(r.mutations).includes('updatePerson'));
    const args = { _id: 'anId', patch: {} };
    await r.mutations.updatePerson(args);
    expect(controllerFake.updatePerson).toHaveBeenCalledWith(args._id, args.patch);
  });

  it('removeProfile', async () => {
    const controllerFake = jasmine.createSpyObj('PersonController', ['removeProfile']);
    const r = new GraphQLResolver();
    r.personController = controllerFake;
    expect(Object.keys(r.mutations).includes('removeProfile'));
    const args = { _id: 'anId' };
    await r.mutations.removeProfile(args);
    expect(controllerFake.removeProfile).toHaveBeenCalledWith(args._id);
  });

  it('setProfilePicture', async () => {
    const photoControllerFake = jasmine.createSpyObj('PhotoController', ['setProfilePicture']);
    const r = new GraphQLResolver();
    r.photoController = photoControllerFake;

    expect(Object.keys(r.mutations).includes('setProfilePicture'));
    const args = { person: 'anId' , image: 'url'};
    await r.mutations.setProfilePicture(args);
    expect(photoControllerFake.setProfilePicture).toHaveBeenCalledWith(args.person, args.image);
  });

  it('deletePhoto', async () => {
    const photoControllerFake = jasmine.createSpyObj('PhotoController', ['deletePhoto']);
    const r = new GraphQLResolver();
    r.photoController = photoControllerFake;
    expect(Object.keys(r.mutations).includes('deletePhoto'));
    const args = { image: 'url'};
    await r.mutations.deletePhoto(args);
    expect(photoControllerFake.deletePhoto).toHaveBeenCalledWith(args.image);
  });

  it('addPhotoTag', async () => {
    const photoControllerFake = jasmine.createSpyObj('PhotoController', ['addPhotoTag']);
    const r = new GraphQLResolver();
    r.photoController = photoControllerFake;
    expect(Object.keys(r.mutations).includes('addPhotoTag'));
    const args = { tag: 'anId', image: 'url'};
    await r.mutations.addPhotoTag(args);
    expect(photoControllerFake.addPhotoTag).toHaveBeenCalledWith(args.image, args.tag);
  });

  it('removePhotoTag', async () => {
    const photoControllerFake = jasmine.createSpyObj('PhotoController', ['removePhotoTag']);
    const r = new GraphQLResolver();
    r.photoController = photoControllerFake;
    expect(Object.keys(r.mutations).includes('removePhotoTag'));
    const args = { tag: 'anId', image: 'url'};
    await r.mutations.removePhotoTag(args);
    expect(photoControllerFake.removePhotoTag).toHaveBeenCalledWith(args.image, args.tag);
  });
});
