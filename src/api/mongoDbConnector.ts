import dotenv from 'dotenv';
import LoggerService from '../services/logger_service';

dotenv.config();

const connectionString = process.env.MONGODB ?? '';
export const mongoDbDatabase = process.env.MONGODB_DATABASE ?? '';
const { MongoClient } = require('mongodb');

export const ObjectId = require('mongodb').ObjectID;

export const memberCollection = 'members';
export const auditCollection = 'audit';
export const relationCollection = 'relations';
export const credentialsCollection = 'credentials';
const bcrypt = require('bcrypt');

export class MongoConnector {
  connectionString = '';

  logger: LoggerService;

  constructor(cstr: string) {
    this.connectionString = cstr;
    this.logger = new LoggerService('MongoConnector');
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
      this.logger.debug('set db');
      return client.db(database);
    }
    return null;
  }

  closeDb(client: any) {
    this.logger.debug('close db');
    if (client != null) {
      client.close();
    }
  }

  async getItemFromMongoDbWithLimit(db: any, collectionName: string, query: string, limit: number) {
    this.logger.debug('get item with limit');
    const collection = db.collection(collectionName);
    return collection.find(query).limit(limit).toArray();
  }

  async getArrayFromMongoDbAndDb(db: any, collectionName: string, query: any, projection: any) {
    this.logger.debug('get array');
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
    this.logger.debug('Delete Many');
    const collection = db.collection(collectionName);
    return collection.deleteMany(query);
  }

  async getItemFromMongoDbAndDb(db: any, collectionName: string, query: any, projection: any) {
    this.logger.debug('get item from mongo');
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
    this.logger.debug('insert item');
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

function getConnector() {
  return new MongoConnector(connectionString);
}

export async function getTodayBirthdaysFromMongoDb() {
  const connector = getConnector();
  const dateFilter = new Date().toISOString().substring(5, 10);
  return connector.getArrayFromMongoDb(mongoDbDatabase, memberCollection,
    { birthDate: { $regex: dateFilter } }, {});
}

export async function getTodayDeathdaysFromMongoDb() {
  const connector = getConnector();
  const dateFilter = new Date().toISOString().substring(5, 10);
  return connector.getArrayFromMongoDb(mongoDbDatabase, memberCollection, { death: { $regex: dateFilter } }, {});
}

export async function getTodayMarriagedaysFromMongoDb() {
  const connector = getConnector();
  const client = await connector.initClient();
  const db = client.db(mongoDbDatabase);
  const collection = db.collection(relationCollection);
  const dateFilter = new Date().toISOString().substring(5, 10);
  const res = await collection.find({ marriage_date: { $regex: dateFilter } }).toArray();
  const items: string[] = [];
  res.forEach((element: { person1_id: string; person2_id: string; }) => {
    items.push(ObjectId(element.person1_id));
    items.push(ObjectId(element.person2_id));
  });

  const query = { _id: { $in: items } };
  const res2 = await db.collection(memberCollection).find(query).toArray();
  connector.closeDb(client);
  return res2;
}


export async function getPersonByLoginFromMongoDb(login: string) {
  const connector = getConnector();
  const client = await connector.initClient();
  const db = client.db(mongoDbDatabase);
  const collection = db.collection('credentials');
  const res = await collection.findOne({ login }, { login: 1, id: 1 });
  connector.closeDb(client);
  return res;
}

export async function setProfilePictureFromMongo(person: string, image: string) {
  const connector = getConnector();
  console.log(`Set profile pic${image}`);
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
  console.log(JSON.stringify(previous));
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
  console.log(`Set profile pic${image}`);
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


export async function getPhotosByIdFromMongoDb(personId: string) {
  const connector = getConnector();
  const client = await connector.initClient();
  const db = client.db(mongoDbDatabase);
  const collection = db.collection('photoTags');

  const res = await collection.find({ person_id: personId },
    {
      photo_id: 1,
    }).toArray();

  // console.log(res);
  const items: any = [];
  const itemsString: any = [];
  const memberItems: any = [];

  res.forEach((element: { photo_id: string; }) => {
    items.push(ObjectId(element.photo_id));
    itemsString.push(element.photo_id);
  });


  const photos = db.collection('photos');

  const query = { _id: { $in: items } };
  const photoResult2 = await photos.find(query).toArray();


  const query2 = { photo_id: { $in: itemsString } };
  const links = await collection.find(query2).toArray();
  console.log(JSON.stringify(photoResult2));
  console.log(JSON.stringify(links));

  links.forEach((element: { person_id: any; }) => {
    memberItems.push(ObjectId(element.person_id));
  });
  //   console.log("members: " + JSON.stringify(memberItems))

  const query3 = { _id: { $in: memberItems } };
  const members = await db.collection(memberCollection).find(query3).toArray();
  // console.log(JSON.stringify(members))

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
  client.close();
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

  console.log(res);


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
  const collection = db.collection('photos');

  const res = await collection.aggregate([{ $sample: { size: 5 } }],
    {
      url: 1,
    }).toArray();

  console.log(res);


  client.close();
  return res;
}


export async function addPhotoFromMongoDb(url: string, deleteHash: string, persons: string[]) {
  const connector = getConnector();
  const client = await connector.initClient();
  const db = client.db(mongoDbDatabase);

  const photos = db.collection('photos');

  const query = { url, deleteHash };
  const res = await photos.insertOne(query);
  // console.log(JSON.stringify(res))
  const photo_id = res.insertedId.toString();

  const collection = db.collection('photoTags');
  persons.forEach(async (elem) => {
    await collection.insertOne({ photo_id, person_id: elem });
  });
  client.close();
  return 'Done';
}


export async function getParentByIdFromMongoDb(id: string, gender: string): Promise<any> {
  const connector = getConnector();
  const client = await connector.initClient();
  const db = client.db(mongoDbDatabase);
  const resLinks = await connector.getArrayFromMongoDbAndDb(db, relationCollection, { person2_id: ObjectId(id), type: 'Parent' }, {});

  const items: any = resLinks.map((element: { person1_id: any; }) => ObjectId(element.person1_id));

  const parents = await connector.getArrayFromMongoDbAndDb(db, memberCollection, { _id: { $in: items } }, {});
  client.close();

  let fatherOrMother = null;
  parents.forEach((element: { gender: string; }) => {
    if (element.gender == gender) {
      fatherOrMother = element;
    }
  });

  return fatherOrMother;
}

export async function getChildrenByIdFromMongoDb(id: string) {
  const connector = getConnector();
  const client = await connector.initClient();
  const db = client.db(mongoDbDatabase);

  const links = db.collection(relationCollection);
  const resLinks = await links.find({ person1_id: ObjectId(id), type: 'Parent' }).toArray();
  const items: any = [];
  resLinks.forEach((element: { person2_id: string; }) => {
    items.push(ObjectId(element.person2_id));
  });
  const members = db.collection(memberCollection);

  const query = { _id: { $in: items } };
  const children = await members.find(query).toArray();
  client.close();
  return children;
}

export async function getSiblingsByIdFromMongoDb(id: string) {
  const connector = getConnector();
  const client = await connector.initClient();
  const db = client.db(mongoDbDatabase);

  const links = db.collection(relationCollection);
  const resLinks = await links.find({ person2_id: ObjectId(id), type: 'Parent' }).toArray();
  const items: any = [];
  resLinks.forEach((element: { person1_id: string; }) => {
    items.push(ObjectId(element.person1_id));
  });

  const resLinks2 = await links.find({ person1_id: { $in: items }, type: 'Parent' }).toArray();
  const items2: any = [];
  resLinks2.forEach((element: { person2_id: string; }) => {
    if (element.person2_id.toString() != id) {
      items2.push(ObjectId(element.person2_id));
    }
  });

  const members = db.collection(memberCollection);
  const query = { _id: { $in: items2 } };
  const parents = await members.find(query).toArray();
  client.close();
  return parents;
}

export async function getSpousesByIdFromMongoDb(id: string) {
  const connector = getConnector();
  const client = await connector.initClient();
  const db = client.db(mongoDbDatabase);

  const links = db.collection(relationCollection);
  const resLinks = await links.find({ type: 'Spouse', $or: [{ person1_id: ObjectId(id) }, { person2_id: ObjectId(id) }] }).toArray();
  const items: any = [];
  resLinks.forEach((element: { person1_id: string; person2_id: string; }) => {
    if (element.person1_id.toString() == id) {
      items.push(ObjectId(element.person2_id));
    } else {
      items.push(ObjectId(element.person1_id));
    }
  });
  console.log(items);
  const members = db.collection(memberCollection);

  const query = { _id: { $in: items } };
  console.log(query);
  const spouses = await members.find(query).toArray();
  client.close();
  return spouses;
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
  const db = client.db(mongoDbDatabase);
  const collection = db.collection(memberCollection);
  patch.UpdatedAt = new Date().toISOString();

  const query = { _id: ObjectId(id) };
  console.debug(query);
  await collection.updateOne(query, { $set: patch });

  const audit = db.collection(auditCollection);
  await audit.insertOne({
    timestamp: new Date().toISOString(), type: 'Person', action: 'Person updated', payload: patch, id: ObjectId(id),
  });

  const res1 = await collection.findOne({ _id: ObjectId(id) });
  client.close();
  return res1;
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

  const res1 = await collection.findOne({ _id: ObjectId(res.insertedId) });
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

export async function createCredentialsFromMongoDb(id: string, login: string, email: string, password: string) {
  const connector = getConnector();
  console.log('creating credentials');
  const client = await connector.initClient();
  const db = client.db(mongoDbDatabase);
  const collection = db.collection(credentialsCollection);
  login = login.toLowerCase();

  const members = db.collection(memberCollection);
  const query = { profileId: login };
  const res = await members.findOne(query);
  if (res != null) {
    client.close();
    throw Error('login already exist');
  }


  const hash = bcrypt.hashSync(password, 10);
  const document = { id: id, password: hash };
  await collection.insertOne(document);
  await members.updateOne({ _id: ObjectId(id) }, { $set: { email: email, profileId: login, UpdatedAt: new Date().toISOString() } });


  client.close();
  return 'Account created';
}
