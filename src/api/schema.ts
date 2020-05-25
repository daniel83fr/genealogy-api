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
    isDead: Boolean
  }

  type UserPrivate {
    _id: String
    birthDate: DateTime,
    deathDate: DateTime,
    currentLocation: String,
    birthLocation: String,
    deathLocation: String,
    email: String,
    phone: String
  }

  input UserPrivateChanges{
    birthDate: DateTime
    deathDate: DateTime,
    currentLocation: String,
    birthLocation: String,
    deathLocation: String,
    email: String,
    phone: String
  }

  input UserChanges {
    firstName: String
    lastName: String
    maidenName: String
    gender: String
    birthDate : String
    deathDate : String
    isDead: Boolean
  }

  type ConnectedUser {
    login: String,
    id: String
  }

  type Photo {
    url: String
    _id: String
    persons: [User]
  }

  type AuditEntry{
    timestamp: DateTime,
    type: String,
    id: String,
    user: String
    action: String
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

    getPersonList: [User]

    """
    Get person's public infos
    """
    getPerson(_id: String!): User
    
    getAuditLastEntries(number: Int!): [AuditEntry],
    getPhotoProfile(_id: String!): Photo,
    getPhotosById(_id: String!): [Photo],
    getPhotosRandom(number: Int!): [Photo],
    """
    Get person's private infos (using provided token and role)
    """
    getPrivateInfo(_id:String!): UserPrivate

    getFather(_id: String!): User

    getMother(_id: String!): User

    getChildren(_id: String!): [User]

    getSiblings(_id: String!): [User]

    getSpouses(_id: String!): [User]

    getTodayBirthdays: [User]
    getTodayDeathdays: [User]
    getTodayMarriagedays: [User]
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

    setProfilePicture(person: String!, image: String!): String
    deletePhoto(image: String!): String
    addPhotoTag(image: String!, tag: String!): String
    removePhotoTag(image: String!, tag: String!): String
  }
`);

export default schema