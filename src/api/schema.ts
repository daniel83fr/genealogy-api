import { GraphQLList, GraphQLString, buildSchema } from "graphql";

var graphql = require('graphql');

var schema = buildSchema(`
  type User {
    _id: String
    FirstName: String
    LastName: String
    MaidenName: String
    Gender: String
    BirthDate : String
  }

  type Query {

    getPersons: [User]

    getPersonById(_id: String!): User

    getFatherById(_id: String!): User

    getMotherById(_id: String!): User

    getChildrenById(_id: String!): [User]

    getSiblingsById(_id: String!): [User]

    getSpousesById(_id: String!): [User]
  }
`);

export default schema