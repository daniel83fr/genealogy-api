import {
    memberCollection,
    mongoDbDatabase,
    getArrayFromMongoDb,
    getItemFromMongoDb,
    getParentByIdFromMongoDb,
    getChildrenByIdFromMongoDb,
    getSpousesByIdFromMongoDb,
    getSiblingsByIdFromMongoDb,
} from "./mongoDbConnector";
const ObjectId = require('mongodb').ObjectID;
import { LoggerService } from '../services/logger_service';

class PersonController {
    logger: LoggerService = new LoggerService('personController');

    personResolver = {
        getPersons: this.getPersonList(),

        getPersonById: (args: any) => this.getPersonById(args._id),

        getFatherById: (args: any) => this.getParentById(args._id, "Male"),

        getMotherById: (args: any) => this.getParentById(args._id, "Female"),

        getChildrenById: (args: any) => this.getChildrenById(args._id),

        getSpousesById: (args: any) => this.getSpousesById(args._id),

        getSiblingsById: (args: any) => this.getSiblingsById(args._id),

        getPrivateInfoById: (args: any, context: any) => this.getPrivateInfoById(args._id, context.user),

    }

    mapping(element: any) {
        let yearOfBirth = element.birthDate?.substring(0, 4)
        let yearOfDeath = element.deathDate?.substring(0, 4)
        return {
            "_id": element._id,
            "firstName": element.firstName,
            "lastName": element.lastName,
            "maidenName": element.maidenName,
            "gender": element.gender,
            "yearOfBirth": yearOfBirth == "0000" ? null : yearOfBirth,
            "yearOfDeath": yearOfDeath == "0000" ? null : yearOfDeath,
            "isDead": element.isDead ?? false
        }
    }

    getPersonList() {

        this.logger.info('Get person list')

        let query = {};
        let projection = {
            firstName: 1,
            lastName: 1,
            maidenName: 1,
            birthDate: 1,
            gender: 1,
            deathDate: 1,
            isDead: 1
        }

        return getArrayFromMongoDb(mongoDbDatabase, memberCollection, query, projection)
            .then((res: any[]) => {
                return res.map(this.mapping);
            });

    }

    getPersonById(_id: string) {
        
        this.logger.info('Get person by Id')

        let query = { _id: ObjectId(_id) };
        let projection = {};
        return getItemFromMongoDb(mongoDbDatabase, memberCollection, query, projection)
            .catch((err: any) => {
                throw err;
            })
            .then((res: any) => {
                return this.mapping(res)
            });
    }

    getParentById(_id: string, gender: string) {
        
        this.logger.info(`Get ${gender == "Male"? "Father" : "Mother"} by id `)

        return getParentByIdFromMongoDb(_id, gender)
            .catch((err: any) => {
                throw err;
            })
            .then((res: object) => {
                return this.mapping(res);
            });
    }

    getChildrenById(_id: string) {

        this.logger.info('Get children by id')

        return getChildrenByIdFromMongoDb(_id)
            .catch((err: any) => {
                throw err;
            })
            .then((res: any[]) => {

                return res.map(this.mapping);
            });
    }

    getSpousesById(_id: string) {

        this.logger.info('Get spouses by id')

        return getSpousesByIdFromMongoDb(_id)
            .catch(err => {
                throw err;
            })
            .then(res => {
                return res.map(this.mapping);

            });
    }

    getSiblingsById(_id: string) {

         this.logger.info('Get siblings by id')

        return getSiblingsByIdFromMongoDb(_id)
            .catch(err => {
                throw err;
            })
            .then(res => {
                return res.map(this.mapping);

            });
    }

    getPrivateInfoById(_id: string, user: any) {

        this.logger.info('Get private infos by id')

        this.CheckUserAuthenticated(user);
        let query = { _id: ObjectId(_id) };
        let projection = {};
        return getItemFromMongoDb(mongoDbDatabase, memberCollection, query, projection)
            .catch(err => {
                throw err;
            })
            .then(res => {
                return this.mapping(res);
            });
    }

    CheckUserAuthenticated(user: any) {
        if (!user) {
            throw Error("Not authenticated, please login first")
        }
    }
}


export default new PersonController();


