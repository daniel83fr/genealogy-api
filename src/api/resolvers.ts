import {
    getPersonsFromMongoDb,
    getPersonByIdFromMongoDb,
    getParentByIdFromMongoDb,
    getChildrenByIdFromMongoDb,
    getSiblingsByIdFromMongoDb,
    getSpousesByIdFromMongoDb,

    deleteRelationFromMongoDb,
    addParentRelationFromMongoDb
} from "../api/mongoDbConnector";

var resolver = {

    getPersons: getPersons(),

    getPersonById: (args: any) => getPersonById(args),

    getFatherById: (args: any) => getParentById(args, "Male"),

    getMotherById: (args: any) => getParentById(args, "Female"),

    getChildrenById: (args: any) => getChildrenById(args),

    getSpousesById: (args: any) => getSpousesById(args),

    getSiblingsById: (args: any) => getSiblingsById(args),

    removeLink: (args: any)=> removeLink(args._id1, args._id2),
    
    addParentLink: (args:any)=> addParentLink(  args._id, args._parentId),

    addChildLink: (args:any)=> addParentLink(args._id, args._childId)

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

function getPersonById(args: any) {
    console.debug("GetPersonById")
    return getPersonByIdFromMongoDb(args._id)
        .catch(err => {
            throw err;
        })
        .then(res => {
            res = Object.assign(res);
            return {
                "_id": res._id,
                "FirstName": res.FirstName,
                "LastName": res.LastName,
                "MaidenName": res.MaidenName,
                "BirthDate": res.BirthDate,
                "Gender": res.Gender
            }
        });
}

function getParentById(args: any, gender: string) {
    console.debug("GetParentById")
    return getParentByIdFromMongoDb(args._id, gender)
        .catch(err => {
            throw err;
        })
        .then(res => {

           
                res = Object.assign(res);
                return {
                    "_id": res._id,
                    "FirstName": res.FirstName,
                    "LastName": res.LastName,
                    "MaidenName": res.MaidenName,
                    "BirthDate": res.BirthDate,
                    "Gender": res.Gender
                }
            
           
        }

        );
}

function getChildrenById(args: any) {
    console.debug("GeChildrenById")
    return getChildrenByIdFromMongoDb(args._id)
        .catch(err => {
            throw err;
        })
        .then(res => {

            let items: any[] = []
            res = Object.assign(res);
            res.forEach((element: { _id: any; FirstName: any; LastName: any; MaidenName: any; BirthDate: any; Gender: any; }) => {
                items.push({
                    "_id": element._id,
                    "FirstName": element.FirstName,
                    "LastName": element.LastName,
                    "MaidenName": element.MaidenName,
                    "BirthDate": element.BirthDate,
                    "Gender": element.Gender
                })
            });
            return items;
        });
}

function getSpousesById(args: any) {
    console.debug("GetSpousesById")
    return getSpousesByIdFromMongoDb(args._id)
        .catch(err => {
            throw err;
        })
        .then(res => {

            let items: any[] = []
            res = Object.assign(res);
            res.forEach((element: { _id: any; FirstName: any; LastName: any; MaidenName: any; BirthDate: any; Gender: any; }) => {
                items.push({
                    "_id": element._id,
                    "FirstName": element.FirstName,
                    "LastName": element.LastName,
                    "MaidenName": element.MaidenName,
                    "BirthDate": element.BirthDate,
                    "Gender": element.Gender
                })
            });
            return items;
        });
}

function getSiblingsById(args: any) {
    console.debug("GetSiblingsById")
    return getSiblingsByIdFromMongoDb(args._id)
        .catch(err => {
            throw err;
        })
        .then(res => {

            let items: any[] = []
            res = Object.assign(res);
            res.forEach((element: { _id: any; FirstName: any; LastName: any; MaidenName: any; BirthDate: any; Gender: any; }) => {
                items.push({
                    "_id": element._id,
                    "FirstName": element.FirstName,
                    "LastName": element.LastName,
                    "MaidenName": element.MaidenName,
                    "BirthDate": element.BirthDate,
                    "Gender": element.Gender
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