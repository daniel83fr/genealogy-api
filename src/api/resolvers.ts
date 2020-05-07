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
    shouldResetCacheFromMongoDb
} from "../api/mongoDbConnector";


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

    addChildLink: (args: any) => addParentLink( args._childId, args._id),

    addSpouseLink: (args: any) => addSpouseLink( args._id1, args._id2),
    addSiblingLink: (args: any) => addSiblingLink( args._id1, args._id2),

    createPerson: (args: any) => createPerson(args.person),
    updatePerson: (args: any) => updatePerson(args._id, args.patch),

    removeProfile: (args: any) => removeProfile(args._id),

    shouldResetCache: (args:any)=> shouldResetCache(args.lastEntry),

    shouldResetPersonCache: (args:any)=> shouldResetPersonCache(args._id, args.lastEntry)
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
                    FirstName: any;
                    LastName: any;
                    MaidenName: any;
                    Gender: any;
                    BirthDate: any;
                    DeathDate: any
                }) => {

                    let yearOfBirth = element.BirthDate?.substring(0,4)
                    let yearOfDeath = element.DeathDate?.substring(0,4)
                    items.push({
                        "_id": element._id,
                        "FirstName": element.FirstName,
                        "LastName": element.LastName,
                        "MaidenName": element.MaidenName,
                        "Gender": element.Gender,
                        "YearOfBirth": yearOfBirth == "0000"? null: yearOfBirth,
                        "YearOfDeath": yearOfDeath == "0000"? null: yearOfDeath,
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

            let yearOfBirth = res.BirthDate?.substring(0,4)
            let yearOfDeath = res.DeathDate?.substring(0,4)

            return {
                "_id": _id,
                "FirstName": res.FirstName,
                "LastName": res.LastName,
                "MaidenName": res.MaidenName,
                "BirthDate": res.BirthDate,
                "Gender": res.Gender,
                "YearOfBirth": yearOfBirth == "0000"? null: yearOfBirth,
                "YearOfDeath": yearOfDeath == "0000"? null: yearOfDeath,
            }
        });
}

function getParentById(_id: string, gender: string) {
    console.debug("GetParentById")
    return getParentByIdFromMongoDb(_id, gender)
        .catch(err => {
            throw err;
        })
        .then(res => {

            let yearOfBirth = res.BirthDate?.substring(0,4)
            let yearOfDeath = res.DeathDate?.substring(0,4)
            res = Object.assign(res);
            return {
                "_id": res._id,
                "FirstName": res.FirstName,
                "LastName": res.LastName,
                "MaidenName": res.MaidenName,
                "Gender": res.Gender,
                "YearOfBirth": yearOfBirth == "0000"? null: yearOfBirth,
                "YearOfDeath": yearOfDeath == "0000"? null: yearOfDeath,
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
            res.forEach((element: { _id: any; FirstName: any; LastName: any; MaidenName: any; BirthDate: any; DeathDate: any;Gender: any; }) => {
               
                let yearOfBirth = element.BirthDate?.substring(0,4)
                let yearOfDeath = element.DeathDate?.substring(0,4)
                items.push({
                    "_id": element._id,
                    "FirstName": element.FirstName,
                    "LastName": element.LastName,
                    "MaidenName": element.MaidenName,
                    "Gender": element.Gender,
                    "YearOfBirth": yearOfBirth == "0000"? null: yearOfBirth,
                    "YearOfDeath": yearOfDeath == "0000"? null: yearOfDeath,
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
            res.forEach((element: { _id: any; FirstName: any; LastName: any; MaidenName: any; BirthDate: any;DeathDate: any; Gender: any; }) => {
                let yearOfBirth = element.BirthDate?.substring(0,4)
                let yearOfDeath = element.DeathDate?.substring(0,4)
                                items.push({
                    "_id": element._id,
                    "FirstName": element.FirstName,
                    "LastName": element.LastName,
                    "MaidenName": element.MaidenName,
                    "BirthDate": element.BirthDate,
                    "Gender": element.Gender,
                    "YearOfBirth": yearOfBirth == "0000"? null: yearOfBirth,
                    "YearOfDeath": yearOfDeath == "0000"? null: yearOfDeath,
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
            res.forEach((element: { _id: any; FirstName: any; LastName: any; MaidenName: any; BirthDate: any; DeathDate: any;Gender: any; }) => {
                let yearOfBirth = element.BirthDate?.substring(0,4)
                let yearOfDeath = element.DeathDate?.substring(0,4)
                items.push({
                    "_id": element._id,
                    "FirstName": element.FirstName,
                    "LastName": element.LastName,
                    "MaidenName": element.MaidenName,
                    "BirthDate": element.BirthDate,
                    "Gender": element.Gender,
                    "YearOfBirth": yearOfBirth == "0000"? null: yearOfBirth,
                    "YearOfDeath": yearOfDeath == "0000"? null: yearOfDeath,
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

function shouldResetCache(lastEntry:string){
    let lastEntry2 = new Date(lastEntry)
    return shouldResetCacheFromMongoDb(lastEntry2)
    .catch(err => {
        throw err;
    })
    .then((res: any) => {
        return res

    });


    
  
}


function shouldResetPersonCache(_id: String, lastEntry:Date){
    return true
}