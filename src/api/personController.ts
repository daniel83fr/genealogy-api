import {
    memberCollection,
    mongoDbDatabase,
    getArrayFromMongoDb
} from "./mongoDbConnector";

import {LoggerService} from '../services/logger_service';

var personResolver = {
    getPersons: getPersonList(),
}
export default personResolver;

function mapping(element: any) {
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

function getPersonList() {

    let logger = new LoggerService('personController')
    logger.info('Get person list')
    console.debug("Get person list")
    return () => {

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

        return getArrayFromMongoDb(mongoDbDatabase, memberCollection, query, projection )
            .then((res: any[]) => {
                return res.map(mapping);
            });
    };
}



