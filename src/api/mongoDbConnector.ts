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
    console.log(JSON.stringify(res))
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


export async function getPhotosByIdFromMongoDb(personId: string, db:any) {
  const collection = db.collection('photoTags');
let query4 = { 'person_id': `${personId}` };
  const res = await collection.find(query4,
    {
      photo_id: 1,
    }).toArray();
    console.log(JSON.stringify(res));
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
  links.forEach((element: { person_id: any; }) => {
    memberItems.push(ObjectId(element.person_id));
  });
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
  // console.log(JSON.stringify(res))
  const photo_id = res.insertedId.toString();

  const collection = db.collection('photoTags');
  persons.forEach(async (elem) => {
    await collection.insertOne({ photo_id: photo_id, person_id: elem });
  });
  client.close();
  return 'Done';
}


export async function getParentByIdFromMongoDb(id: string, gender: string, db: any): Promise<any> {
  const connector = getConnector();

  const resLinks = await connector.getArrayFromMongoDbAndDb(db, relationCollection, { person2_id: ObjectId(id), type: 'Parent' }, {});

  const items: any = resLinks.map((element: { person1_id: any; }) => ObjectId(element.person1_id));

  const parents = await connector.getArrayFromMongoDbAndDb(db, memberCollection, { _id: { $in: items } }, {});

  let fatherOrMother = null;
  parents.forEach((element: { gender: string; }) => {
    if (element.gender == gender) {
      fatherOrMother = element;
    }
  });

  return fatherOrMother;
}

export async function getChildrenByIdFromMongoDb(id: string, db: any) {

  const links = db.collection(relationCollection);
  const resLinks = await links.find({ person1_id: ObjectId(id), type: 'Parent' }).toArray();
  const items: any = [];
  resLinks.forEach((element: { person2_id: string; }) => {
    items.push(ObjectId(element.person2_id));
  });
  const members = db.collection(memberCollection);

  const query = { _id: { $in: items } };
  const children = await members.find(query).toArray();
  return children;
}

export async function getGrandParentsByIdFromMongoDb(id: string, db:any) {
  const links = db.collection(relationCollection);
  const resLinks = await links.find({ person2_id: ObjectId(id), type: 'Parent' }).toArray();
  const items: any = [];
  resLinks.forEach((element: { person1_id: string; }) => {
    items.push(ObjectId(element.person1_id));
  });

  let grandParentIds: any[] = []
  const resLinks2 = await links.find({ person2_id: { $in: items }, type: 'Parent' }).toArray();
  resLinks2.forEach((element: { person1_id: string; }) => {
    grandParentIds.push(ObjectId(element.person1_id));
  });
  const members = db.collection(memberCollection);

  const query = { _id: { $in: grandParentIds } };
  const grandParents = await members.find(query).toArray();
  return grandParents;
}

export async function getGrandChildrenByIdFromMongoDb(id: string, db:any) {
  const links = db.collection(relationCollection);
  const resLinks = await links.find({ person1_id: ObjectId(id), type: 'Parent' }).toArray();
  const items: any = [];
  resLinks.forEach((element: { person2_id: string; }) => {
    items.push(ObjectId(element.person2_id));
  });

  let grandChildrenIds: any[] = []
  const resLinks2 = await links.find({ person1_id: { $in: items }, type: 'Parent' }).toArray();
  resLinks2.forEach((element: { person2_id: string; }) => {
    grandChildrenIds.push(ObjectId(element.person2_id));
  });
  const members = db.collection(memberCollection);

  const query = { _id: { $in: grandChildrenIds } };
  const grandChildren = await members.find(query).toArray();
  return grandChildren;
}

export async function getGrandGrandChildrenByIdFromMongoDb(id: string, db:any) {
  const links = db.collection(relationCollection);
  const resLinks = await links.find({ person1_id: ObjectId(id), type: 'Parent' }).toArray();
  const items: any = [];
  resLinks.forEach((element: { person2_id: string; }) => {
    items.push(ObjectId(element.person2_id));
  });

  let grandChildrenIds: any[] = []
  const resLinks2 = await links.find({ person1_id: { $in: items }, type: 'Parent' }).toArray();
  resLinks2.forEach((element: { person2_id: string; }) => {
    grandChildrenIds.push(ObjectId(element.person2_id));
  });
  const members = db.collection(memberCollection);

  let grandGrandChildrenIds: any[] = []
  const resLinks3 = await links.find({ person1_id: { $in: grandChildrenIds }, type: 'Parent' }).toArray();
  resLinks3.forEach((element: { person2_id: string; }) => {
    grandGrandChildrenIds.push(ObjectId(element.person2_id));
  });

  const query2 = { _id: { $in: grandGrandChildrenIds } };
  const grandGrandChildren = await members.find(query2).toArray();


  return grandGrandChildren;
}

export async function getPiblingsByIdFromMongoDb(id: string, db:any) {
  const links = db.collection(relationCollection);
  const parentsLink = await links.find({ person2_id: ObjectId(id), type: 'Parent' }).toArray();
  const parentsIds: any = [];
  parentsLink.forEach((element: { person1_id: string; }) => {
    parentsIds.push(ObjectId(element.person1_id));
  });

  const grandParentsLink = await links.find({ person2_id: { $in: parentsIds }, type: 'Parent' }).toArray();
  const grandParentsIds: any = [];
  grandParentsLink.forEach((element: { person1_id: string; }) => {
    grandParentsIds.push(ObjectId(element.person1_id));
  });

  const unclesLink = await links.find({ person1_id: { $in: grandParentsIds }, type: 'Parent' }).toArray();
  const unclesIds: any = [];
  unclesLink.forEach((element: { person2_id: string; }) => {

    if(!parentsIds.map(String).includes(element.person2_id.toString()))
    {
      unclesIds.push(ObjectId(element.person2_id));
    }
  });

  const query = { _id: { $in: unclesIds } };
  const piblings = await db.collection(memberCollection).find(query).toArray();
  return piblings;
}

export async function getCousinsByIdFromMongoDb(id: string, db:any) {
  const links = db.collection(relationCollection);
  const parentsLink = await links.find({ person2_id: ObjectId(id), type: 'Parent' }).toArray();
  const parentsIds: any = [];
  parentsLink.forEach((element: { person1_id: string; }) => {
    parentsIds.push(ObjectId(element.person1_id));
  });

  const grandParentsLink = await links.find({ person2_id: { $in: parentsIds }, type: 'Parent' }).toArray();
  const grandParentsIds: any = [];
  grandParentsLink.forEach((element: { person1_id: string; }) => {
    grandParentsIds.push(ObjectId(element.person1_id));
  });

  const unclesLink = await links.find({ person1_id: { $in: grandParentsIds }, type: 'Parent' }).toArray();
  const unclesIds: any = [];
  unclesLink.forEach((element: { person2_id: string; }) => {

    if(!parentsIds.map(String).includes(element.person2_id.toString()))
    {
     
      unclesIds.push(ObjectId(element.person2_id));
    }
  });

  const cousinsLink = await links.find({ person1_id: { $in: unclesIds }, type: 'Parent' }).toArray();
  const cousinsIds: any = [];
  cousinsLink.forEach((element: { person2_id: string; }) => {

    if(!parentsIds.map(String).includes(element.person2_id.toString()))
    {
      cousinsIds.push(ObjectId(element.person2_id));
    }
  });

  const query = { _id: { $in: cousinsIds } };
  const cousins = await db.collection(memberCollection).find(query).toArray();
  return cousins;
}

export async function getNiblingsByIdFromMongoDb(id: string, db:any) {


  const links = db.collection(relationCollection);

  const spousesLink =   await links.find({ type: 'Spouse', $or: [{ person1_id: ObjectId(id) }, { person2_id: ObjectId(id) }] }).toArray();
  const spousesLInkIds: any=[];
  spousesLink.forEach((element: { person1_id: string; person2_id: string; }) => {
    spousesLInkIds.push(ObjectId(element.person1_id));
    spousesLInkIds.push(ObjectId(element.person2_id));
  });

  


  const parentsLink = await links.find({ person2_id: { $in: spousesLInkIds }, type: 'Parent' }).toArray();
  const parentsIds: any = [];
  parentsLink.forEach((element: { person1_id: string; }) => {
    parentsIds.push(ObjectId(element.person1_id));
  });

  const siblingsLink = await links.find({ person1_id: { $in: parentsIds }, type: 'Parent' }).toArray();
  const siblingsIds: any = [];
  siblingsLink.forEach((element: { person2_id: string; }) => {
    if(!spousesLInkIds.map(String).includes(element.person2_id.toString()))
    {
      siblingsIds.push(ObjectId(element.person2_id));
    }
  });

  const niblingsLinks = await links.find({ person1_id: { $in: siblingsIds }, type: 'Parent' }).toArray();
  const niblingsIds: any = [];
  niblingsLinks.forEach((element: { person2_id: string; }) => {
    niblingsIds.push(ObjectId(element.person2_id));
 
  });

  
  const query = { _id: { $in: niblingsIds } };
  const niblings = await db.collection(memberCollection).find(query).toArray();
  return niblings;
}

export async function getSiblingsByIdFromMongoDb(id: string, db:any) {

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
  return parents;
}

export async function getSpousesByIdFromMongoDb(id: string, db: any) {

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
  const members = db.collection(memberCollection);

  const query = { _id: { $in: items } };
  const spouses = await members.find(query).toArray();
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
    timestamp: new Date().toISOString(), type: 'Person', action: 'updated profile', payload: patch, id: ObjectId(id),
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
  const document = { id, password: hash };
  await collection.insertOne(document);
  await members.updateOne({ _id: ObjectId(id) }, { $set: { email, profileId: login, UpdatedAt: new Date().toISOString() } });


  client.close();
  return 'Account created';
}
