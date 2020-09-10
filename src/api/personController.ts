import { PostgresConnector } from './postgresConnector';
import ProfileService from '../services/profile_service';
import CacheService from '../services/cache_service';
import LoggerService from '../services/logger_service';
import LoginController from './loginController';

export const cacheFolder = '../cache';

export default class PersonController {

  logger: LoggerService = new LoggerService('personController');

  profileService: ProfileService = new ProfileService();

  cacheService: CacheService = new CacheService(cacheFolder);


  constructor( cacheService: CacheService | undefined = undefined) {
   

    if (cacheService !== undefined) {
      this.cacheService = cacheService;
    }
  }

  searchPerson(filter: string, page: number = 1, pageSize: number = 20) {
    this.logger.debug('searchPerson');
    try {
      const connector = new PostgresConnector();
      return connector.GetPersonList(filter, page, pageSize)
        .then((res: any) => {
          let dataNew = res.map(PersonController.mappingFromDb);
          return dataNew;
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

  getPersonList() {

    //  this.updateData();
    //  return [];
    const cache = this.cacheService.getPersonListCache();
    if (cache !== undefined) {
      this.logger.debug('getPersonList from cache');
      return cache;
    }

    try {
      const connector = new PostgresConnector();

      return connector.GetPersonList()
        .then((res: any) => {
          let dataNew = res.map(PersonController.mappingFromDb);
          this.cacheService.setPersonListCache(dataNew);
          return dataNew;
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

  async getProfile(_id: string) {

    const cache = this.cacheService.getProfileCache(_id);
    if (cache !== undefined) {
      this.logger.debug('getProfile from cache');
      return cache;
    }


    try {
      const data: any = await this.profileService.getProfileById(_id);
      this.cacheService.setProfileCache(_id, data);

      return data;
    } catch (err) {
      console.log(err);
      return {};
    }
  }

  removeProfile(id: string) {
    this.logger.info('Remove profile');
    this.cacheService.clearPersonListCache();
    this.cacheService.clearProfileCache(id);

    try {
      const connector = new PostgresConnector();

      return connector.RemoveProfile(id)
        .then((res: any) => {
          return true;
        })
        .catch((err: any) => {
          console.error(err);
          return false;
        });
    } catch (err) {
      console.log(err);
      return false }
  }










  static mapping(element: any) {
    const yearOfBirth = element?.birth?.year;
    const yearOfDeath = element?.death?.year;
    return {
      _id: element?._id,
      firstName: element?.firstName,
      lastName: element?.lastName,
      maidenName: element?.maidenName,
      gender: element?.gender,
      yearOfBirth: yearOfBirth === '0000' ? null : yearOfBirth,
      yearOfDeath: yearOfDeath === '0000' ? null : yearOfDeath,
      monthOfBirth: element?.birth?.month,
      monthOfDeath: element?.death?.month,
      dayOfBirth: element?.birth?.day,
      dayOfDeath: element?.death?.day,
      isDead: element?.isDead ?? false,
      profileId: element?.profileId,
    };
  }

  static mappingFromDb(row: any) {

    return {
      _id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      maidenName: row.maiden_name,
      gender: row.gender,
      yearOfBirth: row.year_of_birth,
      yearOfDeath: row.year_of_death,
      isDead: row.is_dead ?? false,
      profileId: row.profile_id ?? row.id,
      image: row.profile_picture,
    };
  }

  static sortByYearOfBirth(a: any, b: any) {
    const keyA = new Date(a.yearOfBirth);
    const keyB = new Date(b.yearOfBirth);
    if (keyA < keyB) return -1;
    if (keyA > keyB) return 1;
    return 0;
  }

  static CheckUserAuthenticated(user: any) {
    if (!user) {
      throw Error('Not authenticated, please login first');
    }
  }
}
