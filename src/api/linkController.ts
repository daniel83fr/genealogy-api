import { PostgresConnector } from './postgresConnector';
import LoggerService from '../services/logger_service';

export default class LinkController {
  logger: LoggerService = new LoggerService('linkController');

  removeLink(id1: string, id2: string) {
    this.logger.info('Remove link');
    try {
      const connector = new PostgresConnector();
      return connector.removeLink(id1, id2)
        .then(() => {
          return `Deleted link between ${id1} and ${id2}`;
        })
        .catch((err: any) => {
          console.error(err);
          return '';
        });
    } catch (err) {
      console.log(err);
      return '';
    }
  }

  addParentLink(id: string, parentId: string) {

    this.logger.info('add parent link');
    try {
      const connector = new PostgresConnector();
      return connector.addParentLink(id, parentId)
        .then(() => {
          return `Add parent link between ${id} and ${parentId}`;
        })
        .catch((err: any) => {
          console.error(err);
          return '';
        });
    } catch (err) {
      console.log(err);
      return '';
    }
  }

  addSpouseLink(id1: string, id2: string) {
    this.logger.info('add parent link');
    try {
      const connector = new PostgresConnector();
      return connector.addSpouseLink(id1, id2)
        .then(() => {
          return `Add spouse link between ${id1} and ${id2}`;
        })
        .catch((err: any) => {
          console.error(err);
          return '';
        });
    } catch (err) {
      console.log(err);
      return '';
    }
  }
}
