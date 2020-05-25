import LoggerService from "../services/logger_service";
import { MongoConnector, getPhotosRandomFromMongoDb, getPhotoProfileFromMongoDb, deletePhotoFromMongo, removePhotoTagFromMongo, addPhotoTagFromMongo, setProfilePictureFromMongo, getPhotosByIdFromMongoDb, addPhotoFromMongoDb } from "./mongoDbConnector";
import LoginController from "./loginController";

export default class PhotoController {
  logger: LoggerService = new LoggerService('photoController');

  connector: MongoConnector;

  constructor(connector: MongoConnector) {
    this.connector = connector;
  }
  
  addPhoto(url: string, deleteHash: string, persons: string[], user: any) {
    this.logger.info('add photo');

    LoginController.CheckUserAuthenticated(user);
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
  

}
