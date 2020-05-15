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

  type UserPrivate {
    _id: String
    birthDate: DateTime,
    deathDate: DateTime,
    location: String
  }

  input UserPrivateChanges{
    birthDate: DateTime
    location: String
  }

  input UserChanges {
    firstName: String
    lastName: String
    maidenName: String
    gender: String
    birthDate : String
    deathDate : String
  }

  type ConnectedUser {
    login: String,
    id: String
  }

  type Photo {
    url: String
  }

  type Token {
    success: Boolean,
    error: String,
    token: String
  }

  """
  A simple GraphQL schema which is well described.
  """
  type Query {

    """
    Validates user credentials and returns authentication token
    """
    login(login: String!, password: String): Token

    """
    Creates a new user and attaches it to an existing person
    """
    register(id: String!, login: String!, password: String): String


    me: ConnectedUser

    getPersons: [User]

    """
    Get person's public infos
    """
    getPersonById(_id: String!): User
    
    getPhotosById(_id: String!): [Photo]
    """
    Get person's private infos (using provided token and role)
    """
    getPrivateInfoById(_id:String!): UserPrivate

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

    updatePersonPrivateInfo(_id:String!, patch: UserPrivateChanges): UserPrivate

    addPhoto( url : String!, deleteHash : String,  persons:[String]): String

  }
`);

export default schema