import fs from 'fs';
import path from 'path';
import LoggerService from '../services/logger_service';

export default class CacheService {
  cacheFolder: string;

  personListCache: string;

  logger: LoggerService = new LoggerService('CacheService');

  constructor(cacheFolder: string) {
    this.cacheFolder = cacheFolder;
    this.personListCache = `${this.cacheFolder}/personList.json`;
  }

  getPersonListCache() {
    try {
      if (fs.existsSync(this.personListCache)) {
        const cachedList = fs.readFileSync(this.personListCache, 'utf8');
        return JSON.parse(cachedList);
      }
    } catch (error) {
      this.logger.error(error);
    }
    return undefined;
  }

  setPersonListCache(data: any) {
    try {
      fs.writeFileSync(this.personListCache, JSON.stringify(data, null, 4));
    } catch (error) {
      this.logger.error(error);
    }
  }

  clearPersonListCache() {
    try {
      if (fs.existsSync(this.personListCache)) {
        fs.unlinkSync(this.personListCache);
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  getProfileCacheFile(_id: string) {
    return `${this.cacheFolder}/profile_${_id}.json`;
  }

  getProfileCache(_id: string) {
    try {
      const cacheFile = this.getProfileCacheFile(_id);
      if (fs.existsSync(cacheFile)) {
        const cachedProfile = fs.readFileSync(cacheFile, 'utf8');
        return JSON.parse(cachedProfile);
      }
    } catch (error) {
      this.logger.error(error);
    }
    return undefined;
  }

  setProfileCache(_id: string, data: any) {
    try {
      const cacheFile = this.getProfileCacheFile(_id);
      this.logger.debug(`Write Cache: ${path.resolve(cacheFile)}`);
      fs.writeFileSync(cacheFile, JSON.stringify(data));
    } catch (error) {
      this.logger.error(error);
    }
  }

  clearProfileCache(_id: string) {
    try {
      const cacheFile = this.getProfileCacheFile(_id);
      if (fs.existsSync(cacheFile)) {
        fs.unlinkSync(cacheFile);
      }
    } catch (error) {
      this.logger.error(error);
    }
  }
}
