import PersonController, * as personController from '../src/api/personController';
import * as mongoDbConnector from '../src/api/mongoDbConnector';

describe('personController', () => {
  let personListMock: any[] = [];
  let connector: mongoDbConnector.MongoConnector;

  beforeEach(() => {
    connector = new mongoDbConnector.MongoConnector('connectionString');
    personListMock = [
      {
        _id: '5e6556437af677179baf2ece', firstName: 'Lourdes', lastName: 'Mariampillai', maidenName: '', gender: 'Female', birthDate: '1900-01-01', deathDate: '1900-01-01', isDead: true, profileId: '5e6556437af677179baf2ece',
      },
      {
        _id: '5ec68d8566db3f2a946ce8d3', firstName: 'kaylan', lastName: 'Sivandan', gender: 'Male', isDead: false, profileId: '5ec68d8566db3f2a946ce8d3',
      },
      {
        _id: '5ec68d8566db3f2a946ce8d4', firstName: 'test', lastName: 'test2', gender: 'Male', isDead: false, profileId: '5ec68d8566db3f2a946ce8d4',
      },
    ];
  });

  it('check database called with correct args', async () => {
    const spy = spyOn(connector, 'getArrayFromMongoDb').and.returnValue(Promise.resolve(personListMock));
    const controller = new PersonController(connector);
    await controller.getPersonList();
    expect(spy).toHaveBeenCalledWith('genealogyDb', 'members', {}, {
      firstName: 1,
      lastName: 1,
      maidenName: 1,
      birthDate: 1,
      gender: 1,
      deathDate: 1,
      isDead: 1,
      profileId: 1,
    });
  });


  it('should return the right number of persons', () => {
    spyOn(connector, 'getArrayFromMongoDb').and.returnValue(Promise.resolve(personListMock.slice(0, 2)));
    const controller = new PersonController(connector);

    return controller.getPersonList()
      .then((x: any[]) => {
        expect(x.length).toBe(2);
      });
  });

  it('map user infos', () => {
    spyOn(connector, 'getArrayFromMongoDb').and.returnValue(Promise.resolve(personListMock.slice(0, 1)));
    const controller = new PersonController(connector);

    return controller.getPersonList()
      .then((x: any[]) => {
        expect(x[0]).toEqual({
          _id: '5e6556437af677179baf2ece', firstName: 'Lourdes', lastName: 'Mariampillai', maidenName: '', gender: 'Female', yearOfBirth: '1900', yearOfDeath: '1900', isDead: true, profileId: '5e6556437af677179baf2ece',
        });
      });
  });

  it('it should set years to null when 0000', () => {
    const data = personListMock[0];
    data.birthDate = '0000-00-00';
    data.deathDate = '0000-00-00';

    spyOn(connector, 'getArrayFromMongoDb').and.returnValue(Promise.resolve([data]));
    const controller = new PersonController(connector);

    return controller.getPersonList()
      .then((x: any[]) => {
        expect(x[0].yearOfBirth).toEqual(null);
        expect(x[0].yearOfDeath).toEqual(null);
      });
  });

  it('it should set isDead to false by default', () => {
    const data = personListMock[0];
    delete data.isDead;

    spyOn(connector, 'getArrayFromMongoDb').and.returnValue(Promise.resolve([data]));
    const controller = new PersonController(connector);


    return controller.getPersonList()
      .then((x: any[]) => {
        expect(x[0].isDead).toEqual(false);
      });
  });
});
