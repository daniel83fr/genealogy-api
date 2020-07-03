import { ObjectId, getPhotosByIdFromMongoDb } from '../api/mongoDbConnector';

export default class ProfileService {
  
  async getProfileByIdFromMongoDb(id: string, db:any) {

    const membersCollection = db.collection('members');
    const relationsCollection = db.collection('relations');

    const validGuid = new RegExp('^[0-9a-fA-F]{24}$').test(id);
    let query = {};
    if (validGuid) {
      query = { "$or": [{ "profileId": id }, { "_id": ObjectId(id) }] }
    } else {
      query = { "profileId": id }
    }

    const currentUser = await membersCollection.findOne(query);
    const userId:string = currentUser?._id?.toString();

    const parentLinks = await relationsCollection.find({ person2_id: ObjectId(userId), type: 'Parent' }).toArray();
    const parentIds: any = [];
    parentLinks.forEach((element: { person1_id: string; }) => {
      parentIds.push(ObjectId(element.person1_id));
    });

    const siblingsLinks = await relationsCollection.find( { person1_id: { $in: parentIds }, person2_id: { $nin : [ userId]}, type: 'Parent' }).toArray();
    const siblingsIds: any = [];
    siblingsLinks.forEach((element: { person2_id: string; }) => {
      if (element.person2_id.toString() != userId) {
        siblingsIds.push(ObjectId(element.person2_id));
      }
    });

    const niblingsIds: any[] = []
    const niblingsLinks = await relationsCollection.find({ person1_id: { $in: siblingsIds }, type: 'Parent' }).toArray();
    niblingsLinks.forEach((element: { person2_id: string; }) => {
      niblingsIds.push(ObjectId(element.person2_id));
    });

    const childrenLinks = await relationsCollection.find({ person1_id: ObjectId(userId), type: 'Parent' }).toArray();
    const childrenIds: any = [];
    childrenLinks.forEach((element: { person2_id: string; }) => {
      childrenIds.push(ObjectId(element.person2_id));
    });

    const grandParentIds: any[] = [];
    const grandParentLinks = await relationsCollection.find({ person2_id: { $in: parentIds }, type: 'Parent' }).toArray();
    grandParentLinks.forEach((element: { person1_id: string; }) => {
      grandParentIds.push(ObjectId(element.person1_id));
    });

    const piblingsIds: any[] = [];
    const piblingsLinks = await relationsCollection.find({ person1_id: { $in: grandParentIds }, person2_id: { $nin: parentIds }, type: 'Parent' }).toArray();

    piblingsLinks.forEach((element: { person2_id: string; }) => {
      piblingsIds.push(ObjectId(element.person2_id));
    });

    const cousinsIds: any[] = [];
    const cousinsLinks = await relationsCollection.find({ person1_id: { $in: piblingsIds }, type: 'Parent' }).toArray();
    cousinsLinks.forEach((element: { person2_id: string; }) => {
      cousinsIds.push(ObjectId(element.person2_id));
    });

    const grandChildrenIds: any[] = [];
    const grandChildrenLinks = await relationsCollection.find({ person1_id: { $in: childrenIds }, type: 'Parent' }).toArray();
    grandChildrenLinks.forEach((element: { person2_id: string; }) => {
      grandChildrenIds.push(ObjectId(element.person2_id));
    });

    const grandGrandChildrenIds: any[] = [];
    const grandGrandChildrenLinks = await relationsCollection.find({ person1_id: { $in: grandChildrenIds }, type: 'Parent' }).toArray();
    grandGrandChildrenLinks.forEach((element: { person2_id: string; }) => {
      grandGrandChildrenIds.push(ObjectId(element.person2_id));
    });

    const spouseLinks = await relationsCollection.find({ type: 'Spouse', $or: [{ person1_id: ObjectId(userId) }, { person2_id: ObjectId(userId) }] }).toArray();
    const spousesIds: any = [];
    spouseLinks.forEach((element: { person1_id: string; person2_id: string; }) => {
      if (element.person1_id.toString() == userId) {
        spousesIds.push(ObjectId(element.person2_id));
      } else {
        spousesIds.push(ObjectId(element.person1_id));
      }
    });

    const parents = await membersCollection.find( { _id: { $in: parentIds } }).toArray();
    const children = await membersCollection.find( { _id: { $in: childrenIds } }).toArray();
    const grandParents = await membersCollection.find( { _id: { $in: grandParentIds } }).toArray();
    const grandChildren = await membersCollection.find( { _id: { $in: grandChildrenIds } }).toArray();
    const grandGrandChildren = await membersCollection.find( { _id: { $in: grandGrandChildrenIds } }).toArray();
    const spouses = await membersCollection.find( { _id: { $in: spousesIds } }).toArray();
    const siblings = await membersCollection.find( { _id: { $in: siblingsIds } }).toArray();
    const niblings = await membersCollection.find( { _id: { $in: niblingsIds } }).toArray();
    const piblings = await membersCollection.find( { _id: { $in: piblingsIds } }).toArray();
    const cousins = await membersCollection.find( { _id: { $in: cousinsIds } }).toArray();
    const photos = await getPhotosByIdFromMongoDb(userId, db);
    
    for (let i = 0; i < photos.length; i++ ) {
      photos[i].url = photos[i].url
        .replace('https://i.imgur.com/', 'https://www.res01.com/images/')
        .replace('.jpg', 'm.jpg');
    }

    return {
      currentPerson: this.mapping(currentUser),
      parents: parents.map(this.mapping),
      children: children.map(this.mapping).sort(ProfileService.sortByYearOfBirth),
      mother: this.mapping(parents.find((x:any) => x.gender === 'Female')),
      father: this.mapping(parents.find((x:any) => x.gender === 'Male')),
      grandParents: grandParents.map(this.mapping),
      grandChildren: grandChildren.map(this.mapping).sort(ProfileService.sortByYearOfBirth),
      grandGrandChildren: grandGrandChildren.map(this.mapping).sort(ProfileService.sortByYearOfBirth),
      spouses: spouses.map(this.mapping),
      siblings: siblings.map(this.mapping).sort(ProfileService.sortByYearOfBirth),
      niblings: niblings.map(this.mapping).sort(ProfileService.sortByYearOfBirth),
      piblings: piblings.map(this.mapping).sort(ProfileService.sortByYearOfBirth),
      cousins: cousins.map(this.mapping).sort(ProfileService.sortByYearOfBirth),
      photos: photos,
    };
  }
  
  mapping(element: any) {
    const yearOfBirth = element?.birth?.year;
    const yearOfDeath = element?.death?.year;

    return {
      _id: element?._id,
      firstName: element?.firstName,
      lastName: element?.lastName,
      maidenName: element?.maidenName,
      gender: element?.gender,
      yearOfBirth: yearOfBirth === '0000' ? null : yearOfBirth,
      yearOfDeath: yearOfDeath === '0000' ? null : yearOfDeath,
      isDead: element?.isDead ?? false,
      profileId: element?.profileId,
    };
  }

  static sortByYearOfBirth(a: any, b: any) {
    const keyA = new Date(a.yearOfBirth);
    const keyB = new Date(b.yearOfBirth);
    if (keyA < keyB) return -1;
    if (keyA > keyB) return 1;
    return 0;
  }
}
