import {
  deleteRelationFromMongoDb,
  addParentRelationFromMongoDb,
  addSpouseRelationFromMongoDb,
  addSiblingRelationFromMongoDb,
  getUnusedPersonsFromMongoDb,
  updatePersonFromMongoDb,
  deleteSiblingRelationFromMongoDb,
  createPersonFromMongoDb,
  deleteProfileFromMongoDb,
  shouldResetCacheFromMongoDb,
  checkCredentialsFromMongoDb,
  createCredentialsFromMongoDb,
  getPersonByLoginFromMongoDb,
  getPhotosByIdFromMongoDb,
  getPhotoProfileFromMongoDb,
  addPhotoFromMongoDb,
  getPhotosRandomFromMongoDb,
  getAuditLastEntriesFromMongoDb,
  getTodayDeathdaysFromMongoDb,
  getTodayBirthdaysFromMongoDb,
  getTodayMarriagedaysFromMongoDb,
  setProfilePictureFromMongo,
  deletePhotoFromMongo,
  addPhotoTagFromMongo,
  removePhotoTagFromMongo,
  MongoConnector,
} from './mongoDbConnector';


import PersonController from './personController';
import LoggerService from '../services/logger_service';

const exjwt = require('express-jwt');
const jwt = require('jsonwebtoken');

export class GraphQLResolver {
  logger: LoggerService = new LoggerService('personController');

  queries: any;

  mutations: any;

  constructor(personController: PersonController) {

    this.queries = {
      getAuditLastEntries: (args: any) => this.getAuditLastEntries(args.number),
      getPersons: () => personController.getPersonList(),
      getPersonById: (args: any) => personController.getPersonById(args._id),
      getFatherById: (args: any) => personController.getParentById(args._id, 'Male'),
      getMotherById: (args: any) => personController.getParentById(args._id, 'Female'),
      getChildrenById: (args: any) => personController.getChildrenById(args._id),
      getSpousesById: (args: any) => personController.getSpousesById(args._id),
      getSiblingsById: (args: any) => personController.getSiblingsById(args._id),
      getPrivateInfoById: (args: any, context: any) => personController.getPrivateInfoById(args._id, context.user),
      getUnusedPersons: () => this.getUnusedPersons(),
      shouldResetCache: (args: any) => this.shouldResetCache(new Date(args.lastEntry)),
      shouldResetPersonCache: (args: any) => this.shouldResetPersonCache(args._id, new Date(args.lastEntry)),
      login: (args: any) => this.login(args.login, args.password),
      register: (args: any) => this.register(args.id, args.login, args.password),
      me: (args: any, context: any) => this.me(context.user),
      getPhotosById: (args: any) => this.getPhotosById(args._id),
      getPhotoProfile: (args: any) => this.getPhotoProfile(args._id),
      getPhotosRandom: (args: any) => this.getPhotosRandom(args.number),
      getTodayBirthdays: (args: any, context: any) => this.getTodayBirthdays(context.user),
      getTodayDeathdays: (args: any, context: any) => this.getTodayDeathdays(context.user),
      getTodayMarriagedays: (args: any, context: any) => this.getTodayMarriagedays(context.user),
    };
    this.mutations = {
      updatePersonPrivateInfo: (args: any, context: any) => this.updatePersonPrivateInfo(args._id, args.patch, context.user),
      addPhoto: (args: any, context: any) => this.addPhoto(args.url, args.deleteHash, args.persons, context.user),
      removeLink: (args: any) => this.removeLink(args._id1, args._id2),
      removeSiblingLink: (args: any) => this.removeSiblingLink(args._id1, args._id2),
      addParentLink: (args: any) => this.addParentLink(args._id, args._parentId),
      addChildLink: (args: any) => this.addParentLink(args._childId, args._id),
      addSpouseLink: (args: any) => this.addSpouseLink(args._id1, args._id2),
      addSiblingLink: (args: any) => this.addSiblingLink(args._id1, args._id2),
      createPerson: (args: any) => this.createPerson(args.person),
      updatePerson: (args: any) => this.updatePerson(args._id, args.patch),
      removeProfile: (args: any) => this.removeProfile(args._id),
      setProfilePicture: (args: any, context: any) => this.setProfilePicture(args.person, args.image),
      deletePhoto: (args: any, context: any) => this.deletePhoto(args.image),
      addPhotoTag: (args: any) => this.addPhotoTag(args.image, args.tag),
      removePhotoTag: (args: any) => this.removePhotoTag(args.image, args.tag),
    };
  }

  getResolver() {
    return {
      ...this.queries,
      ...this.mutations,
    };
  }


  removeLink(id1: string, id2: string) {
    this.logger.info('Remove link');
    return deleteRelationFromMongoDb(id1, id2)
      .catch((err) => {
        throw err;
      })
      .then((res) => res);
  }

  removeProfile(id: string) {
    this.logger.info('Remove profile');
    return deleteProfileFromMongoDb(id)
      .catch((err) => {
        throw err;
      })
      .then((res) => res);
  }

  removeSiblingLink(id1: string, id2: string) {
    this.logger.info('Remove sibling link');
    return deleteSiblingRelationFromMongoDb(id1, id2)
      .catch((err) => {
        throw err;
      })
      .then((res) => res);
  }

  addParentLink(id: string, parentId: string) {
    this.logger.info('Add parent link');
    return addParentRelationFromMongoDb(id, parentId)
      .catch((err) => {
        throw err;
      })
      .then((res) => res);
  }

  addSpouseLink(id1: string, id2: string) {
    this.logger.info('Add spouse link');
    return addSpouseRelationFromMongoDb(id1, id2)
      .catch((err) => {
        throw err;
      })
      .then((res) => res);
  }

  addSiblingLink(id1: string, id2: string) {
    this.logger.info('Add spouse link');
    return addSiblingRelationFromMongoDb(id1, id2)
      .catch((err) => {
        throw err;
      })
      .then((res) => res);
  }

  updatePerson(_id: string, patch: any) {
    if (patch === {}) {
      return null;
    }
    this.logger.info('UpdatePersons');

    this.logger.info(_id);
    this.logger.info(JSON.stringify(patch));

    return updatePersonFromMongoDb(_id, patch)
      .catch((err) => {
        throw err;
      })
      .then((res: any) => res);
  }

  createPerson(person: any) {
    this.logger.info('Create Person');

    return createPersonFromMongoDb(person)
      .catch((err) => {
        throw err;
      })
      .then((res: any) => res);
  }

  shouldResetCache(lastEntry: Date) {
    this.logger.info('Should reset cache?');
    return shouldResetCacheFromMongoDb(lastEntry)
      .catch((err) => {
        throw err;
      })
      .then((res: any) => res);
  }


  shouldResetPersonCache(_id: String, lastEntry: Date) {
    this.logger.info('Should reset person cache');
    return new Promise((resolve) => {
      resolve(true);
    });
  }

  login(login: string, password: string): any {
    this.logger.info('Login');
    const jwtMW = exjwt({
      secret: process.env.SECRET,
    });

    return checkCredentialsFromMongoDb(login, password)
      .then((res) => {
        if (res.success === true) {
          const token = jwt.sign(
            {
              login,
              profile: res.profileId,
            }, process.env.SECRET, { expiresIn: 129600 },
          );
          return {
            success: true,
            token,
            error: '',
          };
        }
        return {
          success: false,
          token: '',
          error: 'Username or password is incorrect',
        };
      });
  }

  register(id: string, login: string, password: string): any {
    this.logger.info('Register');
    return createCredentialsFromMongoDb(id, login, password)
      .then(() => 'login created')
      .catch(() => 'registration failed');
  }


  CheckUserAuthenticated(user: any) {
    this.logger.info('User authenticated');
    if (!user) {
      throw Error('Not authenticated, please login first');
    }
  }

  me(user: any) {
    this.CheckUserAuthenticated(user);
    return getPersonByLoginFromMongoDb(user.login)
      .then((res) => res);
  }

  getTodayBirthdays(user: any) {
    this.CheckUserAuthenticated(user);

    return getTodayBirthdaysFromMongoDb()
      .catch((err: any) => {
        throw err;
      })
      .then((res: any) => res);
  }

  getTodayDeathdays(user: any) {
    this.CheckUserAuthenticated(user);

    return getTodayDeathdaysFromMongoDb()
      .catch((err: any) => {
        throw err;
      })
      .then((res: any) => res);
  }

  getTodayMarriagedays(user: any) {
    this.CheckUserAuthenticated(user);
    return getTodayMarriagedaysFromMongoDb()
      .catch((err: any) => {
        throw err;
      })
      .then((res: any) => res);
  }

  addPhoto(url: string, deleteHash: string, persons: string[], user: any) {
    this.logger.info('add photo');

    this.CheckUserAuthenticated(user);
    if (persons == null || persons.length === 0) {
      throw Error('Need tag at least one person');
    }
    return addPhotoFromMongoDb(url, deleteHash, persons)
      .catch((err: any) => {
        throw err;
      })
      .then((res: any) => res);
  }

  getPhotosById(_id: string) {
    this.logger.info('GetPhotos');
    return getPhotosByIdFromMongoDb(_id)
      .catch((err: any) => {
        throw err;
      })
      .then((res: object) => {
        res = Object.assign(res);
        return res;
      });
  }

  setProfilePicture(person: string, image: string): Promise<string> {
    this.logger.info('Set profile pic');
    return setProfilePictureFromMongo(person, image)
      .catch((err: any) => {
        throw err;
      })
      .then(() => 'Done');
  }

  addPhotoTag(image: string, person: string): Promise<string> {
    this.logger.info('add photo tag');
    return addPhotoTagFromMongo(person, image)
      .catch((err: any) => {
        throw err;
      })
      .then(() => 'Done');
  }

  removePhotoTag(image: string, person: string): Promise<string> {
    this.logger.info('Remove photo tag');
    return removePhotoTagFromMongo(person, image)
      .catch((err: any) => {
        throw err;
      })
      .then(() => 'Done');
  }

  deletePhoto(image: string): Promise<string> {
    this.logger.info('delete photo');
    return deletePhotoFromMongo(image)
      .catch((err: any) => {
        throw err;
      })
      .then(() => 'Done');
  }

  getPhotoProfile(_id: string) {
    this.logger.info('GetPhotos');
    return getPhotoProfileFromMongoDb(_id)
      .catch((err: any) => {
        throw err;
      })
      .then((res: object) => {
        res = Object.assign(res);
        return res;
      });
  }

  getPhotosRandom(number: number) {
    this.logger.info('GetPhotos');
    return getPhotosRandomFromMongoDb(number)
      .catch((err: any) => {
        throw err;
      })
      .then((res: object) => {
        res = Object.assign(res);
        return res;
      });
  }

  getAuditLastEntries(number: number) {
    this.logger.info('Get Audit');
    return getAuditLastEntriesFromMongoDb(number)
      .catch((err: any) => {
        throw err;
      })
      .then((res: object) => {
        res = Object.assign(res);
        return res;
      });
  }


  updatePersonPrivateInfo(_id: string, patch: any, user: any) {
    if (patch === {}) {
      return null;
    }
    this.CheckUserAuthenticated(user);
    this.logger.info('UpdatePersonspivate');

    this.logger.info(_id);
    this.logger.info(JSON.stringify(patch));

    return updatePersonFromMongoDb(_id, patch)
      .catch((err) => {
        throw err;
      })
      .then((res: any) => res);
  }

  getUnusedPersons() {
    this.logger.info('get unused persons');
    return getUnusedPersonsFromMongoDb()
      .then((res) => {
        const items: any[] = [];
        res = Object.assign(res);
        res.forEach((element: {
          _id: any;
          FirstName: any;
          LastName: any;
        }) => {
          items.push({
            _id: element._id,
            FirstName: element.FirstName,
            LastName: element.LastName,
          });
        });

        return items;
      });
  }
}

const personController = new PersonController(new MongoConnector(process.env.MONGODB ?? ''));
export default new GraphQLResolver(personController).getResolver();
