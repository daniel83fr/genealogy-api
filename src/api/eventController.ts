import LoggerService from "../services/logger_service";
import { MongoConnector, getTodayBirthdaysFromMongoDb, getTodayDeathdaysFromMongoDb, getTodayMarriagedaysFromMongoDb, getEventsFromMongoDb, mongoDbDatabase } from "./mongoDbConnector";
import LoginController from "./loginController";

export default class EventController {
  logger: LoggerService = new LoggerService('eventController');

  connector: MongoConnector;

  constructor(connector: MongoConnector) {
    this.connector = connector;
  }

  async getEvents(date1: string, date2: string) {

    const client = await this.connector.initClient();


    const datas: any = [];

    try {
      const db = client.db(mongoDbDatabase);
      const membersCollection = db.collection('members');
      const relationsCollection = db.collection('relations');


      var from = new Date(date1);
      var to = date2 === undefined ? new Date(date1) : new Date(date2);

      for (var day = from; day <= to; day.setDate(day.getDate() + 1)) {
        const data: any = await membersCollection.find({ "birth.month": day.getMonth() + 1, "birth.day": day.getDate() }).toArray();

        var cur: any = new Date();
       


        for (let i = 0; i < data.length; i++) {
          var age: any = new Date().getFullYear() - data[i]?.birth?.year??0;
          datas.push({ type: 'birthday', date: day, person: data[i], anniversary: age })
        }

        const data2: any = await membersCollection.find({ "death.month": day.getMonth() + 1, "death.day": day.getDate() }).toArray();
        for (let i = 0; i < data2.length; i++) {
          var age: any = new Date().getFullYear() - data2[i]?.birth?.year??0;
          datas.push({ type: 'death', date: date1, person: data2[i], anniversary: age })
        }


        const data3: any = await relationsCollection.find({ "wedding.month": day.getMonth() + 1, "wedding.day": day.getDate() }).toArray();

        for (let i = 0; i < data3.length; i++) {
          var age: any = new Date().getFullYear() - data3[i]?.wedding?.year??0;
          const p1 = await membersCollection.findOne({ _id: data3[i].person1_id });
          const p2 = await membersCollection.findOne({ _id: data3[i].person2_id });
          datas.push({ type: 'marriage', date: date1, person: p1, person2: p2, anniversary: age })
        }

      }



      client.close();
      return datas;
    } catch (err) {
      client.close();
      console.log(err);
      return [];
    }

  }

  getTodayBirthdays(user: any) {
    LoginController.CheckUserAuthenticated(user);

    return getTodayBirthdaysFromMongoDb()
      .catch((err: any) => {
        throw err;
      })
      .then((res: any) => res);
  }

  getTodayDeathdays(user: any) {
    LoginController.CheckUserAuthenticated(user);

    return getTodayDeathdaysFromMongoDb()
      .catch((err: any) => {
        throw err;
      })
      .then((res: any) => res);
  }

  getTodayMarriagedays(user: any) {
    LoginController.CheckUserAuthenticated(user);
    return getTodayMarriagedaysFromMongoDb()
      .catch((err: any) => {
        throw err;
      })
      .then((res: any) => res);
  }

}
