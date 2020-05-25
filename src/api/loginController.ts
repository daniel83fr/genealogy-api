import LoggerService from "../services/logger_service";
import { MongoConnector, createCredentialsFromMongoDb, checkCredentialsFromMongoDb, getPersonByLoginFromMongoDb } from "./mongoDbConnector";
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

  register(id: string, login: string, password: string): any {
    this.logger.info('Register');
    return createCredentialsFromMongoDb(id, login, password)
      .then(() => 'login created')
      .catch(() => 'registration failed');
  }

  me(user: any) {
    LoginController.CheckUserAuthenticated(user);
    return getPersonByLoginFromMongoDb(user.login)
      .then((res) => res);
  }
}
