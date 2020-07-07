import PersonController from './personController';
import LoggerService from '../services/logger_service';
import LinkController from './linkController';
import AdminController from './adminController';
import PhotoController from './photoController';
import LoginController from './loginController';
import EventController from './eventController';
import { MongoConnector } from './mongoDbConnector';

export class GraphQLResolver {
  logger: LoggerService = new LoggerService('personController');

  adminController: AdminController | undefined;

  loginController: LoginController | undefined;

  photoController: PhotoController | undefined;

  eventController: EventController | undefined;

  personController: PersonController | undefined;

  linkController: LinkController | undefined;

  getQuery() {
    return {

      version: () => this.adminController?.getVersion(),

      login: (args: any) => this.loginController?.login(args.login, args.password),
      register: (args: any) => this.loginController?.register(args.id, args.login, args.email, args.password),
      me: (args: any, context: any) => this.loginController?.me(context.user),

      getProfile: (args: any) => this.personController?.getProfile(args.profileId),
      getPrivateProfile: (args: any, context: any) => this.personController?.getPrivateProfile(args.profileId, context.user),

      getAuditLastEntries: (args: any) => this.adminController?.getAuditLastEntries(args.number),
      getPersonList: (args: any) => this.personController?.getPersonList(),
  
      getPhotoProfile: (args: any) => this.photoController?.getPhotoProfile(args._id),
      getPhotosRandom: (args: any) => this.photoController?.getPhotosRandom(args.number),

      getEvents: (args:any) => this.eventController?.getEvents(args.date1, args.date2),
      getTodayBirthdays: (args: any, context: any) => this.eventController?.getTodayBirthdays(context.user),
      getTodayDeathdays: (args: any, context: any) => this.eventController?.getTodayDeathdays(context.user),
      getTodayMarriagedays: (args: any, context: any) => this.eventController?.getTodayMarriagedays(context.user),
      getRelation:(args:any) => this.personController?.getRelation(args._id1, args._id2)
    };
  }

  getMutation() {
    return {

      runMassUpdate:( args: any) => this.adminController?.runMassUpdate(),
      updatePersonPrivateInfo: (args: any, context: any) => this.personController?.updatePersonPrivateInfo(args._id, args.patch, context.user),
      addPhoto: (args: any, context: any) => this.photoController?.addPhoto(args.url, args.deleteHash, args.persons, context.user),
      createPerson: (args: any) => this.personController?.createPerson(args.person),
      updatePerson: (args: any) => this.personController?.updatePerson(args._id, args.patch),
      removeProfile: (args: any) => this.personController?.removeProfile(args._id),

      removeLink: (args: any) => this.linkController?.removeLink(args._id1, args._id2),
      removeSiblingLink: (args: any) => this.linkController?.removeSiblingLink(args._id1, args._id2),
      addParentLink: (args: any) => this.linkController?.addParentLink(args._id, args._parentId),
      addChildLink: (args: any) => this.linkController?.addParentLink(args._childId, args._id),
      addSpouseLink: (args: any) => this.linkController?.addSpouseLink(args._id1, args._id2),
      addSiblingLink: (args: any) => this.linkController?.addSiblingLink(args._id1, args._id2),

      setProfilePicture: (args: any, context: any) => this.photoController?.setProfilePicture(args.person, args.image),
      deletePhoto: (args: any, context: any) => this.photoController?.deletePhoto(args.image),
      addPhotoTag: (args: any) => this.photoController?.addPhotoTag(args.image, args.tag),
      removePhotoTag: (args: any) => this.photoController?.removePhotoTag(args.image, args.tag),
    };
  }

  getResolver() {
    return {
      ...this.getQuery(),
      ...this.getMutation(),
    };
  }
}

const connector = new MongoConnector(process.env.MONGODB ?? '');

const resolver = new GraphQLResolver();
resolver.personController = new PersonController(connector);
resolver.linkController = new LinkController(connector);
resolver.adminController = new AdminController(connector);
resolver.photoController = new PhotoController(connector);
resolver.loginController = new LoginController(connector);
resolver.eventController = new EventController(connector);
export default resolver.getResolver();
