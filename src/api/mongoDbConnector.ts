import dotenv from 'dotenv';
import LoggerService from '../services/logger_service';
import { PostgresConnector } from './postgresConnector';

dotenv.config();

const connectionString = process.env.MONGODB ?? '';
export const mongoDbDatabase = process.env.MONGODB_DATABASE ?? '';
const { MongoClient } = require('mongodb');

export const ObjectId = require('mongodb').ObjectID;

export const memberCollection = 'members';
export const auditCollection = 'audit';
export const relationCollection = 'relations';
export const credentialsCollection = 'credentials';
const bcrypt = require('bcryptjs');

export class MongoConnector {
  async getLastUpdate(db: any, collectionName: string) {
    this.logger.info('get last update');
    const a = await db.collection(collectionName).find({ UpdatedAt: { $exists: true } }).limit(1).sort({ UpdatedAt: -1 })
      .toArray();
    if (a.length == 0) {
      return '2000-01-01T00:00:00.001Z';
    }

    return a[0].UpdatedAt;
  }

  connectionString = '';

  logger: LoggerService;
  connector: PostgresConnector;

  constructor(cstr: string) {
    this.connectionString = cstr;
    this.logger = new LoggerService('MongoConnector');
    this.connector = new PostgresConnector();
  }

  async initClient() {
    if (this.connectionString === '' || this.connectionString === undefined) {
      return null;
    }
    return MongoClient.connect(this.connectionString,
      { useUnifiedTopology: true, useNewUrlParser: true })
      .catch((err: any) => {
        this.logger.error(`${err} for connection string ${this.connectionString}`);
      });
  }

  setDb(client: any, database: string) {
    if (client != null && database != null) {
      return client.db(database);
    }
    return null;
  }

  closeDb(client: any) {
    if (client != null) {
      client.close();
    }
  }

  async getCollectionSize(db: any, collectionName: string) {
    this.logger.debug('get collectionSize');
    const collection = db.collection(collectionName);
    return collection.countDocuments();
  }

  async getItemFromMongoDbWithLimit(db: any, collectionName: string, query: string, limit: number) {
    this.logger.debug('get item with limit');
    const collection = db.collection(collectionName);
    return collection.find(query).limit(limit).toArray();
  }

  async getArrayFromMongoDbAndDb(db: any, collectionName: string, query: any, projection: any) {
    if (db === undefined || db == null) {
      return [];
    }
    const collection = db.collection(collectionName);
    if (projection === {} || projection == null) {
      return collection.find(query).toArray();
    }
    return collection.find(query, projection).toArray();
  }

  async getArrayFromMongoDb(database: string, collectionName: string, query: any, projection: any) {
    const client = await this.initClient();
    const db = this.setDb(client, database);
    const res = await this.getArrayFromMongoDbAndDb(db, collectionName, query, projection);
    this.closeDb(client);
    return res;
  }

  async getItemFromMongoDb(database: string, collectionName: string, query: any, projection: any) {
    const client = await this.initClient();
    const db = this.setDb(client, database);
    const res = await this.getItemFromMongoDbAndDb(db, collectionName, query, projection);
    this.closeDb(client);
    return res;
  }

  async deleteManyFromMongoDbAndDb(db: any, collectionName: string, query: any) {
    const collection = db.collection(collectionName);
    return collection.deleteMany(query);
  }

  async getItemFromMongoDbAndDb(db: any, collectionName: string, query: any, projection: any) {
    const collection = db.collection(collectionName);
    let res = {};
    if (projection === {} || projection == null) {
      res = await collection.findOne(query);
    } else {
      res = await collection.findOne(query, projection);
    }
    return res;
  }

  async insertItem(db: any, collectionName: string, query: any) {
    const collection = db.collection(collectionName);
    return collection.insertOne(query);
  }

  async insertAudit(db: any, type: string, action: string, persons: any[], payload: any) {
    this.logger.debug('insert audit');
    await persons.forEach((element) => {
      this.insertItem(db, auditCollection, {
        timestamp: new Date().toISOString(), type, action, payload, id: element,
      });
    });
  }
}

export function getConnector() {
  return new MongoConnector(connectionString);
}

export async function getEventsFromMongoDb(date1: Date, date2: Date) {
  const connector = getConnector();
  const dateFilter = new Date().toISOString().substring(5, 10);
  return connector.getArrayFromMongoDb(mongoDbDatabase, memberCollection,
    { birth:{ birthDate: { $regex: dateFilter } }}, {});
}


export async function setProfilePictureFromMongo(person: string, image: string) {
  const connector = getConnector();
  const client = await connector.initClient();
  const db = client.db(mongoDbDatabase);
  const collection = db.collection('photoTags');

  await collection.updateMany({ person_id: person, isProfile: 'true', photo_id: { $ne: image } },
    { $set: { isProfile: 'false' } });

  await collection.updateOne({ person_id: person, photo_id: image },
    { $set: { isProfile: 'true' } });

  connector.closeDb(client);
  return 'Profile picture updated.';
}

export async function addPhotoTagFromMongo(person: string, image: string) {
  if (person.length < 12) {
    console.log('Invalid person Id');
    throw Error('Invalid person id');
  }

  const connector = getConnector();
  const client = await connector.initClient();
  const db = client.db(mongoDbDatabase);

  const collection = db.collection('photoTags');
  const previous = await collection.find({ photo_id: image, person_id: person }).toArray();
  if (previous.length > 0) {
    client.close();
    console.log('already set');
    return 'Tag already set';
  }
  const collectionMember = db.collection(memberCollection);
  console.log(`person ${person}`);


  const member = await collectionMember.find({ _id: ObjectId(person) }).toArray();

  if (member.length === 0) {
    client.close();
    console.log('user missing');
    throw Error('User doesnt exist');
  }

  await collection.insertOne({ photo_id: image, person_id: person });
  client.close();
  return 'Tag added';
}

export async function removePhotoTagFromMongo(person: string, image: string) {
  const connector = getConnector();
  const client = await connector.initClient();
  const db = client.db(mongoDbDatabase);
  const collection = db.collection('photoTags');

  const res = await collection.removeOne({ photo_id: image, person_id: person });
  client.close();
  return 'Tag removed';
}

export async function deletePhotoFromMongo(image: string) {
  const connector = getConnector();
  const client = await connector.initClient();
  const db = client.db(mongoDbDatabase);
  const collection = db.collection('photoTags');

  await collection.remove({ photo_id: image });

  await db.collection('photos').remove({ _id: ObjectId(image) });
  return 'Photo deleted.';
}


export async function getPhotosByIdFromMongoDb(personId: string, db:any) {

  const res = await db.collection('photoTags').find({ 'person_id': `${personId}` },
    {
      photo_id: 1,
    }).toArray();

  const items: any = [];
  const itemsString: any = [];
  const memberItems: any = [];

  res.forEach((element: { photo_id: string; }) => {
    items.push(ObjectId(element.photo_id));
    itemsString.push(element.photo_id);
  });

  const photos = db.collection('photos');

  const photoResult2 = await photos.find({ _id: { $in: items } }).toArray();

  const query2 = { photo_id: { $in: itemsString } };
  const links = await db.collection('photoTags').find(query2).toArray();
  links.forEach((element: { person_id: any; }) => {
    memberItems.push(ObjectId(element.person_id));
  });
  const members = await db.collection(memberCollection).find({ _id: { $in: memberItems } }).toArray();

  const result: any[] = [];
  photoResult2.forEach((element: any) => {
    const elm = element;
    elm.persons = [];

    links.forEach((l: { photo_id: any; person_id: any; }) => {
      if (l.photo_id == elm._id.toString()) {
        members.forEach((m: { _id: { toString: () => any; }; }) => {
          if (m._id.toString() == l.person_id) {
            elm.persons.push(m);
          }
        });
      }
    });
    result.push(elm);
  });
  return result;
}

export async function getPhotoProfileFromMongoDb(id: string) {
  const connector = getConnector();
  const client = await connector.initClient();
  const db = client.db(mongoDbDatabase);
  const collection = db.collection('photoTags');

  const res = await collection.find({ person_id: id, isProfile: 'true' },
    {
      person_id: 1,
    }).toArray();

  const items: any = [];

  res.forEach((element: { photo_id: string; }) => {
    items.push(ObjectId(element.photo_id));
  });


  const photos = db.collection('photos');

  const query = { _id: { $in: items } };
  const photoResult = await photos.findOne(query);


  client.close();
  return photoResult;
}

export async function getPhotosRandomFromMongoDb(num: number) {

  const connector = getConnector();
  const client = await connector.initClient();
  const db = client.db(mongoDbDatabase);
  const res = await db.collection('photoTags').aggregate(
    [{ $match: { isProfile: "true"} },
     { $sample: { size: 5 } },
    ],
    {
      person_id: 1,
      photo_id: 1,
    }).toArray();

    let photoIds: any[] = [];
    let personIds: any[] = [];
    res.forEach((elm:any) => {
      photoIds.push(ObjectId(elm.photo_id));
      personIds.push(ObjectId(elm.person_id));
    });

    const photos = await db.collection('photos').find({ _id: { $in: photoIds } }).toArray();
    const persons = await db.collection('members').find({ _id: { $in: personIds } }).toArray();

    let items:any[] = [];
    res.forEach((element:any) => {
      let item:any = {};
      item._id = element.photo_id;
      item.url = photos.find((x:any)=>x._id.toString() == element.photo_id).url;
      item.persons = persons.filter((x:any)=>x._id.toString() == element.person_id);
      items.push(item);
    });
    
  client.close();
  return items;
}


export async function addPhotoFromMongoDb(url: string, deleteHash: string, persons: string[]) {
  const connector = getConnector();
  const client = await connector.initClient();
  const db = client.db(mongoDbDatabase);

  const photos = db.collection('photos');

  const query = { url, deleteHash };
  const res = await photos.insertOne(query);
  const photo_id = res.insertedId.toString();

  const collection = db.collection('photoTags');
  persons.forEach(async (elem) => {
    await collection.insertOne({ photo_id: photo_id, person_id: elem });
  });
  client.close();
  return 'Done';
}









export async function deleteProfileFromMongoDb(id: string) {
  const connector = getConnector();
  const client = await connector.initClient();
  const db = client.db(mongoDbDatabase);
  const collection = db.collection(memberCollection);

  const query = { _id: ObjectId(id) };
  const res = await collection.findOne(query);


  const links = db.collection(relationCollection);
  const query1 = { $or: [{ person1_id: ObjectId(id) }, { person2_id: ObjectId(id) }] };
  await links.deleteMany(query1);


  await collection.deleteOne(query);

  const audit = db.collection(auditCollection);
  await audit.insertOne({
    timestamp: new Date().toISOString(), type: 'Person', action: 'Person Deleted', payload: res, id: res._id,
  });
  client.close();
  return `Deleted person ${id}`;
}


export async function updatePersonFromMongoDb(id: string, patch: any) {

  const connector = getConnector();
  const client = await connector.initClient();
  try{
    const db = client.db(mongoDbDatabase);
    const collection = db.collection(memberCollection);
    let patched:any = {}
    
    patched.version = {}
    patched.version.UpdatedAt = new Date().toISOString();
    patched.version.updatedBy = patch.updatedBy;

    const query = { _id: ObjectId(id) };
    console.debug(query);
  
    
    if (patch.firstName !== undefined) {
      patched.firstName = patch.firstName;
    }

    if (patch.lastName !== undefined) {
      patched.lastName = patch.lastName;
    }

    if (patch.maidenName !== undefined) {
      patched.maidenName = patch.maidenName;
    }

    if (patch.birthDate !== undefined) {
      if(patched.birth === undefined){
        patched.birth  = {}
      }
      patched.birth.birthDate = patch.birthDate;
      patched.birth.year = patch.birthDate?.substring(0, 4);
      patched.birth.month = patch.birthDate?.substring(5, 7);
      patched.birth.day = patch.birthDate?.substring(8, 10);
    }
  
    if(patch.birthLocationCountry !== undefined){
      if(patched.birth === undefined){
        patched.birth = {};
      }
      patched.birth.country = patch.birthLocationCountry;
    }
    if(patch.birthLocationCity !== undefined){
      if(patched.birth === undefined){
        patched.birth = {};
      }
      patched.birth.city = patch.birthLocationCity;
    }

    if(patch.currentLocationCountry !== undefined){
      if(patched.currentLocation === undefined){
        patched.currentLocation = {};
      }
      patched.currentLocation.country = patch.currentLocationCountry;
    }
    if(patch.currentLocationCity !== undefined){
      if(patched.currentLocation === undefined){
        patched.currentLocation = {};
      }
      patched.currentLocation.city = patch.currentLocationCity;
    }
  
    if (patch.deathDate !== undefined) {
      if(patched.death === undefined){
        patched.death = {};
      }

      patched.death.deathDate = patch.deathDate;
      patched.death.year = patch.deathDate?.substring(0, 4);
      patched.death.month = patch.deathDate?.substring(5, 7);
      patched.death.day = patch.deathDate?.substring(8, 10);
    }
  
    if(patch.deathLocationCountry !== undefined){
      if(patched.death === undefined){
        patched.death = {};
      }
      patched.death.country = patch.deathLocationCountry;
    }

    if(patch.deathLocationCity !== undefined){
      if(patched.death === undefined){
        patched.death = {};
      }
      patched.death.city = patch.deathLocationCity;
    }
  
  
    await collection.updateOne(query, { $set: patched });
  
    const audit = db.collection(auditCollection);
    await audit.insertOne({
      timestamp: new Date().toISOString(), type: 'Person', action: 'updated profile', payload: patch, id: ObjectId(id),
    });
  
    const res1 = await collection.findOne({ _id: ObjectId(id) });
    client.close();
    return res1;
  }
  catch(err){
    console.log(err);
  }
 
}

export async function createPersonFromMongoDb(person: any) {
  const connector = getConnector();
  const client = await connector.initClient();
  const db = client.db(mongoDbDatabase);
  const collection = db.collection(memberCollection);


  const res = await collection.insertOne(person);

  const audit = db.collection(auditCollection);
  await audit.insertOne({
    timestamp: new Date().toISOString(), type: 'Person', action: 'Person inserted', payload: person, id: ObjectId(res.insertedId),
  });

  const res1 = await collection.findOne({ _id: ObjectId(res.insertedId), profileId: ObjectId(res.insertedId) });
  client.close();
  return res1;
}


export async function checkCredentialsFromMongoDb(login: string, password: string): Promise<any> {
  const connector = getConnector();
  const client = await connector.initClient();
  const db = client.db(mongoDbDatabase);
  const collection = db.collection(credentialsCollection);
  login = login.toLowerCase();

  const members = db.collection(memberCollection);
  const profile = await members.findOne({ profileId: login });


  const res = await collection.findOne({ id: profile._id.toString() });
  client.close();

  return {
    success: bcrypt.compareSync(password, res.password),
    profileId: res.id,
  };
}

