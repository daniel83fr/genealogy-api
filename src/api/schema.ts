import { GraphQLList, GraphQLString, buildSchema } from "graphql";

var graphql = require('graphql');

var schema = buildSchema(`
  scalar DateTime

  type User {
    _id: String
    FirstName: String
    LastName: String
    MaidenName: String
    Gender: String
    YearOfBirth : String
    YearOfDeath: String
  }

  input UserChanges {
    FirstName: String
    LastName: String
    MaidenName: String
    Gender: String
    BirthDate : String
    DeathDate : String
  }

  type Query {

    getPersons: [User]

    getPersonById(_id: String!): User

    getFatherById(_id: String!): User

    getMotherById(_id: String!): User

    getChildrenById(_id: String!): [User]

    getSiblingsById(_id: String!): [User]

    getSpousesById(_id: String!): [User]

    shouldResetCache(lastEntry:DateTime): Boolean

    shouldResetPersonCache(_id:String, lastEntry:DateTime): Boolean
  }

  type Mutation {

    removeLink(_id1: String!, _id2: String!): String

    removeSiblingLink(_id1: String!, _id2: String!): String

    removeProfile(_id: String!): String

    addParentLink(_id: String!, _parentId: String!): String

    addChildLink(_id: String!, _childId: String!): String

    addSpouseLink(_id1: String!, _id2: String!): String

    addSiblingLink(_id1: String!, _id2: String!): String

    createPerson(person: UserChanges): User

    updatePerson(_id:String!, patch: UserChanges): User


  }
`);

export default schema