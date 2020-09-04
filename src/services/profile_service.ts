import { PostgresConnector } from '../api/postgresConnector';
import LoggerService from './logger_service';

export default class ProfileService {
  logger: LoggerService = new LoggerService('ProfileService');

  async getProfileById(id: string) {
    this.logger.debug(`GetProfileById ${id}`);
    const connector = new PostgresConnector();

    const idNew = await connector.getIdFromProfile(id);
    const spouseIdsNew = await connector.GetSpouseIds(idNew);
    const parentIdsNew:any[] = await connector.GetParentIds([idNew]);
    let siblingsIdsNew = await connector.GetChildrenIds(parentIdsNew);
    siblingsIdsNew = siblingsIdsNew.filter((x:any) => x !== idNew);
    const childrenIdsNew = await connector.GetChildrenIds([idNew]);
    const grandparentIdsNew:any[] = await connector.GetParentIds(parentIdsNew);
    let piblingsIdsNew = await connector.GetChildrenIds(grandparentIdsNew);
    piblingsIdsNew = piblingsIdsNew.filter((x:any)=> !parentIdsNew.includes(x));
    const cousinsIdsNew = await connector.GetChildrenIds(piblingsIdsNew);
    const niblingsIdsNew = await connector.GetChildrenIds(siblingsIdsNew);
    const grandchildrenIdsNew = await connector.GetChildrenIds(childrenIdsNew);
    const grandgrandchildrenIdsNew = await connector.GetChildrenIds(grandchildrenIdsNew);

    const persons = await connector.GetPersons([idNew]
      .concat(spouseIdsNew, parentIdsNew, siblingsIdsNew, childrenIdsNew, grandparentIdsNew,
        piblingsIdsNew, cousinsIdsNew, niblingsIdsNew, grandgrandchildrenIdsNew, grandchildrenIdsNew));

    const photos = await connector.GetPhotos(idNew);

    for (let i = 0; i < photos.length; i++) {
      photos[i].url = photos[i].url
        .replace('https://i.imgur.com/', 'https://www.res01.com/images/')
        .replace('.jpg', 'm.jpg');
    }

    return {
      currentPerson: persons.find(x => x._id == idNew),
      parents: persons.filter(x => parentIdsNew.includes(x._id)),
      children: persons.filter(x => childrenIdsNew.includes(x._id)).sort(ProfileService.sortByYearOfBirth),
      mother: persons.filter(x => parentIdsNew.includes(x._id)).find((x:any) => x.gender === 'Female'),
      father: persons.filter(x => parentIdsNew.includes(x._id)).find((x:any) => x.gender === 'Male'),
      grandParents: persons.filter(x=> grandparentIdsNew.includes(x._id)),
      grandChildren: persons.filter(x=> grandchildrenIdsNew.includes(x._id)).sort(ProfileService.sortByYearOfBirth),
      grandGrandChildren: persons.filter(x=> grandgrandchildrenIdsNew.includes(x._id)).sort(ProfileService.sortByYearOfBirth),
      spouses: persons.filter(x=> spouseIdsNew.includes(x._id)),
      siblings: persons.filter(x=> siblingsIdsNew.includes(x._id)).sort(ProfileService.sortByYearOfBirth),
      niblings: persons.filter(x=> niblingsIdsNew.includes(x._id)).sort(ProfileService.sortByYearOfBirth),
      piblings: persons.filter(x=> piblingsIdsNew.includes(x._id)).sort(ProfileService.sortByYearOfBirth),
      cousins: persons.filter(x=> cousinsIdsNew.includes(x._id)).sort(ProfileService.sortByYearOfBirth),
      photos: photos,
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
