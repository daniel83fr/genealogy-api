import { GraphQLList, GraphQLString, buildSchema } from "graphql";

var graphql = require('graphql');

var schema = buildSchema(`
  scalar DateTime

  type User {
    _id: String
    firstName: String
    lastName: String
    maidenName: String
    gender: String
    yearOfBirth : String
    yearOfDeath: String
  }

  input UserChanges {
    firstName: String
    lastName: String
    maidenName: String
    gender: String
    birthDate : String
    deathDate : String
  }

  type Token {
    success: Boolean,
    error: String,
    token: String
  }

  type Query {

    login(login: String!, password: String): Token

    register(id: String!, login: String!, password: String): String

    me: String

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