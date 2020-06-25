import { MongoConnector, createPersonFromMongoDb, getConnector, mongoDbDatabase, memberCollection, ObjectId, relationCollection } from "../api/mongoDbConnector";

const fs = require('fs');
const cheerio = require('cheerio');
const axios = require('axios');

export default class Scrapper {

  sleep(ms: number) {
    var start = new Date().getTime(), expire = start + ms;
    while (new Date().getTime() < expire) { }
    return;
  }

  async BuildCsv() {

    let mappings: any = {}
    fs.readFileSync('mapping.csv', 'utf-8').split(/\r?\n/).forEach(function (line: string) {
      mappings[line.split(',')[0]] = line.split(',')[1]

    });


    let profiles: any[] = []
    fs.readdirSync('data').forEach((file: string) => {

      if (!file.startsWith('profile')) {
        profiles.push(`${file}`)
      }
    });


    let datas: any[] = []







    profiles.forEach((profile: any) => {

      let data = fs.readFileSync(`data/${profile}`);
      let row = JSON.parse(data);


      if (row.partners != null) {
        let itm: any = {}
        itm.person1_id = this.map2(row.partners[0], mappings)
        itm.person2_id = this.map2(row.partners[1], mappings)
        itm.CreatedAt = new Date().toISOString();
        itm.type = 'Spouse';
        datas.push(itm)

      }

      if (row.children != null) {
        row.children.forEach((parent: any) => {

          row.children.forEach((element: any) => {
            let itm: any = {}
            itm.person1_id = this.map2(parent, mappings)
            itm.person2_id = this.map2(element, mappings)
            itm.CreatedAt = new Date().toISOString();
            itm.type = 'Parent';
            datas.push(itm)

          });

        });
      }


    });

    const connector = getConnector();
    const client = await connector.initClient();
    const db = client.db(mongoDbDatabase);
    const collection = db.collection(relationCollection);

    for (let i = 0; i < datas.length; i++) {
      console.log(`process ${i}/ ${datas.length}`);
      const res = await collection.insertOne(datas[i]);

    }


    client.close();

    console.log("DOne")
    return datas;
  }


 
     async BuildCsv2(){

      let profiles:any[] = []
      fs.readdirSync('data').forEach((file:string) => {

        if(file.startsWith('profile')){
          profiles.push(`${file}`)
        }
      });

      let datas: any[] = []
      profiles.forEach((element:any)=>{

        let data = fs.readFileSync(`data/${element}`);
        let row = JSON.parse(data);


        datas.push(this.map(JSON.parse(data)));
      });

      fs.writeFile('profiles.txt', JSON.stringify(datas,null, '\t'), function(err:any, result:any) {
        if(err) console.log('error', err);
      });

    //et connector = new MongoConnector(process.env.MONGODB);
    const connector = getConnector();
    const client = await connector.initClient();
    const db = client.db(mongoDbDatabase);
    const collection = db.collection(memberCollection);

    for(let i=0; i<datas.length; i++){
      console.log(`process ${i}/ ${datas.length}`);
      const res = await collection.insertOne(datas[i]);

    }


    client.close();





      return datas

  }

  map2(data: string, mappings: any) {
    let profileId = data?.replace('https://www.geni.com/api/', '');
    return ObjectId(mappings[profileId]);
  }

  map(data: any) {
    let a: any = {};
    a.firstName = data.first_name;
    a.lastName = data.last_name;
    if (data.name.includes('private')) {
      a.lastName = data.name.replace('<private> ', '');
    }

    if (data.gender != null) {
      a.gender = data.gender.charAt(0).toUpperCase() + data.gender.slice(1)
    }

    if (data.current_residence != null) {
      a.currentLocation = data.current_residence.city + ', ' + data.current_residence.country
    }

    if (data.birth != null) {
      if (data.birth.date != null) {
        a.birthDate = `${data.birth.date.year}-${data.birth.date.month}-${data.birth.date.day}`;
      }
      if (data.birth.location != null) {
        a.birthLocation = `${data.birth.location.city}, ${data.birth.location.country}`;
      }
    }

    if (data.death != null) {
      if (data.death.date != null) {
        a.birthDate = `${data.death.date.year}-${data.death.date.month}-${data.death.date.day}`;
      }
      if (data.death.location != null) {
        a.birthLocation = `${data.death.location.city}, ${data.death.location.country}`;
      }
    }

    if (data.is_alive == false) {
      a.isDead = true;
    }

    a.maidenName = data.maiden_name;
    a.geni_profile = data.id
    return a;
  }

  async Scrap(url: string) {
    let visited: string[] = [];
    let toVisit: string[] = [url];


    fs.readdirSync('data').forEach((file: string) => {

      if (file.startsWith('profile')) {
        visited.push(`https://www.geni.com/api/${file}`)
      }
      else {
        toVisit.push(`https://www.geni.com/api/${file}`);
      }
    });

    while (toVisit.length > 0) {

      const currentUrl: string = toVisit.pop() ?? '';
      if (!visited.includes(currentUrl)) {
        this.sleep(500);
        console.log(`processing ${currentUrl}`);
        console.log(`visited: ${visited.length} - toVisit: ${toVisit.length}`);


        const profile = await this.fetchUrl(currentUrl);
        fs.writeFile(`data/${profile.id}.json`, JSON.stringify(profile, null, '\t'), function (err: any, result: any) {
          if (err) console.log('error', err);
        });

        if ('unions' in profile) {
          profile.unions.forEach((element: any) => {
            if (!toVisit.includes(element) && !visited.includes(element)) {
              toVisit.push(element);
            }
          });
        }

        if ('children' in profile) {
          profile.children.forEach((element: any) => {
            if (!toVisit.includes(element) && !visited.includes(element)) {
              toVisit.push(element)
            }

          });

        }
        if ('partners' in profile) {
          profile.partners.forEach((element: any) => {
            if (!toVisit.includes(element) && !visited.includes(element)) {
              toVisit.push(element)
            }

          });
        }

        // console.log(profile.first_name)
        // console.log(profile)
        // let row = `,${profile.id},${profile.first_name},${profile.last_name},${data.profile.birthDay},${data.profile.url}\r\n`;
        // fs.appendFile('persons.csv', row, function (err: any, result: any) {
        //   if (err) console.log('error', err);
        // });

        // console.log(data.links.length + " links")
        // data.links.forEach(element => {
        //   let rowLink = `${data.profile.url},${element.url},${element.type}\r\n`;
        //   fs.appendFile('links.csv', rowLink, function (err: any, result: any) {
        //     if (err) console.log('error', err);
        //   });
        //   toVisit.push(element.url);
        //   console.log(element.type)
        // })
        if (!visited.includes(currentUrl)) {
          visited.push(currentUrl)
        }


      }




    }
  }

  async fetchUrl(url: string) {
    const result = await axios.get(url, { headers: { "Authorization": `Bearer xqJ1SaH7RvV6FKWgnhkEfUU2kz0W4eHTS0g9oewj` } });
    return result.data;
    const data1 = result.data.replace('display:none', '');

    console.log(data1);
    fs.writeFile('writeMe1.txt', data1, function (err: any, result: any) {
      if (err) console.log('error', err);
    });
    const data2 = cheerio.load(data1);

    const $ = data2;
    const items: any[] = [];

    const person: any = {};
    person.name = $('meta[name="og:title"]').attr('content');
    person.gender = $('meta[name="og:image"]').attr('content').includes('_f_') ? 'Female' : 'Male';
    person.birthDay = $('#birth_date').text().trim();
    person.url = $('meta[name="og:url"]').attr('content');


    $('[itemprop="spouse"]').each((index: any, element: any) => {
      const link: any = {};
      link.name = $(element).find('[itemprop="name"]').attr('content');
      link.url = $(element).find('[itemprop="url"]').attr('content');
      link.type = 'spouse';
      items.push(link);
    });

    $('[itemprop="children"]').each((index: any, element: any) => {
      const link: any = {};
      link.name = $(element).find('[itemprop="name"]').attr('content');
      link.url = $(element).find('[itemprop="url"]').attr('content');
      link.type = 'children';
      items.push(link);
    });
    return { profile: person, links: items };
  }

  scrapper(res: any, url: string) {
    const siteUrl = url;

    const fetchData = async () => {
      const result = await axios.get(siteUrl);
      console.log(result.data)
      const data1 = result.data.replace('display:none', '');
      console.log(data1);

      fs.writeFile('writeMe1.txt', data1, function (err: any, result: any) {
        if (err) console.log('error', err);
      });


      return cheerio.load(data1);
    };


    fetchData().then((data) => {
      const $ = data;
      const items: any[] = [];

      const person: any = {};
      person.name = $('meta[name="og:title"]').attr('content');
      person.gender = $('meta[name="og:image"]').attr('content').includes('_f_') ? 'Female' : 'Male';
      person.birthDay = $('#birth_date').text().trim();
      person.url = $('meta[name="og:url"]').attr('content');

      items.push(person);

      $('[itemprop="spouse"]').each((index: any, element: any) => {
        const link: any = {};
        link.name = $(element).find('[itemprop="name"]').attr('content');
        link.url = $(element).find('[itemprop="url"]').attr('content');
        items.push(link);
      });

      $('[itemprop="children"]').each((index: any, element: any) => {
        const link: any = {};
        link.name = $(element).find('[itemprop="name"]').attr('content');
        link.url = $(element).find('[itemprop="url"]').attr('content');
        items.push(link);
      });


      res.send(items);
    });
  }



}
