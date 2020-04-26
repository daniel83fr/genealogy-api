import request from "request-promise";
import dotenv from "dotenv";

dotenv.config();
const connectionString = process.env.MONGODB;

const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;

const mongoDbDatabase = process.env.MONGODB_DATABASE;
const memberCollection = "members";
const auditCollection = "audit";
const relationCollection = "relations";

export async function initClient() {
  return await MongoClient.connect(connectionString, {  useUnifiedTopology: true, useNewUrlParser: true })
    .catch((err: any) => { console.log(err); });
}

export async function createPerson1(user:any){
  console.log("Create Person")
  user._id = null;
  const client = await initClient();
  var res =  await runQuery(client, insertPersonIntoCollection(client,user));
  return res.insertedId;
}

export async function updatePerson1(id:string, patch:object){
  console.log("Update Person")
  const client = await initClient();
  var res =  await runQuery(client, updatePersonIntoCollection(client, id, patch));
  return res.insertedId;
}

export async function updateRelation1(id:string, id2:string, patch:object){
  console.log("Update Relation")
  const client = await initClient();
  var res =  await runQuery(client, updateRelationIntoCollection(client, id, id2, patch));
  return res.insertedId;
}

export async function deletePerson(id:string){
  console.log("Delete Person" + id)
  const client = await initClient();
  var res =  await runQuery(client, deletePersonFromCollection(client,id));
  return  ObjectId(id);
}

export async function removeRelation(id:string, id2: string){
  console.log("Delete Relation betwen" + id + " and " + id2)
  const client = await initClient();
  var res =  await runQuery(client, deleteRelationFromCollection(client,id, id2));
  return  ObjectId(id);
}

export async function addParentRelation(id:string, id2: string){
  console.log("Add Parent Relation betwen" + id + " and " + id2)
  const client = await initClient();
  var res =  await runQuery(client, addParentRelationFromCollection(client,id, id2));
  return  ObjectId(id);
}

export async function searchPerson1(query:string, page:number, limit:number){
  const client = await initClient();
  var res =  await runQuery(client, searchPersonsFromCollection(client, query, page, limit));
  return  res;
}

export async function getUnusedPerson(){
  console.log("Get unused persons")
  const client = await initClient();
  var res =  await runQuery(client, getUnusedPersonsFromCollection(client));
  return  res;
}

export async function addSpouseRelation(id:string, id2: string){
  console.log("Add Spouse Relation betwen" + id + " and " + id2)
  const client = await initClient();
  var res =  await runQuery(client, addSpouseRelationFromCollection(client,id, id2));
  return  ObjectId(id);
}

// export async function getPerson(id:string){
//   console.log("Get Person" + id)
//   const client = await initClient();
//   var res =  await runQuery(client, getPersonFromCollection(client,id));
//   return  res;
// }

export async function getPersonFull(id:string){
  console.log("Get Person Full" + id)

  var items: [] = []
  var client = await initClient();
  var relations =  await runQuery(client, getRelationFromCollection(client,id));
  var obj = Object.assign(relations)

  return obj;
}

export async function getRelation(id:string){
  console.log("Get Relations for person" + id)
  const client = await initClient();
  var res =  await runQuery(client, getRelationFromCollection(client,id));
  return  res;
}

export async function runQuery(client: any,  func:Promise<any>) {
  if (!client) 
  {
    return;
  }
  let res: any;
  try {
    res = await func;
  }
  catch (err) {
    console.log(err);
  }
  finally {
    client.close();
  }
 
  return res;
}


async function getPersonFromCollection(client: any, id: any) {
  const db = client.db(mongoDbDatabase);
  let collection = db.collection(memberCollection);
  let query = {"_id": ObjectId(id)}
  let res = await collection.findOne(query);
  return res;
}

function PushIfNotExits(array:any[], item:any){
  var index = array.findIndex(x => x.Person1.toString()==item.Person1.toString() && x.Person2.toString()==item.Person2.toString())
  if (index === -1){
      array.push(item);
  }
}

async function getRelationFromCollection(client: any, id: any) {

  const db1 = client.db(mongoDbDatabase);
  let collection1 = db1.collection("relations");
  let getRelationQuery = {$or:[{"Person1": ObjectId(id)},{"Person2": ObjectId(id)}]}
  let rels = await collection1.find(getRelationQuery,{fields:{ _id: 0}}).toArray();


  var items:any[] = []
  // Add current Person


 
  //Add Parent and step Parents and step siblings
  var parents: any[] = []
  rels.forEach((element: any) => {
    
    parents.push(element.Person1)
    parents.push(element.Person2)
  })
  let res3 = await db1.collection("relations").find({ Type:"Spouse",   $or:[{"Person1":  {$in:parents}},{"Person2":  {$in:parents}}]},{fields:{ _id: 0}}).toArray();
  res3.forEach((element: any) => {
      PushIfNotExits(rels, element)
      parents.push(element.Person1)
      parents.push(element.Person2)
  })

  let res4 = await db1.collection("relations").find({ Type:"Parent",   "Person1":  {$in:parents}},{fields:{ _id: 0}}).toArray();
  res4.forEach((element: any) => {
      PushIfNotExits(rels, element)
      items.push(element.Person1)
      items.push(element.Person2)
  })

//Add kids and step kids and spouses
  var spouses:any[] = []

  let res5 = await db1.collection("relations").find({ Type:"Spouse",   $or:[{"Person1":  ObjectId(id)},{"Person2":  ObjectId(id)}]},{fields:{ _id: 0}}).toArray();
  res5.forEach((element: any) => {
    PushIfNotExits(rels, element)
      spouses.push(element.Person1)
      spouses.push(element.Person2)
  })
  let res6 = await db1.collection("relations").find({ Type:"Parent",   "Person1":  {$in:spouses}},{fields:{ _id: 0}}).toArray();
  res6.forEach((element: any) => {
      
    PushIfNotExits(rels, element)
      items.push(element.Person1)
      items.push(element.Person2)
  })

  let collection2 = db1.collection("members");



  let res1 = await collection2.findOne({ _id :  ObjectId(id)});

  let res2 = await collection2.find({ _id :  {$in:items}},{fields:{ _id: 1,
    FirstName: 1,
    LastName: 1,
    BirthDate: 1,
    Gender: 1}}).toArray();

    let members: any[] = []
    members.push(res1)
    res2.forEach((element: any) => {
      if(element._id != id)
      {
        members.push(element)
      }
     
    })
  return {"members": members, "links":rels}




}


async function insertPersonIntoCollection(client: any, user: any) {
  const db = client.db(mongoDbDatabase);
  let collection = db.collection(memberCollection);
  user["CreatedAt"] = new Date().toISOString()
  var res = await collection.insertOne(user);

  let audit = db.collection(auditCollection);
  await audit.insertOne({ "timestamp": new Date().toISOString(), "Action": "Person inserted", "Payload": user, "Id": res.insertedId})
  return res;
}

async function updatePersonIntoCollection(client: any, id: string, patch: any) {
  const db = client.db(mongoDbDatabase);
  let collection = db.collection(memberCollection);
  patch.UpdatedAt = new Date().toISOString()
  var res = await collection.updateOne({"_id": ObjectId(id)}, {$set: patch});

  let audit = db.collection(auditCollection);
  await audit.insertOne({ "timestamp": new Date().toISOString(), "Action": "Person updated", "Payload": patch, "Id": ObjectId(id)})
  return res;
}

async function updateRelationIntoCollection(client: any, id: string, id2:string, patch: object) {
  const db = client.db(mongoDbDatabase);
  let collection = db.collection(memberCollection);
  let query = {$or:[{"Person1": ObjectId(id), "Person2": ObjectId(id2)},{"Person1": ObjectId(id2), "Person2": ObjectId(id)}]}
  var res = await collection.updateOne(query, {$set: patch});

  let audit = db.collection(auditCollection);
  await audit.insertOne({ "timestamp": new Date().toISOString(), "Action": "Relation updated", "Payload": patch, "Id": ObjectId(id)})
  await audit.insertOne({ "timestamp": new Date().toISOString(), "Action": "Relation updated", "Payload": patch, "Id": ObjectId(id2)})
  return res;
}


async function deletePersonFromCollection(client: any, id: string) {
  const db = client.db(mongoDbDatabase);
  let collection = db.collection(memberCollection);

  let query = {_id: ObjectId(id)}
  var res = await collection.findOne(query);


  await collection.deleteOne(query);

  let audit = db.collection(auditCollection);
  await audit.insertOne({ "timestamp": new Date().toISOString(), "Action": "Person Deleted", "Payload": res, "Id":res._id})
  return res;
}

async function deleteRelationFromCollection(client: any, id: string, id2: string) {
  const db = client.db(mongoDbDatabase);
  let collection = db.collection(relationCollection);

  let query = {$or:[{"Person1": ObjectId(id), "Person2": ObjectId(id2)},{"Person1": ObjectId(id2), "Person2": ObjectId(id)}]}
  var res = await collection.findOne(query);


  await collection.deleteOne(query);

  let audit = db.collection(auditCollection);
  await audit.insertOne({ "timestamp": new Date().toISOString(), "Action": "Remove link", "Payload": res, "Id":ObjectId(id)})
  await audit.insertOne({ "timestamp": new Date().toISOString(), "Action": "Remove link", "Payload": res, "Id":ObjectId(id2)})
  return res;
}

async function addParentRelationFromCollection(client: any, id: string, id2: string) {
  const db = client.db(mongoDbDatabase);
  let collection = db.collection(relationCollection);

  var res = await collection.insertOne({"Person1": ObjectId(id), "Person2": ObjectId(id2), "Type": "Parent"});

  let audit = db.collection(auditCollection);
  await audit.insertOne({ "timestamp": new Date().toISOString(), "Action": "Add parent link", "Payload": res, "Id":ObjectId(id)})
  await audit.insertOne({ "timestamp": new Date().toISOString(), "Action": "Add parent link", "Payload": res, "Id":ObjectId(id2)})
  return res;
}

async function getUnusedPersonsFromCollection(client: any) {
  const db = client.db(mongoDbDatabase);
  let collection = db.collection("membersUnused");
  let res = await collection.find({}).toArray();
  return res;
}

async function searchPersonsFromCollection(client: any, query:string, page:number, limit:number) {
  const db = client.db(mongoDbDatabase);
  let collection = db.collection("members");

  var regex = new RegExp(query, "i");
  let res = await collection.find(
    { $or:[ 
      { 
        FirstName: {$regex : regex} 
      },
      { 
        LastName: {$regex : regex}
      },
    ] }, { FirstName: 1, LastName: 1 }
 ).limit(5).toArray()
/*
.sort( { score: { $meta: "textScore" } } )
 .limit(10)
 */
  return res;
}

async function addSpouseRelationFromCollection(client: any, id: string, id2: string) {
  const db = client.db(mongoDbDatabase);
  let collection = db.collection(relationCollection);

  var res = await collection.insertOne({"Person1": ObjectId(id), "Person2": ObjectId(id2), "Type": "Spouse"});

  let audit = db.collection(auditCollection);
  await audit.insertOne({ "timestamp": new Date().toISOString(), "Action": "Add parent link", "Payload": res, "Id":ObjectId(id)})
  await audit.insertOne({ "timestamp": new Date().toISOString(), "Action": "Add parent link", "Payload": res, "Id":ObjectId(id2)})
  return res;
}
