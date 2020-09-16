import { PostgresConnector } from './postgresConnector';
import LoggerService from '../services/logger_service';


const jwt = require('jsonwebtoken');

export default class LoginController {
  logger: LoggerService = new LoggerService('loginController');

  static CheckUserAuthenticated(user: any) {
    console.log("check rights")
    if (!user) {
      throw Error('Not authenticated, please login first');
    }
  }

  login(login: string, password: string): any {
    const connector = new PostgresConnector();
    return connector.CheckCredentials(login, password)
      .then((res: any) => {
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
        else{
          return {
            success: false,
            token: null,
            error: 'Username or password is incorrect',
          };
        }

       
      })
      .catch((err: any) => {
        this.logger.error(err);
        return {
          success: false,
          token: null,
          error: 'Something went wrong when login',
        }
      });
  }

  register(email: string, password: string): any {
    this.logger.info('Register');

    try {
      const connector = new PostgresConnector();
      return connector.CreateCredentials(email, password)
        .then((res: any) => {
          console.log(JSON.stringify(res));
          return res.message;
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

  updateAccount(id: string, login: string, email: string, password: string): any {
    this.logger.info('Update account');

    try {
      const connector = new PostgresConnector();
      return connector.UpdateCredentials(id, login, email, password)
        .then((res: any) => {
          console.log(JSON.stringify(res));
          return res.message;
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

  deleteAccount(login: string, password: string): any {
    this.logger.info('Delete account');

    try {
      const connector = new PostgresConnector();
      return connector.DeleteCredentials(login, password)
        .then((res: any) => {
          console.log(JSON.stringify(res));
          return res.message;
        })
        .catch((err: any) => {
          console.error(err);
          return 'account deletion failed';
        });
    } catch (err) {
      console.log(err);
      return 'account deletion failed';
    }
  }

  me(user: any) {
    this.logger.debug('me');
    LoginController.CheckUserAuthenticated(user);
   
    try {
      const connector = new PostgresConnector();
      return connector.GetPersonByLogin(user.login)
        .then((res: any) => res)
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
