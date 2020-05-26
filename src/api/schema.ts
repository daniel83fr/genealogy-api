import { GraphQLList, GraphQLString, buildSchema } from 'graphql';

const graphql = require('graphql');

class SchemaBuilder {
  schemaTypeArray: string[] = [];

  queryDescription = '';

  mutationDescription = '';

  schemaQueryArray: string[] = [];

  schemaMutationArray: string[] = [];

  addQuery(definition: string, description: string = '') {
    this.schemaQueryArray.push(`
    """
    ${description}
    """
    ${definition}
    `);
  }

  addMutation(definition: string, description: string = '') {
    this.schemaMutationArray.push(`
    """
    ${description}
    """
    ${definition}
    `);
  }

  addType(definition: string, description: string = '') {
    this.schemaTypeArray.push(`
    """
    ${description}
    """
    ${definition}
    `);
  }

  setQueryDescription(description: string) {
    this.queryDescription = description;
  }

  setMutationDescription(description: string) {
    this.mutationDescription = description;
  }

  build() {
    const schemaItems : string[] = [];
    schemaItems.push(...this.schemaTypeArray);

    if (this.schemaQueryArray.length > 0) {
      schemaItems.push(`

    """
    ${this.queryDescription}
    """
    type Query {
    `);

      this.schemaQueryArray.forEach((elm) => {
        schemaItems.push(elm);
      });

      schemaItems.push(`
    }`);
    }

    if (this.schemaMutationArray.length > 0) {
      schemaItems.push(`

    """
    ${this.mutationDescription}
    """
    type Mutation {
    `);

      this.schemaMutationArray.forEach((elm) => {
        schemaItems.push(elm);
      });
      schemaItems.push(`
    }`);
    }

    const res = schemaItems.join('');
    return res;
  }
}

const schemaBuilder = new SchemaBuilder();
schemaBuilder.addType('scalar DateTime');
schemaBuilder.addType(`type User {
  _id: String
  firstName: String
  lastName: String
  maidenName: String
  gender: String
  yearOfBirth : String
  yearOfDeath: String
  isDead: Boolean
}`, 'Person public info');

schemaBuilder.addType(`type UserPrivate {
  _id: String
  birthDate: DateTime,
  deathDate: DateTime,
  currentLocation: String,
  birthLocation: String,
  deathLocation: String,
  email: String,
  phone: String
}`, 'Person private info');

schemaBuilder.addType(`input UserPrivateChanges{
  birthDate: DateTime
  deathDate: DateTime,
  currentLocation: String,
  birthLocation: String,
  deathLocation: String,
  email: String,
  phone: String
}`);

schemaBuilder.addType(`input UserChanges {
  firstName: String
  lastName: String
  maidenName: String
  gender: String
  birthDate : String
  deathDate : String
  isDead: Boolean
}`);

schemaBuilder.addType(`type ConnectedUser {
  login: String,
  id: String
}`);

schemaBuilder.addType(`type Photo {
  url: String
  _id: String
  persons: [User]
}`);

schemaBuilder.addType(`type AuditEntry{
  timestamp: DateTime,
  type: String,
  id: String,
  user: String
  action: String
}`);

schemaBuilder.addType(`type Token {
  success: Boolean,
  error: String,
  token: String
}`);


schemaBuilder.setQueryDescription('Queries definition.');


schemaBuilder.addQuery('login(login: String!, password: String): Token',
  'Validates user credentials and returns authentication token');
schemaBuilder.addQuery('register(id: String!, login: String!, password: String): String',
  'Validates user credentials and returns authentication token');

schemaBuilder.addQuery('me: ConnectedUser');
schemaBuilder.addQuery('getPersonList: [User]');
schemaBuilder.addQuery('getPerson(_id: String!): User');
schemaBuilder.addQuery('getAuditLastEntries(number: Int!): [AuditEntry]');
schemaBuilder.addQuery('getPhotoProfile(_id: String!): Photo');
schemaBuilder.addQuery('getPhotosById(_id: String!): [Photo]');
schemaBuilder.addQuery('getPhotosRandom(number: Int!): [Photo]');
schemaBuilder.addQuery('getPrivateInfo(_id:String!): UserPrivate');
schemaBuilder.addQuery('getFather(_id: String!): User');
schemaBuilder.addQuery('getMother(_id: String!): User');
schemaBuilder.addQuery('getChildren(_id: String!): [User]');
schemaBuilder.addQuery('getSiblings(_id: String!): [User]');
schemaBuilder.addQuery('getSpouses(_id: String!): [User]');
schemaBuilder.addQuery('getTodayBirthdays: [User]');
schemaBuilder.addQuery('getTodayDeathdays: [User]');
schemaBuilder.addQuery('getTodayMarriagedays: [User]');


schemaBuilder.setMutationDescription('Mutations definition.');
schemaBuilder.addMutation('removeLink(_id1: String!, _id2: String!): String');
schemaBuilder.addMutation('removeSiblingLink(_id1: String!, _id2: String!): String');
schemaBuilder.addMutation('removeProfile(_id: String!): String');
schemaBuilder.addMutation('addParentLink(_id: String!, _parentId: String!): String');
schemaBuilder.addMutation('addChildLink(_id: String!, _childId: String!): String');
schemaBuilder.addMutation('addSpouseLink(_id1: String!, _id2: String!): String');
schemaBuilder.addMutation('addSiblingLink(_id1: String!, _id2: String!): String');
schemaBuilder.addMutation('createPerson(person: UserChanges): User');
schemaBuilder.addMutation('updatePerson(_id:String!, patch: UserChanges): User');
schemaBuilder.addMutation('updatePersonPrivateInfo(_id:String!, patch: UserPrivateChanges): UserPrivate');
schemaBuilder.addMutation('addPhoto( url : String!, deleteHash : String,  persons:[String]): String');
schemaBuilder.addMutation('setProfilePicture(person: String!, image: String!): String');
schemaBuilder.addMutation('deletePhoto(image: String!): String');
schemaBuilder.addMutation('addPhotoTag(image: String!, tag: String!): String');
schemaBuilder.addMutation('removePhotoTag(image: String!, tag: String!): String');

const schema = buildSchema(schemaBuilder.build());

export default schema;
