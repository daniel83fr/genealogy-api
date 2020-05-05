import dotenv from "dotenv";
dotenv.config();

const connectionString = process.env.MONGODB;
const mongoDbDatabase = process.env.MONGODB_DATABASE;
const { MongoClient } = require('mongodb');

const ObjectId = require('mongodb').ObjectID;

const memberCollection = "members";
const auditCollection = "audit";
const relationCollection = "relations";

export async function initClient() {
    return await MongoClient.connect(connectionString, { useUnifiedTopology: true, useNewUrlParser: true })
        .catch((err: any) => { console.log(err); });
}

export async function getPersonsFromMongoDb() {
    const client = await initClient();
    const db = client.db(mongoDbDatabase);
    let collection = db.collection(memberCollection);
    let res = await collection.find({},
        {
            FirstName: 1,
            LastName: 1,
            MaidenName: 1, 
            BirthDate:1,
            DeathDate:1,
            Gender:1

        }).toArray()
    client.close()
    return res;
}

export async function getPersonByIdFromMongoDb(id: string) {
    const client = await initClient();
    const db = client.db(mongoDbDatabase);
    let collection = db.collection(memberCollection);
    let res = await collection.findOne({ _id: ObjectId(id) })
    client.close()
    return res;
}

export async function getParentByIdFromMongoDb(id: string, gender: string): Promise<any> {
    const client = await initClient();
    const db = client.db(mongoDbDatabase);

    let links = db.collection(relationCollection);
    let resLinks = await links.find({ "Person2": ObjectId(id), "Type": "Parent" }).toArray()
    let items: any = []
    resLinks.forEach((element: { Person1: string; }) => {
        items.push(ObjectId(element.Person1))
    });
    let members = db.collection(memberCollection);

    let query = { _id: { $in: items } }
    let parents = await members.find(query).toArray();

    let father = null;
    parents.forEach((element: { Gender: string; }) => {
        if (element.Gender == gender) {
            father = element
        }
    });
    client.close()
    return father;
}

export async function getChildrenByIdFromMongoDb(id: string) {
    const client = await initClient();
    const db = client.db(mongoDbDatabase);

    let links = db.collection(relationCollection);
    let resLinks = await links.find({ "Person1": ObjectId(id), "Type": "Parent" }).toArray()
    let items: any = []
    resLinks.forEach((element: { Person2: string; }) => {
        items.push(ObjectId(element.Person2))
    });
    let members = db.collection(memberCollection);

    let query = { _id: { $in: items } }
    let children = await members.find(query).toArray();
    client.close()
    return children
}

export async function getSiblingsByIdFromMongoDb(id: string) {
    const client = await initClient();
    const db = client.db(mongoDbDatabase);

    let links = db.collection(relationCollection);
    let resLinks = await links.find({ "Person2": ObjectId(id), "Type": "Parent" }).toArray()
    let items: any = []
    resLinks.forEach((element: { Person1: string; }) => {
        items.push(ObjectId(element.Person1))
    });

    let resLinks2 = await links.find({ "Person1": { $in: items }, "Type": "Parent" }).toArray()
    let items2: any = []
    resLinks2.forEach((element: { Person2: string; }) => {
        if (element.Person2.toString() != id) {
            items2.push(ObjectId(element.Person2))
        }
    });

    let members = db.collection(memberCollection);
    let query = { _id: { $in: items2 } }
    let parents = await members.find(query).toArray();
    client.close()
    return parents
}

export async function getSpousesByIdFromMongoDb(id: string) {
    const client = await initClient();
    const db = client.db(mongoDbDatabase);

    let links = db.collection(relationCollection);
    let resLinks = await links.find({ Type: "Spouse", $or: [{ "Person1": ObjectId(id) }, { "Person2": ObjectId(id) }] }).toArray()
    let items: any = []
    resLinks.forEach((element: { Person1: string; Person2: string; }) => {
        if (element.Person1.toString() == id) {
            items.push(ObjectId(element.Person2))
        }
        else {
            items.push(ObjectId(element.Person1))
        }
    });
    console.log(items)
    let members = db.collection(memberCollection);

    let query = { _id: { $in: items } }
    console.log(query)
    let spouses = await members.find(query).toArray();
    client.close()
    return spouses
}

export async function deleteRelationFromMongoDb(id: string, id2: string) {
    const client = await initClient();
    const db = client.db(mongoDbDatabase);

    let links = db.collection(relationCollection);
    console.log(">>>" + id + " - " + id2)
    let query = { $or: [{ "Person1": ObjectId(id), "Person2": ObjectId(id2) }, { "Person1": ObjectId(id2), "Person2": ObjectId(id) }] }
    var res = await links.findOne(query);
    console.log(query)
    await links.deleteMany(query);

    let audit = db.collection(auditCollection);
    await audit.insertOne({ "timestamp": new Date().toISOString(), "Type" : "Relation",  "Action": "Remove link", "Payload": res, "Id": ObjectId(id) })
    await audit.insertOne({ "timestamp": new Date().toISOString(), "Type" : "Relation", "Action": "Remove link", "Payload": res, "Id": ObjectId(id2) })
    client.close()
    return `Deleted link between ${id} and ${id2}`;
}


export async function deleteSiblingRelationFromMongoDb(id: string, id2: string) {
    const client = await initClient();
    console.log("---- aaaa ---- ")
    const db = client.db(mongoDbDatabase);

    let links = db.collection(relationCollection);

    let parents1 = await links.find({ "Type": "Parent", "Person2": ObjectId(id) }).toArray()
    console.log(parents1)
    client.close()

    await parents1.forEach(async (element: { Person1: any; }) => {
        return deleteRelationFromMongoDb(element.Person1, id2)
    });

    return `Deleted siblings link between ${id} and ${id2}`;
}

export async function deleteProfileFromMongoDb(id: string) {
    const client = await initClient();
    const db = client.db(mongoDbDatabase);
  let collection = db.collection(memberCollection);

  let query = { _id: ObjectId(id) }
  var res = await collection.findOne(query);


  let links = db.collection(relationCollection);
  let query1 = { $or: [{ "Person1": ObjectId(id) }, {  "Person2": ObjectId(id) }] }
  await links.deleteMany(query1);


  await collection.deleteOne(query);

  let audit = db.collection(auditCollection);
  await audit.insertOne({ "timestamp": new Date().toISOString(), "Type" : "Person", "Action": "Person Deleted", "Payload": res, "Id": res._id })
  client.close()
  return `Deleted person ${id}`;
}



export async function addParentRelationFromMongoDb(id: string, parentId: string) {
    const client = await initClient();
    const db = client.db(mongoDbDatabase);
    let collection = db.collection(relationCollection);

    var res = await collection.insertOne({ "Person1": ObjectId(parentId), "Person2": ObjectId(id), "Type": "Parent" });
    let audit = db.collection(auditCollection);
    await audit.insertOne({ "timestamp": new Date().toISOString(), "Type" : "Relation", "Action": "Add parent link", "Payload": res, "Id": ObjectId(parentId) })
    await audit.insertOne({ "timestamp": new Date().toISOString(), "Type" : "Relation", "Action": "Add parent link", "Payload": res, "Id": ObjectId(id) })
    client.close()
    return `Added link between ${parentId} and ${id}`;
}

export async function addSpouseRelationFromMongoDb(id1: string, id2: string) {
    const client = await initClient();
    const db = client.db(mongoDbDatabase);
    let collection = db.collection(relationCollection);

    var res = await collection.insertOne({ "Person1": ObjectId(id1), "Person2": ObjectId(id2), "Type": "Spouse" });
    let audit = db.collection(auditCollection);
    await audit.insertOne({ "timestamp": new Date().toISOString(), "Type" : "Relation", "Action": "Add parent link", "Payload": res, "Id": ObjectId(id1) })
    await audit.insertOne({ "timestamp": new Date().toISOString(), "Type" : "Relation", "Action": "Add parent link", "Payload": res, "Id": ObjectId(id2) })
    client.close()
    return `Added link between ${id1} and ${id2}`;
}

export async function addSiblingRelationFromMongoDb(id1: string, id2: string) {
    const client = await initClient();
    const db = client.db(mongoDbDatabase);
    let links = db.collection(relationCollection);

    let parents1 = await links.find({ "Type": "Parent", "Person2": ObjectId(id1) }).toArray()
    console.log(parents1)
    client.close()

    await parents1.forEach(async (element: { Person1: any; }) => {
        return addParentRelationFromMongoDb( id2, element.Person1)
    });

    return `Added link between ${id1} and ${id2}`;
}

export async function getUnusedPersonsFromMongoDb() {
    const client = await initClient();
    const db = client.db(mongoDbDatabase);
    let collection = db.collection("membersUnused");
    let res = await collection.find({}).toArray();
    client.close()
    return res;
}

export async function updatePersonFromMongoDb(id: string, patch: any) {
    console.log("function called")
    const client = await initClient();
    const db = client.db(mongoDbDatabase);
    let collection = db.collection(memberCollection);
    patch.UpdatedAt = new Date().toISOString()

    let query = { "_id": ObjectId(id) }
    console.debug(query)
    var res = await collection.updateOne(query, { $set: patch });

    let audit = db.collection(auditCollection);
    await audit.insertOne({ "timestamp": new Date().toISOString(), "Type" : "Person", "Action": "Person updated", "Payload": patch, "Id": ObjectId(id) })

    let res1 = await collection.findOne({ _id: ObjectId(id) })
    client.close()
    return res1;
}

export async function createPersonFromMongoDb(person: any) {
    console.log("function called")
    const client = await initClient();
    const db = client.db(mongoDbDatabase);
    let collection = db.collection(memberCollection);

 
    var res = await collection.insertOne(person);

    let audit = db.collection(auditCollection);
    await audit.insertOne({ "timestamp": new Date().toISOString(), "Type" : "Person", "Action": "Person inserted", "Payload": person, "Id": ObjectId(res.insertedId ) })

    let res1 = await collection.findOne({ _id: ObjectId(res.insertedId) })
    client.close()
    return res1;
}

export async function shouldResetCacheFromMongoDb(lastEntry: Date) {
    console.log("function called")
    const client = await initClient();
    const db = client.db(mongoDbDatabase);
    let collection = db.collection(auditCollection);

    let query = `{'timestamp': {$gt : '${lastEntry.toISOString()}'}}`
    console.log(query)
    var res = await collection.find(query).limit(1).toArray();
    client.close()
    return res.length >0;
}


