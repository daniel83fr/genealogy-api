import LoggerService from "../services/logger_service";
import { MongoConnector, checkCredentialsFromMongoDb } from "./mongoDbConnector";
import { PostgresConnector } from "./postgresConnector";
const exjwt = require('express-jwt');
const jwt = require('jsonwebtoken');

export default class LoginController {
  logger: LoggerService = new LoggerService('loginController');

  connector: MongoConnector;

  constructor(connector: MongoConnector) {
    this.connector = connector;
  }

  static CheckUserAuthenticated(user: any) {
    if (!user) {
      throw Error('Not authenticated, please login first');
    }
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

  register(id: string, login: string, email: string, password: string): any {
    this.logger.info('Register');

    try {
      const connector = new PostgresConnector();
      return connector.CreateCredentials(id, login, email, password)
        .then((res: any) => {
          console.log(JSON.stringify(res))
          return 'login created';
        })
        .catch((err: any) => {
          console.error(err);
          return 'registration failed';
        });
    } catch (err) {
      console.log(err);
      return 'registration failed';
    }

  
  }

  me(user: any) {
    LoginController.CheckUserAuthenticated(user);
    this.logger.debug('me');
    try {
      const connector = new PostgresConnector();
      return connector.GetPersonByLogin(user.login)
        .then((res: any) => {
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
}
