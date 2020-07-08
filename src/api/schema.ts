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
  profileId: String
  firstName: String
  lastName: String
  maidenName: String
  gender: String
  yearOfBirth : String
  yearOfDeath: String
  isDead: Boolean
}`, 'Person public info');

schemaBuilder.addType(`type Event {
  date: DateTime
  type: String
  person: User
  person2: User,
  anniversary: Int
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
  isDead: Boolean,
  currentLocationCountry: String,
  birthLocationCountry: String,
  deathLocationCountry: String,
  currentLocationCity: String,
  birthLocationCity: String,
  deathLocationCity: String,
  email: String,
  phone: String
}`, 'Person private info');

schemaBuilder.addType(`input PrivateProfileChanges{
  birthDate: DateTime
  deathDate: DateTime,
  currentLocationCountry: String,
  birthLocationCountry: String,
  deathLocationCountry: String,
  currentLocationCity: String,
  birthLocationCity: String,
  deathLocationCity: String,
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
schemaBuilder.addQuery('version: String', 'Get api version');

schemaBuilder.addQuery('login(login: String!, password: String): Token',
  'Validates user credentials and returns authentication token');
schemaBuilder.addQuery('register(id: String!, login: String!, email: String!, password: String!): String',
  'Validates user credentials and returns authentication token');

schemaBuilder.addQuery('me: ConnectedUser');

schemaBuilder.addQuery('getPersonList: [User]');

schemaBuilder.addQuery('getPrivateProfile(profileId: String!): PrivateProfile');
schemaBuilder.addQuery('getProfile(profileId:String!): PublicProfile');

schemaBuilder.addQuery('getAuditLastEntries(number: Int!): [AuditEntry]');
schemaBuilder.addQuery('getPhotoProfile(_id: String!): Photo');
schemaBuilder.addQuery('getPhotosById(_id: String!): [Photo]');
schemaBuilder.addQuery('getPhotosRandom(number: Int!): [Photo]');

schemaBuilder.addQuery('getRelation(_id1: String!,_id2: String!): [Relation]');

schemaBuilder.addQuery('getTodayBirthdays: [User]');
schemaBuilder.addQuery('getTodayDeathdays: [User]');
schemaBuilder.addQuery('getTodayMarriagedays: [User]');
schemaBuilder.addQuery('getEvents(date1:String!, date2:String):[Event]')
schemaBuilder.addQuery('getProfileId(_id: String!): String');

schemaBuilder.setMutationDescription('Mutations definition.');
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

export default schema;
