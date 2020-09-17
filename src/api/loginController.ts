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
          return res;
        })
        .catch((err: any) => {
          console.error(err);

          return {
            message: 'registration failed',
            success: false
          };
        });
    } catch (err) {
      console.log(err);
      return {
        message: 'registration failed',
        success: false
      };
    }


  }

  updateAccount(email: string, password: string, newEmail: string, newPassword: string): any {
    this.logger.info('Update account');

    try {
      const connector = new PostgresConnector();
      return connector.UpdateCredentials(email, password, newEmail, newPassword)
        .then((res: any) => {
          console.log(JSON.stringify(res));
          return res;
        })
        .catch((err: any) => {
          console.error(err);
          return {
            message: 'update failed',
            success: false
          };
        
        });
    } catch (err) {
      console.log(err);
      return {
        message: 'update failed',
        success: false
      };
    }
  }

  deleteAccount(email: string, password: string): any {
    this.logger.info('Delete account');

    try {
      const connector = new PostgresConnector();
      return connector.DeleteCredentials(email, password)
        .then((res: any) => {
          console.log(JSON.stringify(res));
          return res;
        })
        .catch((err: any) => {
          console.error(err);
          return {
            message: 'account deletion failed',
            success: false
          };
        });
    } catch (err) {
      console.log(err);
      return {
        message: 'account deletion failed',
        success: false
      };
    }
  }

  updateNickname(email: string, nickname: string): any {
    this.logger.info('Claim profile');

    try {
      const connector = new PostgresConnector();
      return connector.SetNickname(email, nickname)
        .then((res: any) => {
          console.log(JSON.stringify(res));
          return res;
        })
        .catch((err: any) => {
          console.error(err);
          return {
            message: 'set nickname failed',
            success: false
          };
        });
    } catch (err) {
      console.log(err);
      return {
        message: 'set nickname failed',
        success: false
      };
    }
  }

  claimProfile(email: string, id: string): any {
    this.logger.info('Claim profile');

    try {
      const connector = new PostgresConnector();
      return connector.ClaimProfile(email, id)
        .then((res: any) => {
          console.log(JSON.stringify(res));
          return res;
        })
        .catch((err: any) => {
          console.error(err);
          return {
            message: 'profile claim failed',
            success: false
          };
        });
    } catch (err) {
      console.log(err);
      return {
        message: 'profile claim failed',
        success: false
      };
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

  getNickname(email: any) {
    this.logger.debug('test');
    this.logger.debug('me');
   // LoginController.CheckUserAuthenticated(user);
   console.debug(email);
    try {
      const connector = new PostgresConnector();
      return connector.GetPersonByLogin(email)
        .then((res: any) => res.nickname)
        .catch((err: any) => {
          console.error(err);
          return null;
        });
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  getProfileId(email: any) {
    this.logger.debug('me');
   // LoginController.CheckUserAuthenticated(user);
   console.debug(email);
    try {
      const connector = new PostgresConnector();
      return connector.GetPersonByLogin(email)
        .then((res: any) => res.profileId)
        .catch((err: any) => {
          console.error(err);
          return null;
        });
    } catch (err) {
      console.log(err);
      return null;
    }
  }

}
