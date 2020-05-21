import {
    getPersonsFromMongoDb,
    getPersonByIdFromMongoDb,
    getParentByIdFromMongoDb,
    getChildrenByIdFromMongoDb,
    getSiblingsByIdFromMongoDb,
    getSpousesByIdFromMongoDb,
    deleteRelationFromMongoDb,
    addParentRelationFromMongoDb,
    addSpouseRelationFromMongoDb,
    addSiblingRelationFromMongoDb,
    getUnusedPersonsFromMongoDb,
    updatePersonFromMongoDb,
    deleteSiblingRelationFromMongoDb,
    createPersonFromMongoDb,
    deleteProfileFromMongoDb,
    shouldResetCacheFromMongoDb,
    checkCredentialsFromMongoDb,
    createCredentialsFromMongoDb,
    getPersonByLoginFromMongoDb,
    getPhotosByIdFromMongoDb,
    getPhotoProfileFromMongoDb,
    addPhotoFromMongoDb,
    getPhotosRandomFromMongoDb,
    getAuditLastEntriesFromMongoDb,
    getTodayDeathdaysFromMongoDb,
    getTodayBirthdaysFromMongoDb,
    getTodayMarriagedaysFromMongoDb,
    setProfilePictureFromMongo,
    deletePhotoFromMongo,
    addPhotoTagFromMongo,
    removePhotoTagFromMongo
} from "../api/mongoDbConnector";

const exjwt = require('express-jwt');
const jwt = require('jsonwebtoken');


var resolver = {

    getPersons: getPersons(),

    getUnusedPersons: getUnusedPersons(),

    getPersonById: (args: any) => getPersonById(args._id),

    getFatherById: (args: any) => getParentById(args._id, "Male"),

    getMotherById: (args: any) => getParentById(args._id, "Female"),

    getChildrenById: (args: any) => getChildrenById(args._id),

    getSpousesById: (args: any) => getSpousesById(args._id),

    getSiblingsById: (args: any) => getSiblingsById(args._id),

    removeLink: (args: any) => removeLink(args._id1, args._id2),
    removeSiblingLink: (args: any) => removeSiblingLink(args._id1, args._id2),
    addParentLink: (args: any) => addParentLink(args._id, args._parentId),

    addChildLink: (args: any) => addParentLink(args._childId, args._id),

    addSpouseLink: (args: any) => addSpouseLink(args._id1, args._id2),
    addSiblingLink: (args: any) => addSiblingLink(args._id1, args._id2),

    createPerson: (args: any) => createPerson(args.person),
    updatePerson: (args: any) => updatePerson(args._id, args.patch),

    removeProfile: (args: any) => removeProfile(args._id),

    shouldResetCache: (args: any) => shouldResetCache(args.lastEntry),

    shouldResetPersonCache: (args: any) => shouldResetPersonCache(args._id, args.lastEntry),

    login: (args: any) => login(args.login, args.password),

    register: (args: any) => register(args.id, args.login, args.password),

    me: (args: any, context: any) => me(context.user),

    getPrivateInfoById: (args: any, context: any) => getPrivateInfoById(args._id, context.user),

    updatePersonPrivateInfo: (args: any, context: any) => updatePersonPrivateInfo(args._id, args.patch, context.user),

    getPhotosById: (args: any) => getPhotosById(args._id),
    getPhotoProfile: (args: any) => getPhotoProfile(args._id),

    getPhotosRandom: (args: any) => getPhotosRandom(args.number),

    getAuditLastEntries: (args: any) => getAuditLastEntries(args.number),

    addPhoto: (args: any, context: any) => addPhoto(args.url, args.deleteHash, args.persons, context.user),

    getTodayBirthdays: (args: any, context: any) => getTodayBirthdays(context.user),
    getTodayDeathdays: (args: any, context: any) => getTodayDeathdays(context.user),
    getTodayMarriagedays: (args: any, context: any) => getTodayMarriagedays(context.user),

    setProfilePicture: (args: any, context:any) =>  setProfilePicture(args.person, args.image),
    deletePhoto: (args: any, context:any) =>  deletePhoto(args.image),

    addPhotoTag: (args: any) => addPhotoTag(args.image, args.tag),
    removePhotoTag: (args: any) => removePhotoTag(args.image, args.tag),
};

export default resolver;

function getPersons() {

    console.debug("GetPersons")
    return () => {
        return getPersonsFromMongoDb()
            .then(res => {
                let items: any[] = [];
                res = Object.assign(res);
                res.forEach((element: {
                    _id: any;
                    firstName: any;
                    lastName: any;
                    maidenName: any;
                    gender: any;
                    birthDate: any;
                    deathDate: any;
                    isDead: boolean;
                }) => {

                    let yearOfBirth = element.birthDate?.substring(0, 4)
                    let yearOfDeath = element.deathDate?.substring(0, 4)
                    items.push({
                        "_id": element._id,
                        "firstName": element.firstName,
                        "lastName": element.lastName,
                        "maidenName": element.maidenName,
                        "gender": element.gender,
                        "yearOfBirth": yearOfBirth == "0000" ? null : yearOfBirth,
                        "yearOfDeath": yearOfDeath == "0000" ? null : yearOfDeath,
                        "isDead": element.isDead ?? false
                    });
                });
                console.debug(JSON.stringify(items))
                return items;
            });
    };
}

function getUnusedPersons() {

    console.debug("GetPersons")
    return () => {
        return getUnusedPersonsFromMongoDb()
            .then(res => {
                let items: any[] = [];
                res = Object.assign(res);
                res.forEach((element: {
                    _id: any;
                    FirstName: any;
                    LastName: any;
                }) => {
                    items.push({
                        "_id": element._id,
                        "FirstName": element.FirstName,
                        "LastName": element.LastName
                    });
                });
                console.debug(JSON.stringify(items))
                return items;
            });
    };
}

function getPersonById(_id: string) {
    console.debug("GetPersonById")
    return getPersonByIdFromMongoDb(_id)
        .catch(err => {
            throw err;
        })
        .then(res => {
            res = Object.assign(res);

            let yearOfBirth = res.birthDate?.substring(0, 4)
            let yearOfDeath = res.deathDate?.substring(0, 4)

            return {
                "_id": _id,
                "firstName": res.firstName,
                "lastName": res.lastName,
                "maidenName": res.maidenName,
                "birthDate": res.birthDate,
                "gender": res.gender,
                "yearOfBirth": yearOfBirth == "0000" ? null : yearOfBirth,
                "yearOfDeath": yearOfDeath == "0000" ? null : yearOfDeath,
                "isDead": res.isDead ?? false
            }
        });
}

function getParentById(_id: string, gender: string) {
    console.debug("GetParentById"); 
    return getParentByIdFromMongoDb(_id, gender)
        .catch(err => {
            throw err;
        })
        .then(res => {

            let yearOfBirth = res.birthDate?.substring(0, 4)
            let yearOfDeath = res.deathDate?.substring(0, 4)
            res = Object.assign(res);
            return {
                "_id": res._id,
                "firstName": res.firstName,
                "lastName": res.lastName,
                "maidenName": res.maidenName,
                "gender": res.gender,
                "yearOfBirth": yearOfBirth == "0000" ? null : yearOfBirth,
                "yearOfDeath": yearOfDeath == "0000" ? null : yearOfDeath,
                "isDead": res.isDead ?? false
            }


        }

        );
}

function getChildrenById(_id: string) {
    console.debug("GeChildrenById")
    return getChildrenByIdFromMongoDb(_id)
        .catch(err => {
            throw err;
        })
        .then(res => {

            let items: any[] = []
            res = Object.assign(res);
            res.forEach((element: { _id: any; firstName: any; lastName: any; maidenName: any; birthDate: any; deathDate: any; gender: any; }) => {

                let yearOfBirth = element.birthDate?.substring(0, 4)
                let yearOfDeath = element.deathDate?.substring(0, 4)
                items.push({
                    "_id": element._id,
                    "firstName": element.firstName,
                    "lastName": element.lastName,
                    "maidenName": element.maidenName,
                    "gender": element.gender,
                    "yearOfBirth": yearOfBirth == "0000" ? null : yearOfBirth,
                    "yearOfDeath": yearOfDeath == "0000" ? null : yearOfDeath,
                    "isDead": res.isDead ?? false
                })
            });
            return items;
        });
}

function getSpousesById(_id: string) {
    console.debug("GetSpousesById")
    return getSpousesByIdFromMongoDb(_id)
        .catch(err => {
            throw err;
        })
        .then(res => {

            let items: any[] = []
            res = Object.assign(res);
            res.forEach((element: { _id: any; firstName: any; lastName: any; maidenName: any; birthDate: any; deathDate: any; gender: any; }) => {
                let yearOfBirth = element.birthDate?.substring(0, 4)
                let yearOfDeath = element.deathDate?.substring(0, 4)
                items.push({
                    "_id": element._id,
                    "firstName": element.firstName,
                    "lastName": element.lastName,
                    "maidenName": element.maidenName,
                    "birthDate": element.birthDate,
                    "gender": element.gender,
                    "yearOfBirth": yearOfBirth == "0000" ? null : yearOfBirth,
                    "yearOfDeath": yearOfDeath == "0000" ? null : yearOfDeath,
                    "isDead": res.isDead ?? false
                })
            });
            return items;
        });
}

function getSiblingsById(_id: string) {
    console.debug("GetSiblingsById")
    return getSiblingsByIdFromMongoDb(_id)
        .catch(err => {
            throw err;
        })
        .then(res => {

            let items: any[] = []
            res = Object.assign(res);
            res.forEach((element: { _id: any; firstName: any; lastName: any; maidenName: any; birthDate: any; deathDate: any; gender: any; }) => {
                let yearOfBirth = element.birthDate?.substring(0, 4)
                let yearOfDeath = element.deathDate?.substring(0, 4)
                items.push({
                    "_id": element._id,
                    "firstName": element.firstName,
                    "lastName": element.lastName,
                    "maidenName": element.maidenName,
                    "birthDate": element.birthDate,
                    "gender": element.gender,
                    "yearOfBirth": yearOfBirth == "0000" ? null : yearOfBirth,
                    "yearOfDeath": yearOfDeath == "0000" ? null : yearOfDeath,
                    "isDead": res.isDead ?? false
                })
            });
            return items;
        });
}

function removeLink(id1: string, id2: string) {
    console.debug("Remove link")
    return deleteRelationFromMongoDb(id1, id2)
        .catch(err => {
            throw err;
        })
        .then(res => {
            return res;
        });
}

function removeProfile(id: string) {
    console.debug("Remove profile")
    return deleteProfileFromMongoDb(id)
        .catch(err => {
            throw err;
        })
        .then(res => {
            return res;
        });
}

function removeSiblingLink(id1: string, id2: string) {
    console.debug("Remove sibling link")
    return deleteSiblingRelationFromMongoDb(id1, id2)
        .catch(err => {
            throw err;
        })
        .then(res => {
            return res;
        });
}

function addParentLink(id: string, parentId: string) {
    console.debug("Add parent link")
    return addParentRelationFromMongoDb(id, parentId)
        .catch(err => {
            throw err;
        })
        .then(res => {
            return res;
        });
}

function addSpouseLink(id1: string, id2: string) {
    console.debug("Add spouse link")
    return addSpouseRelationFromMongoDb(id1, id2)
        .catch(err => {
            throw err;
        })
        .then(res => {
            return res;
        });
}

function addSiblingLink(id1: string, id2: string) {
    console.debug("Add spouse link")
    return addSiblingRelationFromMongoDb(id1, id2)
        .catch(err => {
            throw err;
        })
        .then(res => {
            return res;
        });
}

function updatePerson(_id: string, patch: any) {
    if (patch == {}) {
        return null;
    }
    console.debug("UpdatePersons")

    console.debug(_id)
    console.debug(JSON.stringify(patch))

    return updatePersonFromMongoDb(_id, patch)
        .catch(err => {
            throw err;
        })
        .then((res: any) => {
            return res
        });

}

function createPerson(person: any) {

    console.debug("Create Person")

    return createPersonFromMongoDb(person)
        .catch(err => {
            throw err;
        })
        .then((res: any) => {
            return res
        });

}

function shouldResetCache(lastEntry: string) {
    let lastEntry2 = new Date(lastEntry)
    return shouldResetCacheFromMongoDb(lastEntry2)
        .catch(err => {
            throw err;
        })
        .then((res: any) => {
            return res

        });




}


function shouldResetPersonCache(_id: String, lastEntry: Date) {
    return true
}

function login(login: string, password: string): any {

    const jwtMW = exjwt({
        secret: process.env.SECRET
    });

    return checkCredentialsFromMongoDb(login, password)
        .then(res => {
            console.log("then")
            if (res.success == true) {
                let token = jwt.sign(
                    { 
                        login: login,
                        profile : res.profileId
                    }, process.env.SECRET, { expiresIn: 129600 });
                return {
                    "success": true,
                    "token": token,
                    "error": ""
                }
            }
            return {
                "success": false,
                "token": "",
                "error": 'Username or password is incorrect'
            }
        })

}

function register(id: string, login: string, password: string): any {
    return createCredentialsFromMongoDb(id, login, password)
        .then(res => {
            console.log("123456")
            return "login created"
        })
        .catch(err => {
            return "registration failed"
        })

}



function CheckUserAuthenticated(user: any) {
    if (!user) {
        throw Error("Not authenticated, please login first")
    }
}

function me(user: any) {
    CheckUserAuthenticated(user);
    return getPersonByLoginFromMongoDb(user.login)
        .then(res => {
            return res;
        });
}

function getTodayBirthdays(user: any) {
    CheckUserAuthenticated(user);

    return getTodayBirthdaysFromMongoDb()
        .catch((err: any) => {
            throw err;
        })
        .then((res: any) => {
            return res;
        });
}

function getTodayDeathdays(user: any) {

    CheckUserAuthenticated(user);

    return getTodayDeathdaysFromMongoDb()
        .catch((err: any) => {
            throw err;
        })
        .then((res: any) => {
            return res;
        });
}

function getTodayMarriagedays(user: any) {

    CheckUserAuthenticated(user);
    return getTodayMarriagedaysFromMongoDb()
        .catch((err: any) => {
            throw err;
        })
        .then((res: any) => {
            return res;
        });
}

function addPhoto(url: string, deleteHash: string, persons: string[],  user: any) {

    console.debug("add photo")

    CheckUserAuthenticated(user);
    if(persons == null || persons.length == 0){
        throw Error("Need tag at least one person")
    }
    return addPhotoFromMongoDb(url, deleteHash, persons)
        .catch((err: any) => {
            throw err;
        })
        .then((res: any) => {
            return res;
        });
}

function getPhotosById(_id: string) {

    console.debug("GetPhotos")
    return getPhotosByIdFromMongoDb(_id)
        .catch((err: any) => {
            throw err;
        })
        .then((res: object) => {
            res = Object.assign(res);
            return res;
        });
}

function setProfilePicture(person: string, image: string): Promise<string> {
    return setProfilePictureFromMongo(person, image)
    .catch((err:any)=>{
        throw err;
    })
    .then((res:any)=>{
        return "Done";
    });
}

function addPhotoTag(image: string, person: string): Promise<string> {
    return addPhotoTagFromMongo(person, image)
    .catch((err:any)=>{
        throw err;
    })
    .then((res:any)=>{
        return "Done";
    });
}

function removePhotoTag(image: string, person: string): Promise<string> {
    return removePhotoTagFromMongo(person, image)
    .catch((err:any)=>{
        throw err;
    })
    .then((res:any)=>{
        return "Done";
    });
}

function deletePhoto(image: string): Promise<string> {
    return deletePhotoFromMongo( image)
    .catch((err:any)=>{
        throw err;
    })
    .then((res:any)=>{
        return "Done";
    });
}

function getPhotoProfile(_id: string) {

    console.debug("GetPhotos")
    return getPhotoProfileFromMongoDb(_id)
        .catch((err: any) => {
            throw err;
        })
        .then((res: object) => {
            res = Object.assign(res);
            return res;
        });
}
function getPhotosRandom(number: number) {

    console.debug("GetPhotos")
    return getPhotosRandomFromMongoDb(number)
        .catch((err: any) => {
            throw err;
        })
        .then((res: object) => {
            res = Object.assign(res);
            return res;
        });
}
function getAuditLastEntries(number: number) {

    console.debug("Get Audit")
    return getAuditLastEntriesFromMongoDb(number)
        .catch((err: any) => {
            throw err;
        })
        .then((res: object) => {
            res = Object.assign(res);
            return res;
        });
}

function getPrivateInfoById(_id: string, user: any) {
    CheckUserAuthenticated(user);
    console.debug("GetPersonById(private)")
    return getPersonByIdFromMongoDb(_id)
        .catch(err => {
            throw err;
        })
        .then(res => {
            res = Object.assign(res);

            let yearOfBirth = res.birthDate?.substring(0, 4)
            let yearOfDeath = res.deathDate?.substring(0, 4)

            return {
                "_id": _id,
                "birthDate": res.birthDate,
                "deathDate": res.deathDate,
                "location": res.currentLocation,
                "birthLocation": res.birthLocation,
                "deathLocation": res.deathLocation,
                "email": res.email,
                "phone": res.phone
            }
        });
}

function updatePersonPrivateInfo(_id: string, patch: any, user: any) {
    if (patch == {}) {
        return null;
    }
    CheckUserAuthenticated(user);
    console.debug("UpdatePersonspivate")

    console.debug(_id)
    console.debug(JSON.stringify(patch))

    return updatePersonFromMongoDb(_id, patch)
        .catch(err => {
            throw err;
        })
        .then((res: any) => {
            return res
        });

}
