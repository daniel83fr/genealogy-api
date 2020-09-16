// import fs from 'fs';
import { buildSchema } from 'graphql';

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
  profileId: String
  firstName: String
  lastName: String
  maidenName: String
  gender: String
  yearOfBirth : String
  yearOfDeath: String
  isDead: Boolean
  image: String
}`, 'Person public info');

schemaBuilder.addType(`type Event {
  day: Int
  month: Int
  year: Int
  type: String
  profileId: String
  firstName: String
  lastName: String
}`, 'Event');

schemaBuilder.addType(`type PublicProfile 
{
  currentPerson: User
  mother: User
  father: User
  parents: [User]
  children: [User]
  spouses: [User]
  siblings: [User]
  grandParents: [User]
  grandChildren: [User]
  grandGrandChildren: [User]
  cousins: [User]
  niblings: [User]
  piblings: [User]
  photos: [Photo]
}`, 'Person public info');

schemaBuilder.addType(`type CachedUserList {
  users: [User],
  isUpToDate: Boolean
}`, 'cached user list');

schemaBuilder.addType(`type Relation {
  person1: User
  person2: User
  link: String
}`);

schemaBuilder.addType(`type PrivateProfile {
  _id: String
  birthDate: DateTime,
  deathDate: DateTime,
  weddingDate: DateTime
  isDead: Boolean,
  currentLocationCountry: String,
  birthLocationCountry: String,
  deathLocationCountry: String,
  weddingLocationCountry:String,
  currentLocationCity: String,
  birthLocationCity: String,
  weddingLocationCity:String,
  deathLocationCity: String,
  email: String,
  phone: String
}`, 'Person private info');

schemaBuilder.addType(`input PrivateProfileChanges{
  birthDate: DateTime
  deathDate: DateTime,
  weddingDate: DateTime,
  currentLocationCountry: String,
  birthLocationCountry: String,
  deathLocationCountry: String,
  currentLocationCity: String,
  weddingLocationCountry:String,
  birthLocationCity: String,
  deathLocationCity: String,
  weddingLocationCity: String,
  email: String
  phone: String
  updatedBy: String
}`);

schemaBuilder.addType(`input ProfileChanges {
  firstName: String
  lastName: String
  maidenName: String
  gender: String
  birthDate : String
  deathDate : String
  isDead: Boolean
  updatedBy: String
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

schemaBuilder.addType(`type Status {
  success: Boolean
  message: String
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

/* New types */
schemaBuilder.addType(`type ServiceInfo {
  version: String,
  name: String, 
  date: DateTime,
  author: String,
  contact: String
}`);


schemaBuilder.setQueryDescription('Queries definition.');

/* Service Infos */
schemaBuilder.addQuery('about: ServiceInfo', 'Get Info about the api');

/* Account */
schemaBuilder.addQuery('login(login: String!, password: String): Token',
  'Validates user credentials and returns authentication token');

schemaBuilder.addQuery('connectedUser: ConnectedUser', 'Returns connected user');

/* Search */
schemaBuilder.addQuery('searchPerson(filter: String!, page: Int, pageSize: Int): [User]');
// User: ProfileSummary

// Profile: Private + Public profile


/* to remove */
schemaBuilder.addQuery('getPersonList: [User]');
schemaBuilder.addQuery('getPrivateProfile(profileId: String!): PrivateProfile');
schemaBuilder.addQuery('getProfile(profileId:String!): PublicProfile');

schemaBuilder.addQuery('getAuditLastEntries(number: Int!): [AuditEntry]');
schemaBuilder.addQuery('getPhotoProfile(_id: String!): Photo');
schemaBuilder.addQuery('getPhotosById(_id: String!): [Photo]');
schemaBuilder.addQuery('getPhotosRandom(number: Int!): [Photo]');

schemaBuilder.addQuery('getRelation(_id1: String!,_id2: String!): [Relation]');

schemaBuilder.addQuery('getEvents(date:String!):[Event]');
schemaBuilder.addQuery('getProfileId(_id: String!): String');


schemaBuilder.setMutationDescription('Mutations definition.');

/* Account */
schemaBuilder.addMutation('accountCreate(email: String!, password: String!): Status',
  'Create account');

schemaBuilder.addMutation('accountUpdate(id: String!, login: String!, email: String!, password: String!): String',
  'Update account info');

schemaBuilder.addMutation('accountDelete(login: String!, password: String!): String',
  'Delete account');

schemaBuilder.addMutation('removeLink(_id1: String!, _id2: String!): String');
schemaBuilder.addMutation('removeSiblingLink(_id1: String!, _id2: String!): String');
schemaBuilder.addMutation('removeProfile(_id: String!): String');
schemaBuilder.addMutation('addParentLink(_id: String!, _parentId: String!): String');
schemaBuilder.addMutation('addChildLink(_id: String!, _childId: String!): String');
schemaBuilder.addMutation('addSpouseLink(_id1: String!, _id2: String!): String');
schemaBuilder.addMutation('addSiblingLink(_id1: String!, _id2: String!): String');
schemaBuilder.addMutation('createPerson(person: ProfileChanges): User');
schemaBuilder.addMutation('updatePerson(_id:String!, patch: ProfileChanges): User');
schemaBuilder.addMutation('updatePersonPrivateInfo(_id:String!, patch: PrivateProfileChanges): PrivateProfile');
schemaBuilder.addMutation('addPhoto( url : String!, deleteHash : String,  persons:[String]): String');
schemaBuilder.addMutation('setProfilePicture(person: String!, image: String!): String');
schemaBuilder.addMutation('deletePhoto(image: String!): String');
schemaBuilder.addMutation('addPhotoTag(image: String!, tag: String!): String');
schemaBuilder.addMutation('removePhotoTag(image: String!, tag: String!): String');
schemaBuilder.addMutation('runMassUpdate: String', 'should not be used');
const schema = buildSchema(schemaBuilder.build());
// try {
//   fs.writeFileSync('schema.txt', schemaBuilder.build());
// } catch (error) {
//  console.log(error);
// }

export default schema;
