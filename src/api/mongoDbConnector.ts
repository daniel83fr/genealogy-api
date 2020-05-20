import dotenv from "dotenv";
dotenv.config();

const connectionString = process.env.MONGODB;
const mongoDbDatabase = process.env.MONGODB_DATABASE;
const { MongoClient } = require('mongodb');

const ObjectId = require('mongodb').ObjectID;

const memberCollection = "members";
const auditCollection = "audit";
const relationCollection = "relations";
const credentialsCollection = "credentials"
var bcrypt = require('bcrypt');

const util = require('util')



export async function initClient() {
    return await MongoClient.connect(connectionString, { useUnifiedTopology: true, useNewUrlParser: true })
        .catch((err: any) => { console.log(err); });
}

export async function getPersonsFromMongoDb() {
    const client = await initClient();
    const db = client.db(mongoDbDatabase);
    let collection = db.collection(memberCollection);


    //await db.collection(relationCollection)
    // .updateMany({},{$rename: { "Type":"type"}})
    let res = await collection.find({},
        {
            firstName: 1,
            lastName: 1,
            maidenName: 1,
            birthDate: 1,
            deathDate: 1,
            gender: 1

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

export async function getTodayBirthdaysFromMongoDb() {
    const client = await initClient();
    const db = client.db(mongoDbDatabase);
    let collection = db.collection(memberCollection);
    let dateFilter = new Date().toISOString().substring(5, 10)
    let res = await collection.find({ "birthDate": { $regex : dateFilter}}).toArray();
    client.close()
    return res;
}

export async function getTodayDeathdaysFromMongoDb() {
    const client = await initClient();
    const db = client.db(mongoDbDatabase);
    let collection = db.collection(memberCollection);
    let dateFilter = new Date().toISOString().substring(5, 10)
    let res = await collection.find({ "death": { $regex : dateFilter}}).toArray();
    client.close()
    return res;
}

export async function getTodayMarriagedaysFromMongoDb() {
    const client = await initClient();
    const db = client.db(mongoDbDatabase);
    let collection = db.collection(relationCollection);
    let dateFilter = new Date().toISOString().substring(5, 10)
    let res = await collection.find({  "marriage_date": {$regex : dateFilter }}).toArray();
    let items : string[]= [];
    res.forEach((element: { person1_id: string; person2_id: string; }) => {
        items.push(ObjectId(element.person1_id));
        items.push(ObjectId(element.person2_id));
    });

    let query = { _id: { $in: items } }
    let res2 = await db.collection(memberCollection).find(query).toArray()

    client.close()
    return res2;
}


export async function getPersonByLoginFromMongoDb(login: string) {
    const client = await initClient();
    const db = client.db(mongoDbDatabase);
    let collection = db.collection("credentials");
    let res = await collection.findOne({ login: login }, { login: 1, id: 1 })
    client.close()
    return res;
}

export async function setProfilePictureFromMongo(person: string, image: string){
    console.log('Set profile pic' + image)
    const client = await initClient();
    const db = client.db(mongoDbDatabase);
    let collection = db.collection("photoTags");

    let res = await collection.updateMany({ "person_id": person, "isProfile": "true", "photo_id": { $ne: image} }
    ,{ $set: { "isProfile": 'false' } } )

    let resLinks2 = await collection.updateOne({ "person_id": person, "photo_id": image },
    { $set: { "isProfile": "true" } } )
    return "Profile picture updated."
}

export async function deletePhotoFromMongo( image: string){
    const client = await initClient();
    const db = client.db(mongoDbDatabase);
    let collection = db.collection("photoTags");

    let res = await collection.remove({ "photo_id": image })

    let res2 = await db.collection('photos').remove({"_id": ObjectId(image)})
    return "Photo deleted."
}


export async function getPhotosByIdFromMongoDb(id: string) {
    const client = await initClient();
    const db = client.db(mongoDbDatabase);
    let collection = db.collection("photoTags");

    let res = await collection.find({ "person_id": id },
        {
            person_id: 1
        }).toArray()

    console.log(res);
    let items: any = []

    res.forEach((element: { photo_id: string; }) => {
        items.push(ObjectId(element.photo_id))
    });


    let photos = db.collection("photos");

    let query = { _id: { $in: items } }
    let photoResult = await photos.find(query).toArray();


    client.close()
    return photoResult;
}

export async function getPhotoProfileFromMongoDb(id: string) {
    const client = await initClient();
    const db = client.db(mongoDbDatabase);
    let collection = db.collection("photoTags");

    let res = await collection.find({ "person_id": id, "isProfile": "true" },
        {
            person_id: 1
        }).toArray()

    console.log(res);


    let items: any = []

    res.forEach((element: { photo_id: string; }) => {
        items.push(ObjectId(element.photo_id))
    });


    let photos = db.collection("photos");

    let query = { _id: { $in: items } }
    let photoResult = await photos.findOne(query);


    client.close()
    return photoResult;
}

export async function getPhotosRandomFromMongoDb(num: number) {
    const client = await initClient();
    const db = client.db(mongoDbDatabase);
    let collection = db.collection("photos");

    let res = await collection.aggregate([{ $sample: { size: 5 } }],
        {
            url: 1
        }).toArray()

    console.log(res);



    client.close()
    return res;
}

export async function getAuditLastEntriesFromMongoDb(num: number) {
    const client = await initClient();
    const db = client.db(mongoDbDatabase);
    let collection = db.collection("audit");

    let res = await collection.find({},
        {
            timestamp: 1,
            type: 1,
            id: 1,
            user: 1

        })
        .sort({ _id: 1 })
        .limit(num)
        .toArray()

    console.log(res);



    client.close()
    return res;
}

export async function addPhotoFromMongoDb(url: string, deleteHash: string, persons: string[]) {
    const client = await initClient();
    const db = client.db(mongoDbDatabase);

    let photos = db.collection("photos");

    let query = { 'url': url, 'deleteHash': deleteHash }
    let res = await photos.insertOne(query)
    console.log(JSON.stringify(res))
    let photo_id = res.insertedId.toString();

    let collection = db.collection("photoTags");
    persons.forEach(async elem => {
        await collection.insertOne({ 'photo_id': photo_id, 'person_id': elem })
    });
    client.close()
    return "Done";
}



export async function getParentByIdFromMongoDb(id: string, gender: string): Promise<any> {
    const client = await initClient();
    const db = client.db(mongoDbDatabase);

    let links = db.collection(relationCollection);
    let resLinks = await links.find({ "person2_id": ObjectId(id), "type": "Parent" }).toArray()
    let items: any = []
    resLinks.forEach((element: { person1_id: string; }) => {
        items.push(ObjectId(element.person1_id))
    });
    let members = db.collection(memberCollection);

    let query = { _id: { $in: items } }
    let parents = await members.find(query).toArray();

    let father = null;
    parents.forEach((element: { gender: string; }) => {
        if (element.gender == gender) {
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
    let resLinks = await links.find({ "person1_id": ObjectId(id), "type": "Parent" }).toArray()
    let items: any = []
    resLinks.forEach((element: { person2_id: string; }) => {
        items.push(ObjectId(element.person2_id))
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
    let resLinks = await links.find({ "person2_id": ObjectId(id), "type": "Parent" }).toArray()
    let items: any = []
    resLinks.forEach((element: { person1_id: string; }) => {
        items.push(ObjectId(element.person1_id))
    });

    let resLinks2 = await links.find({ "person1_id": { $in: items }, "type": "Parent" }).toArray()
    let items2: any = []
    resLinks2.forEach((element: { person2_id: string; }) => {
        if (element.person2_id.toString() != id) {
            items2.push(ObjectId(element.person2_id))
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
    let resLinks = await links.find({ type: "Spouse", $or: [{ "person1_id": ObjectId(id) }, { "person2_id": ObjectId(id) }] }).toArray()
    let items: any = []
    resLinks.forEach((element: { person1_id: string; person2_id: string; }) => {
        if (element.person1_id.toString() == id) {
            items.push(ObjectId(element.person2_id))
        }
        else {
            items.push(ObjectId(element.person1_id))
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
    let query = { $or: [{ "person1_id": ObjectId(id), "person2_id": ObjectId(id2) }, { "person1_id": ObjectId(id2), "person2_id": ObjectId(id) }] }
    var res = await links.findOne(query);
    console.log(query)
    await links.deleteMany(query);

    let audit = db.collection(auditCollection);
    await audit.insertOne({ "timestamp": new Date().toISOString(), "type": "Relation", "action": "Remove link", "payload": res, "id": ObjectId(id) })
    await audit.insertOne({ "timestamp": new Date().toISOString(), "type": "Relation", "action": "Remove link", "payload": res, "id": ObjectId(id2) })
    client.close()
    return `Deleted link between ${id} and ${id2}`;
}


export async function deleteSiblingRelationFromMongoDb(id: string, id2: string) {
    const client = await initClient();
    const db = client.db(mongoDbDatabase);

    let links = db.collection(relationCollection);

    let parents1 = await links.find({ "type": "Parent", "person2_id": ObjectId(id) }).toArray()
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
    let query1 = { $or: [{ "person1_id": ObjectId(id) }, { "person2_id": ObjectId(id) }] }
    await links.deleteMany(query1);


    await collection.deleteOne(query);

    let audit = db.collection(auditCollection);
    await audit.insertOne({ "timestamp": new Date().toISOString(), "type": "Person", "action": "Person Deleted", "payload": res, "id": res._id })
    client.close()
    return `Deleted person ${id}`;
}



export async function addParentRelationFromMongoDb(id: string, parentId: string) {
    const client = await initClient();
    const db = client.db(mongoDbDatabase);
    let collection = db.collection(relationCollection);

    var res = await collection.insertOne({ "person1_id": ObjectId(parentId), "person2_id": ObjectId(id), "type": "Parent" });
    let audit = db.collection(auditCollection);
    await audit.insertOne({ "timestamp": new Date().toISOString(), "type": "Relation", "action": "Add parent link", "payload": res, "id": ObjectId(parentId) })
    await audit.insertOne({ "timestamp": new Date().toISOString(), "type": "Relation", "action": "Add parent link", "payload": res, "id": ObjectId(id) })
    client.close()
    return `Added link between ${parentId} and ${id}`;
}

export async function addSpouseRelationFromMongoDb(id1: string, id2: string) {
    const client = await initClient();
    const db = client.db(mongoDbDatabase);
    let collection = db.collection(relationCollection);

    var res = await collection.insertOne({ "person1_id": ObjectId(id1), "person2_id": ObjectId(id2), "type": "Spouse" });
    let audit = db.collection(auditCollection);
    await audit.insertOne({ "timestamp": new Date().toISOString(), "Type": "Relation", "Action": "Add parent link", "Payload": res, "Id": ObjectId(id1) })
    await audit.insertOne({ "timestamp": new Date().toISOString(), "Type": "Relation", "Action": "Add parent link", "Payload": res, "Id": ObjectId(id2) })
    client.close()
    return `Added link between ${id1} and ${id2}`;
}

export async function addSiblingRelationFromMongoDb(id1: string, id2: string) {
    const client = await initClient();
    const db = client.db(mongoDbDatabase);
    let links = db.collection(relationCollection);

    let parents1 = await links.find({ "Type": "Parent", "person2_id": ObjectId(id1) }).toArray()
    console.log(parents1)
    client.close()

    await parents1.forEach(async (element: { Person1: any; }) => {
        return addParentRelationFromMongoDb(id2, element.Person1)
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
    await audit.insertOne({ "timestamp": new Date().toISOString(), "type": "Person", "action": "Person updated", "payload": patch, "id": ObjectId(id) })

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
    await audit.insertOne({ "timestamp": new Date().toISOString(), "type": "Person", "action": "Person inserted", "payload": person, "id": ObjectId(res.insertedId) })

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
    return res.length > 0;
}

export async function checkCredentialsFromMongoDb(login: string, password: string): Promise<any> {
    const client = await initClient();
    const db = client.db(mongoDbDatabase);
    let collection = db.collection(credentialsCollection);
    login = login.toLowerCase()
    let query = { 'login': login }
    var res = await collection.findOne(query);

    client.close()

    return {
        'success': bcrypt.compareSync(password, res.password),
        'profileId': res.id
    }
}

export async function createCredentialsFromMongoDb(id: string, login: string, password: string) {

    console.log("creating credentials")
    const client = await initClient();
    const db = client.db(mongoDbDatabase);
    let collection = db.collection(credentialsCollection);
    login = login.toLowerCase()
    let query = { 'login': login }
    var res = await collection.findOne(query);
    if (res != null) {
        client.close()
        console.log("login already exists")
        return "login already exist"
    }



    var hash = bcrypt.hashSync(password, 10);
    var document = { "id": id, "login": login, "password": hash }
    collection.insertOne(document)
    client.close()
    console.log("login already exists")
    return "Account created"

}