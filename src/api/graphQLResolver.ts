import PersonController from './personController';
import LoggerService from '../services/logger_service';
import LinkController from './linkController';
import AuditController from './auditController';
import PhotoController from './photoController';
import LoginController from './loginController';
import EventController from './eventController';
import RelationController from './relationController';
import SettingController from './settingController';

export class GraphQLResolver {
  logger: LoggerService = new LoggerService('personController');

  settingController: SettingController | undefined;

  auditController: AuditController | undefined;

  loginController: LoginController | undefined;

  photoController: PhotoController | undefined;

  eventController: EventController | undefined;

  personController: PersonController | undefined;

  linkController: LinkController | undefined;

  relationController: RelationController | undefined;

  getQuery() {
    return {

      about: () => this.settingController?.about(),

      login: (args: any) => this.loginController?.login(args.login, args.password),
      connectedUser: (args: any, context: any) => this.loginController?.me(context.user),

      getPersonList: (args: any) => this.personController?.getPersonList(),
      searchPerson: (args: any) => this.personController?.searchPerson(args.filter, args.page, args.pageSize),
 
      getProfile: (args: any) => this.personController?.getProfile(args.profileId),
      // getPrivateProfile: (args: any, context: any) => this.personController?.getPrivateProfile(args.profileId, context.user),

      getAuditLastEntries: (args: any) => this.auditController?.getAuditLastEntries(args.number),
      getPhotoProfile: (args: any) => this.photoController?.getPhotoProfile(args._id),
      getPhotosRandom: (args: any) => this.photoController?.getPhotosRandom(args.number),

      getEvents: (args:any) => this.eventController?.getEvents(args.date),
      getRelation: (args:any) => this.relationController?.getRelation(args._id1, args._id2),
    };
  }

  getMutation() {
    return {

      accountCreate: (args: any) => this.loginController?.register(args.id, args.login, args.email, args.password),
      accountUpdate: (args: any) => this.loginController?.updateAccount(args.id, args.login, args.email, args.password),
      accountDelete: (args: any) => this.loginController?.deleteAccount(args.login, args.password),
     

//updatePersonPrivateInfo: (args: any, context: any) => this.personController?.updatePersonPrivateInfo(args._id, args.patch, context.user),
      addPhoto: (args: any, context: any) => this.photoController?.addPhoto(args.url, args.deleteHash, args.persons, context.user),
   //   createPerson: (args: any) => this.personController?.createPerson(args.person),
   //   updatePerson: (args: any) => this.personController?.updatePerson(args._id, args.patch),
      removeProfile: (args: any) => this.personController?.removeProfile(args._id),

      removeLink: (args: any) => this.linkController?.removeLink(args._id1, args._id2),


      addParentLink: (args: any) => this.linkController?.addParentLink(args._id, args._parentId),
      addChildLink: (args: any) => this.linkController?.addParentLink(args._childId, args._id),
      addSpouseLink: (args: any) => this.linkController?.addSpouseLink(args._id1, args._id2),


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

const resolver = new GraphQLResolver();
resolver.personController = new PersonController();
resolver.linkController = new LinkController();
resolver.auditController = new AuditController();
resolver.photoController = new PhotoController();
resolver.loginController = new LoginController();
resolver.eventController = new EventController();
resolver.relationController = new RelationController();
resolver.settingController = new SettingController();
export default resolver.getResolver();
