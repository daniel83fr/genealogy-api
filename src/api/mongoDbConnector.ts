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
            LastName: 1
        }).toArray()
    return res;
}

export async function getPersonByIdFromMongoDb(id: string) {
    const client = await initClient();
    const db = client.db(mongoDbDatabase);
    let collection = db.collection(memberCollection);
    let res = await collection.findOne({ _id: ObjectId(id)})
    return res;
}

export async function getParentByIdFromMongoDb(id: string, gender:string) : Promise<any>{
    const client = await initClient();
    const db = client.db(mongoDbDatabase);

    let links = db.collection(relationCollection);
    let resLinks = await links.find({ "Person2": ObjectId(id), "Type": "Parent" }).toArray()
    let items:any = []
    resLinks.forEach((element: { Person1: string; }) => {
        items.push(ObjectId(element.Person1))
    });
    let members = db.collection(memberCollection);
    
    let query = { _id: { $in: items } }
    let parents = await members.find(query).toArray();
    
    let father = null;
    parents.forEach((element: { Gender: string; }) => {
        if(element.Gender == gender){
            father  = element
        }
    });
    return father;
}

export async function getChildrenByIdFromMongoDb(id: string) {
    const client = await initClient();
    const db = client.db(mongoDbDatabase);

    let links = db.collection(relationCollection);
    let resLinks = await links.find({ "Person1": ObjectId(id), "Type": "Parent" }).toArray()
    let items:any = []
    resLinks.forEach((element: { Person2: string; }) => {
        items.push(ObjectId(element.Person2))
    });
    let members = db.collection(memberCollection);
    
    let query = { _id: { $in: items } }
    let children = await members.find(query).toArray();
    return children
}

export async function getSiblingsByIdFromMongoDb(id: string) {
    const client = await initClient();
    const db = client.db(mongoDbDatabase);

    let links = db.collection(relationCollection);
    let resLinks = await links.find({ "Person2": ObjectId(id), "Type": "Parent" }).toArray()
    let items:any = []
    resLinks.forEach((element: { Person1: string; }) => {
        items.push(ObjectId(element.Person1))
    });

    let resLinks2 = await links.find({ "Person1": { $in: items }, "Type": "Parent" }).toArray()
    let items2:any = []
    resLinks2.forEach((element: { Person2: string; }) => {
        if(element.Person2.toString() != id)
        {
            items2.push(ObjectId(element.Person2))
        }
    });

    let members = db.collection(memberCollection);
    let query = { _id: { $in: items2 } }
    let parents = await members.find(query).toArray();
    return parents
}

export async function getSpousesByIdFromMongoDb(id: string) {
    const client = await initClient();
    const db = client.db(mongoDbDatabase);

    let links = db.collection(relationCollection);
    let resLinks = await links.find({ Type: "Spouse", $or: [{ "Person1": ObjectId(id) }, { "Person2": ObjectId(id) }] }).toArray()
    let items:any = []
    resLinks.forEach((element: { Person1: string; Person2: string; }) => {
        if(element.Person1.toString() ==  id){
            items.push(ObjectId(element.Person2))
        }
        else{
            items.push(ObjectId(element.Person1))
        }
    });
    console.log(items)
    let members = db.collection(memberCollection);
    
    let query = { _id: { $in: items } }
    console.log(query)
    let spouses = await members.find(query).toArray();
    return spouses
}

export async function deleteRelationFromMongoDb( id: string, id2: string) {
    const client = await initClient();
    const db = client.db(mongoDbDatabase);

    let links = db.collection(relationCollection);
  
    let query = { $or: [{ "Person1": ObjectId(id), "Person2": ObjectId(id2) }, { "Person1": ObjectId(id2), "Person2": ObjectId(id) }] }
    var res = await links.findOne(query);
  
    await links.deleteOne(query);
  
    let audit = db.collection(auditCollection);
    await audit.insertOne({ "timestamp": new Date().toISOString(), "Action": "Remove link", "Payload": res, "Id": ObjectId(id) })
    await audit.insertOne({ "timestamp": new Date().toISOString(), "Action": "Remove link", "Payload": res, "Id": ObjectId(id2) })
    return `Deleted link between ${id} and ${id2}`;
  }

 export async function addParentRelationFromMongoDb(id: string, parentId: string) {
    const client = await initClient();
    const db = client.db(mongoDbDatabase);
    let collection = db.collection(relationCollection);
  
    var res = await collection.insertOne({ "Person1": ObjectId(parentId), "Person2": ObjectId(id), "Type": "Parent" });
    let audit = db.collection(auditCollection);
    await audit.insertOne({ "timestamp": new Date().toISOString(), "Action": "Add parent link", "Payload": res, "Id": ObjectId(parentId) })
    await audit.insertOne({ "timestamp": new Date().toISOString(), "Action": "Add parent link", "Payload": res, "Id": ObjectId(id) })
    return `Added link between ${parentId} and ${id}`;
  }

