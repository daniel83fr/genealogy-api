import { PostgresConnector } from './postgresConnector';
import LoggerService from '../services/logger_service';
import LoginController from './loginController';
import CacheService from '../services/cache_service';

export const cacheFolder = '../cache';

export default class PhotoController {
  logger: LoggerService = new LoggerService('photoController');

  cacheService: CacheService = new CacheService(cacheFolder);
 
  addPhoto(url: string, deleteHash: string, persons: string[], user: any) {
    this.logger.info('add photo');

    LoginController.CheckUserAuthenticated(user);
    if (persons == null || persons.length === 0) {
      throw Error('Need tag at least one person');
    }

    for(let i = 0;i < persons.length; i++){
      this.cacheService.clearProfileCache(persons[i]);
    }
    
    try {
      const connector = new PostgresConnector();
      return connector.AddPhoto(url, persons, deleteHash)
        .then((res: any) => {
          return "Done";
        })
        .catch((err: any) => {
          console.error(err);
          throw err;
        });
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  getPhotosById(_id: string, db: any) {
    this.logger.info('GetPhotos ' + _id);

    try {
      const connector = new PostgresConnector();
      return connector.GetPhotoByPersonId(_id)
        .then((res: any[]) => {
          res.forEach(element => {
            element.url = this.adjustImageUrl(element.url);
          });
          return res;
        })
        .catch((err: any) => {
          console.error(err);
          return [];
        });
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  setProfilePicture(person: string, image: string): Promise<string> {
    this.logger.info('Set profile pic');
    this.cacheService.clearProfileCache(person);


    try {
      const connector = new PostgresConnector();
      return connector.SetProfilePhoto(image, person)
        .then((res: any) => {
          return "Done";
        })
        .catch((err: any) => {
          console.error(err);
          throw err;
        });
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  addPhotoTag(image: string, person: string): Promise<string> {
    try {
      const connector = new PostgresConnector();
      return connector.AddTagPhoto(image, person)
        .then((res: any) => {
          return "Done";
        })
        .catch((err: any) => {
          console.error(err);
          throw err;
        });
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  removePhotoTag(image: string, person: string): Promise<string> {

    try {
      const connector = new PostgresConnector();
      return connector.DeleteTagPhoto(image, person)
        .then((res: any) => {
          return "Done";
        })
        .catch((err: any) => {
          console.error(err);
          throw err;
        });
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  deletePhoto(image: string): Promise<string> {


    try {
      const connector = new PostgresConnector();
      return connector.DeletePhoto(image)
        .then((res: any) => {
          return "Done";
        })
        .catch((err: any) => {
          console.error(err);
          throw err;
        });
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  getPhotoProfile(_id: string) {
    this.logger.info('GetPhotos ' + _id);

    try {
      const connector = new PostgresConnector();
      return connector.GetProfilePhotoByPersonId(_id)
        .then((res: any[]) => {
          res.forEach(element => {
            element.url = this.adjustImageUrl(element.url);
          });
          return res;
        })
        .catch((err: any) => {
          console.error(err);
          return [];
        });
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  getPhotosRandom(number: number) {


    try {
      const connector = new PostgresConnector();
      return connector.GetRandomPhotos(number)
        .then((res: any[]) => {
          res.forEach(element => {
            element.url = this.adjustImageUrl(element.url);
          });
          return res;
        })
        .catch((err: any) => {
          console.error(err);
          return [];
        });
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  adjustImageUrl(url: string){
    return url
    .replace('https://i.imgur.com/', 'https://www.res01.com/images/')
    .replace('.jpg', 'm.jpg')
  }
}
