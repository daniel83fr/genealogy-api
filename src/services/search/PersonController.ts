import {
  createPerson1, deletePerson, updatePerson1, getRelation, removeRelation,
  addParentRelation, addSpouseRelation, updateRelation1, getPersonFull, getUnusedPerson, searchPerson1, initClient, runQuery
} from "./providers/MongoDataProvider";
import { userInfo } from "os";
import { link } from "fs";

export class UserRel {
  Person1: string = '';
  Person2: string = '';
  Type: string = '';
}

export class UserReferences {
  WikiTree: string = '';

}

class RestLink {
  href: string = "";
  rel: string = "";
  type: string = "";
}

export class User {

  _id: string = '';
  FirstName: string = '';
  LastName: string = '';
  Gender: string = '';
  BirthDate: string = '';
  BirthLocation: string = '';
  References: UserReferences = new UserReferences();


  Parents: string[] = [];
  Spouses: string[] = [];
  Children: string[] = [];

  links: RestLink[] = []

}



function MapUser(dbUser: any, dbRels: any, route: string) {

  var usr = new User()
  usr._id = dbUser._id.toString();
  usr.FirstName = dbUser.FirstName;
  usr.LastName = dbUser.LastName;
  usr.Gender = dbUser.Gender;
  usr.BirthDate = dbUser.BirthDate;
  usr.BirthLocation = dbUser.BirthLocation;

  dbRels.forEach(function (value: UserRel) {

    var rel = new RestLink()

    var otherPerson = "";
    if (value.Person1.toString() == dbUser._id.toString()) {
      otherPerson = value.Person2
    } else {
      otherPerson = value.Person1
    }

    if (value.Type === "Parent") {
      if (value.Person1.toString() == dbUser._id.toString()) {
        usr.Children.push(otherPerson)
        rel.type = "GET"
        rel.rel = "child"
        rel.href = `${route}person/${otherPerson}`
      } else {
        usr.Parents.push(otherPerson)
        rel.type = "GET"
        rel.rel = "parent"
        rel.href = `${route}person/${otherPerson}`
      }
    }
    else {
      usr.Spouses.push(otherPerson)
      rel.type = "GET"
      rel.rel = "spouse"
      rel.href = `${route}person/${otherPerson}`
    }
    usr.links.push(rel)
  });



  return usr;
}

export const createPerson = async (user: User, r: string) => {

  return createPerson1(user)
}

export const searchPerson = async (query: string, page: number, limit: number) => {
  return searchPerson1(query, page, limit);
}

export const updatePerson = async (id: string, r: object) => {

  return updatePerson1(id, r)
}

export const updateRelation = async (id: string, id2: string, r: object) => {

  return updateRelation1(id, id2, r)
}

export const getPersonRelations = async (id: string) => {

  return getPersonRelations1(id)
}

export const unlinkRelations = async (id: string, id2: string) => {

  return await removeRelation(id, id2);
}

export const linkParentRelations = async (id: string, id2: string) => {

  return await addParentRelation(id, id2);
}

export const getUnusedPersons = async () => {

  return await getUnusedPerson();
}

export const linkSpouseRelations = async (id: string, id2: string) => {

  return await addSpouseRelation(id, id2);
}

export const deletePersonById = async (id: string) => {

  return deletePerson(id)
}
const mongoDbDatabase = process.env.MONGODB_DATABASE;

const memberCollection = "members";
const auditCollection = "audit";
const relationCollection = "relations";

export const getPersonById = async (id: string) => {
  console.log("Get Person" + id)
  initClient().then(client => {
    const db = client.db(mongoDbDatabase);
    let collection = db.collection(memberCollection);
    let query = { "_id": id }

    collection.findOne(query).then((res: any) => {
      return res
    });
  }
  );
}



export const getPersonRelations1 = async (id: string) => {

  var main = await getRelation(id);
  return main;
};


export const getPersonByIdFull = async (q: string) => {
  var response = await getPersonFull(q);

  return response
};