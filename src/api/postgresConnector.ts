import dotenv from 'dotenv';
import { Pool } from 'pg';
import LoggerService from '../services/logger_service';
import PersonController from './personController';

dotenv.config();
const bcrypt = require('bcryptjs');

export class PostgresConnector {
  ClaimProfile(email: string, id: string) {
    this.pool.on('error', (err: any, client: any) => {
      console.error('Error:', err);
    });

    return this.pool.connect()
      .then((client: any) => {


        let query = `update credentials set id = '${id}' 
          where email  = '${email}'
        `;

        console.log(query);
        return client.query(query).then((res: any) => {
          client.release();
          return {
            success: true,
            message: 'Profile updated'
          };
        })
          .catch((err: any) => {
            client.release();
            return {
              success: false,
              message: 'Profile not updated'
            };
          })
      })
      .catch((err: any) => {
        console.error(err);
        return {
          success: true,
          message: 'Profile updated'
        };
      });
  }
  SetNickname(email: string, nickname: string) {
    this.pool.on('error', (err: any, client: any) => {
      console.error('Error:', err);
    });

    return this.pool.connect()
      .then((client: any) => {


        let query = `update nicknames set nickname = '${nickname}' 
          where id  in (select id from credentials where email = '${email}')
        `;

        console.log(query);
        return client.query(query).then((res: any) => {
          client.release();
          return {
            success: true,
            message: 'Profile updated'
          };
        })
          .catch((err: any) => {
            client.release();
            return {
              success: false,
              message: 'Profile not updated'
            };
          })
      })
      .catch((err: any) => {
        console.error(err);
        return {
          success: true,
          message: 'Profile updated'
        };
      });
  }

  SetProfilePhoto(image: string, person: string) {
    this.pool.on('error', (err: any, client: any) => {
      console.error('Error:', err);
    });

    return this.pool.connect()
      .then((client: any) => {

        let query = `update tags set is_profile = false
        where tags.photo_id <> '${image} and tags.person= '${person}')
        `;

        let query2 = `update tags set is_profile= true
        where tags.photo_id = '${image} and tags.person= '${person}')
        `;

        console.log(query);

        return client.query(query).then((res: any) => {
          return client.query(query2).then((res: any) => {
            console.log(res.rows.length)
            client.release();
            return "Done";
          })
        })
          .catch((err: any) => {
            client.release();
            throw err;
          })
      })
      .catch((err: any) => {
        throw err;
      });
  }
  AddPhoto(url: string, persons: string[], deleteHash: string) {
    this.pool.on('error', (err: any, client: any) => {
      console.error('Error:', err);
    });

    return this.pool.connect()
      .then((client: any) => {


        let query = `insert into images(url, delete_hash) values ('${url}', '${deleteHash}')
        `;



        console.log(query);


        return client.query(query).then((res: any) => {
          console.log(res.rows.length)
          client.release();
          return res.rows;
        })

          .catch((err: any) => {
            client.release();
            console.error(err);
          })
      })
      .catch((err: any) => {
        console.error(err);
      });
  }


  AddTagPhoto(image: string, person: string) {
    this.pool.on('error', (err: any, client: any) => {
      console.error('Error:', err);
    });

    return this.pool.connect()
      .then((client: any) => {



        let query = `insert into tags(photo_id, person) values('${image}','${person}')
        `;


        console.log(query);


        return client.query(query).then((res: any) => {
          console.log(res.rows.length)
          client.release();
          return "Done";
        })
          .catch((err: any) => {
            client.release();
            throw err;
          })
      })
      .catch((err: any) => {
        throw err;
      });
  }


  DeleteTagPhoto(image: string, person: string) {
    this.pool.on('error', (err: any, client: any) => {
      console.error('Error:', err);
    });

    return this.pool.connect()
      .then((client: any) => {



        let query = `update tags set is_deleted = true
        where tags.photo_id = '${image} and tags.person= '${person}')
        `;


        console.log(query);


        return client.query(query).then((res: any) => {
          console.log(res.rows.length)
          client.release();
          return "Done";
        })
          .catch((err: any) => {
            client.release();
            throw err;
          })
      })
      .catch((err: any) => {
        throw err;
      });
  }
  DeletePhoto(image: string) {
    this.pool.on('error', (err: any, client: any) => {
      console.error('Error:', err);
    });

    return this.pool.connect()
      .then((client: any) => {


        let query = `update images set is_deleted = true
        where images.photo_id = '${image}')
        `;

        let query2 = `update tags set is_deleted = true
        where tags.photo_id = '${image}')
        `;


        console.log(query);
        return client.query(query).then(() => {

          return client.query(query2).then((res: any) => {
            console.log(res.rows.length)
            client.release();
            return res.rows;
          })


        })
          .catch((err: any) => {
            client.release();
            console.error(err);
          })
      })
      .catch((err: any) => {
        console.error(err);
      });
  }
  GetRandomPhotos(number: number) {
    this.pool.on('error', (err: any, client: any) => {
      console.error('Error:', err);
    });

    return this.pool.connect()
      .then((client: any) => {


        let query = `select person, url from tags
left join images on tags.photo_id = images.photo_id 
order by random()
limit ${number}`;

        console.log(query);
        return client.query(query).then((res: any) => {
          client.release();


          console.log(res.rows.length)
          return res.rows.map(this.mapImage);

        })
          .catch((err: any) => {
            client.release();
            console.error(err);
            return []
          })
      })
      .catch((err: any) => {
        console.error(err);
        return [];
      });
  }



  GetProfilePhotoByPersonId(personId: string) {




    this.pool.on('error', (err: any, client: any) => {
      console.error('Error:', err);
    });

    return this.pool.connect()
      .then((client: any) => {


        let query = `select person, url from tags
    left join images on tags.photo_id = images.photo_id 
    where tags.person = '${personId}' and is_profile`;

        console.log(query);
        return client.query(query).then((res: any) => {
          client.release();


          console.log(res.rows.length)
          if (res.rows.length == 0) {
            return null;
          }
          return res.rows.map(this.mapImage)[0];

        })
          .catch((err: any) => {
            client.release();
            console.error(err);
            return null
          })
      })
      .catch((err: any) => {
        console.error(err);
        return null;
      });
  }


  GetPhotoByPersonId(personId: string) {
    this.pool.on('error', (err: any, client: any) => {
      console.error('Error:', err);
    });

    return this.pool.connect()
      .then((client: any) => {


        let query = `select person, url from tags
left join images on tags.photo_id = images.photo_id 
where tags.person = '${personId}'`;

        console.log(query);
        return client.query(query).then((res: any) => {
          client.release();


          console.log(res.rows.length)
          return res.rows.map(this.mapImage);

        })
          .catch((err: any) => {
            client.release();
            console.error(err);
            return []
          })
      })
      .catch((err: any) => {
        console.error(err);
        return [];
      });
  }

  CheckCredentials(email: string, password: string) {

    return this.pool.connect()
      .then((client: any) => {
        let query = `select credentials.id, nickname, email, password from credentials 
        left join nicknames on nicknames.id = credentials.id
        where email= '${email}' and is_deleted = false`;

        return client.query(query).then((res: any) => {




          if (res.rows.length > 0) {
            const pwd = res.rows[0].password
            client.release();
            return {
              success: bcrypt.compareSync(password, pwd),
              email: res.email,
              profileId: res.id,
              profileName: res.nickname
            };
          }
          else {
            client.release();
            return {
              success: false,
              email: null,
              profileId: null,
              profileName: null
            };
          }
        })
          .catch((err: any) => {
            client.release();
            console.error(err);
            return {
              success: false,
              email: null,
              profileId: null,
              profileName: null
            };
          })
      })
      .catch((err: any) => {
        console.error(err);
        return {
          success: false,
          email: null,
          profileId: null,
          profileName: null
        };
      });

  }

  CreateCredentials(email: string, password: string) {


    email = email.toLowerCase();

    return this.pool.connect()
      .then((client: any) => {

        const hash = bcrypt.hashSync(password, 10);
        let query = `insert into credentials(email, password) values('${email}', '${hash}')`;

        console.log(query);
        return client.query(query).then((res: any) => {
          client.release();

          return ({
            message: "Account created",
            success: true
          })
        })
          .catch((err: any) => {
            client.release();
            return ({
              message: "Account creation failed: email already in use.",
              success: false
            });
          })
      })
      .catch((err: any) => {
        return ({
          message: "Account creation failed: email already in use.",
          success: false
        });
      });
  }

  UpdateCredentials(email: string, password: string, newEmail: string, newPassword: string) {


    email = email.toLowerCase();
    if(newEmail == null || newEmail == ''){
      newEmail =email;
    }
    if(newPassword == null || newPassword == ''){
      newPassword = password;
    }
    newEmail = newEmail.toLowerCase();
    

    return this.pool.connect()
      .then((client: any) => {

        const hash = bcrypt.hashSync(password, 10);
        const newHash = bcrypt.hashSync(newPassword, 10);
        let query = `update credentials set password = '${newHash}', email='${newEmail}' where email= '${email}'`;

        console.log(query);
        return client.query(query).then((res: any) => {
          client.release();

          return ({
            message: "Account updated",
            success: true
          })
        })
          .catch((err: any) => {
            client.release();
            return ({
              message: "Account udate failed",
              success: false
            });
          })
      })
      .catch((err: any) => {
        return ({
          message: "Account update failed",
          success: false
        });
      });
  }

  DeleteCredentials(email: string, password: string) {


    email = email.toLowerCase();

    return this.pool.connect()
      .then((client: any) => {

        const hash = bcrypt.hashSync(password, 10);
        let query = `update credentials set is_deleted = true where email= '${email}'`;

        console.log(query);
        return client.query(query).then((res: any) => {
          client.release();

          return ({
            message: "Account deleted",
            success: true
          })
        })
          .catch((err: any) => {
            client.release();
            return ({
              message: "Account delete failed",
              success: false
            });
          })
      })
      .catch((err: any) => {
        return ({
          message: "Account delete failed",
          success: false
        });
      });
  }

  GetPersonByLogin(email: string) {
    this.pool.on('error', (err: any, client: any) => {
      console.error('Error:', err);
    });

    return this.pool.connect()
      .then((client: any) => {


        let query = `select credentials.id, nickname, email from credentials 
        left join nicknames on nicknames.id = credentials.id
        where email= '${email}' and is_deleted = false`;

        console.log(query);
        return client.query(query).then((res: any) => {
          client.release();

          console.log(JSON.stringify(res.rows))
          if (res.rows.length > 0) {
            console.log(res.rows.length)
            return res.rows.map(this.mapLogin)[0];
          }
          else {
            return null;
          }
        })
          .catch((err: any) => {
            client.release();
            console.error(err);
          })
      })
      .catch((err: any) => {
        console.error(err);
      });
  }

  mapLogin(r: any) {
    return {
      profileId: r.id,
      email: r.email,
      nickname: r.nickname
    }
  }

  mapImage(r: any) {
    return {
      _id: r.person,
      url: r.url
    }
  }

  RemoveProfile(id: string) {
    this.pool.on('error', (err: any, client: any) => {
      console.error('Error:', err);
    });

    return this.pool.connect()
      .then((client: any) => {


        let query = `update profiles set is_deleted = true, profiles.update_date = CURRENT_TIMESTAMP
        where profiles.id in (select profiles.id from profiles 
          left join nicknames on nicknames.id = profiles.id 
          where nicknames.nickname  = '${id}')
        `;




        console.log(query);
        return client.query(query).then((res: any) => {
          console.log(res.rows.length)
          client.release();
          return res.rows;
        })
          .catch((err: any) => {
            client.release();
            console.error(err);
          })
      })
      .catch((err: any) => {
        console.error(err);
      });
  }






  logger: LoggerService;
  pool: Pool;


  constructor() {
    this.logger = new LoggerService('PostgresConnector');
    process.setMaxListeners(0);
    this.pool = new Pool({
      user: process.env.PG_USER,
      host: process.env.PG_HOST,
      database: process.env.PG_DB,
      password: process.env.PG_PASSWORD,
      port: 5432,
    });

  }



  addParentLink(person1: string, person2: string) {
    this.pool.on('error', (err: any, client: any) => {
      console.error('Error:', err);
    });

    return this.pool.connect()
      .then((client: any) => {


        let query = `insert into relations(person1, person2, type) values('${person2}', '${person1}', 'Parent')
        `;


        console.log(query);
        return client.query(query).then((res: any) => {
          console.log(res.rows.length)
          client.release();
          return 'Done';
        })
          .catch((err: any) => {
            client.release();
            console.error(err);
            return '';
          })
      })
      .catch((err: any) => {
        console.error(err);
        return ''
      });
  }

  addSpouseLink(person1: string, person2: string) {
    this.pool.on('error', (err: any, client: any) => {
      console.error('Error:', err);
    });

    return this.pool.connect()
      .then((client: any) => {


        let query = `insert into relations(person1, person2, type) values('${person1 > person2 ? person1 : person2}', '${person1 > person2 ? person2 : person1}', 'Spouse')
        `;


        console.log(query);
        return client.query(query).then((res: any) => {
          console.log(res.rows.length)
          client.release();
          return 'Done';
        })
          .catch((err: any) => {
            client.release();
            console.error(err);
            return '';
          })
      })
      .catch((err: any) => {
        console.error(err);
        return ''
      });
  }


  removeLink(person1: string, person2: string) {
    this.pool.on('error', (err: any, client: any) => {
      console.error('Error:', err);
    });

    return this.pool.connect()
      .then((client: any) => {


        let query = `update relations set is_deleted = true, relations.update_date = CURRENT_TIMESTAMP
        where (relations.person1 = '${person1}' and relations.person2 = '${person2}')
        or (relations.person1 = '${person2}' and relations.person2 = '${person1}')
        `;


        console.log(query);
        return client.query(query).then((res: any) => {
          console.log(res.rows.length)
          client.release();
          return 'Done';
        })
          .catch((err: any) => {
            client.release();
            console.error(err);
            return '';
          })
      })
      .catch((err: any) => {
        console.error(err);
        return ''
      });
  }

  getAllLinks(): Promise<any[]> {

    this.pool.on('error', (err: any, client: any) => {
      console.error('Error:', err);
    });

    return this.pool.connect()
      .then((client: any) => {


        let query = `select person1, person2, type from relations
        `;



        console.log(query);
        return client.query(query).then((res: any) => {
          console.log(res.rows.length)
          client.release();
          return res.rows;
        })
          .catch((err: any) => {
            client.release();
            console.error(err);
          })
      })
      .catch((err: any) => {
        console.error(err);
      });
  }

  getAllProfileIds(): Promise<any[]> {

    this.pool.on('error', (err: any, client: any) => {
      console.error('Error:', err);
    });

    return this.pool.connect()
      .then((client: any) => {


        let query = `select id, first_name, last_name from profiles
        `;



        console.log(query);
        return client.query(query).then((res: any) => {
          console.log(res.rows.length)
          client.release();
          return res.rows;
        })
          .catch((err: any) => {
            client.release();
            console.error(err);
          })
      })
      .catch((err: any) => {
        console.error(err);
      });
  }

  getAuditEntries(number: number): Promise<any[]> {

    this.pool.on('error', (err: any, client: any) => {
      console.error('Error:', err);
    });

    return this.pool.connect()
      .then((client: any) => {


        let query = `select * from audit fetch first ${number} rows only
        `;



        console.log(query);
        return client.query(query).then((res: any) => {
          console.log(res.rows.length)
          client.release();
          return res.rows;
        })
          .catch((err: any) => {
            client.release();
            console.error(err);
          })
      })
      .catch((err: any) => {
        console.error(err);
      });
  }

  async getIdFromProfile(id: string) {
    let query = `select id from nicknames 
    where id = '${id}' or nickname = '${id}'`;

    const data = await this.ExecuteQuery(query, (x: any) => x.id);
    if (data.length > 0)
      return data[0]
    return id;

  }

  GetPersons(ids: string[]) {

    if (ids == undefined) {
      return [];
    }
    let idList = ids.join("','")
    let query = `select  profiles.*, nickname as profile_id, event_b.year as year_of_birth, event_d.year as year_of_death, event_d.is_dead, images.url as profile_picture
    from profiles
    left join nicknames on  profiles.id = nicknames.id and nicknames .is_active  = true
    left join events event_b on event_b.person1 = profiles.id and event_b.type = 'Birth'
    left join events event_d on event_d.person1 = profiles.id and event_d.type = 'Death'
    left join tags on tags.person = profiles.id and tags.is_profile  = true 
    left join images on tags.photo_id  = images.photo_id
    where profiles.id in ('${idList}') and profiles.is_deleted = false
    `;

    return this.ExecuteQuery(query, PersonController.mappingFromDb)

  }



  ExecuteQuery(query: string, mapper: any): Promise<any[]> {
    this.pool.on('error', (err: any, client: any) => {
      console.error('Error:', err);
    });

    return this.pool.connect()
      .then((client: any) => {


        return client.query(query).then((res: any) => {

          client.release();
          return res.rows.map(mapper);
        })
          .catch((err: any) => {
            client.release();
            console.error(err);
          })
      })
      .catch((err: any) => {
        console.error(err);
      });
  }

  GetParentIds(ids: string[]): any[] | Promise<any[]> {
    let idList = ids.join("','");
    let query = `select relations.person1 from relations
        where person2 in( '${idList}')
        and is_deleted = false
        and type = 'Parent'
        `;
    let mapper = (x: any) => x.person1;
    return this.ExecuteQuery(query, mapper);
  }

  GetChildrenIds(ids: string[]): any[] | Promise<any[]> {
    let idList = ids.join("','");
    let query = `select relations.person2 from relations
        where person1 in ( '${idList}')
        and is_deleted = false
        and type = 'Parent'
        `;
    let mapper = (x: any) => x.person2;
    return this.ExecuteQuery(query, mapper);
  }

  GetSpouseIds(id: string): any[] | Promise<any[]> {
    let query = `select relations.person1, relations.person2 from relations
        where (person1 = '${id}' or person2 = '${id}')
        and is_deleted = false
        and type = 'Spouse'
        `;
    let mapper = (x: any) => x.person1 == id ? x.person2 : x.person1;
    return this.ExecuteQuery(query, mapper);
  }

  GetPhotos(id: string): any[] | Promise<any[]> {
    let query = `select images.photo_id, url from images
    left join tags on tags.photo_id  = images .photo_id 
    
    where person = '${id}'
        `;


    return this.ExecuteQuery(query, this.photoMapper);
  }

  photoMapper(row: any) {

    return {
      _id: row.photo_id,
      url: row.url,
    };
  }

  GetPersonList(filter: string = '', page: number = 1, pageSize: number = 20, type: string= 'all'): Promise<any[]> {

    this.pool.on('error', (err: any, client: any) => {
      console.error('Error:', err);
    });

    return this.pool.connect()
      .then((client: any) => {


        let query = `select  profiles.*, nickname as profile_id, event_b.year as year_of_birth, event_d.year as year_of_death, event_d.is_dead, images.url as profile_picture
        from profiles
        left join nicknames on  profiles.id = nicknames.id and nicknames .is_active  = true
        left join events event_b on event_b.person1 = profiles.id and event_b.type = 'Birth'
        left join events event_d on event_d.person1 = profiles.id and event_d.type = 'Death'
        left join tags on tags.person = profiles.id and tags.is_profile  = true 
        left join images on tags.photo_id  = images.photo_id

        where profiles.is_deleted <> true
        `;

        if (filter != '' && type == 'all') {
          query = query + ` and LOWER(profiles.first_name || profiles.last_name  || profiles.maiden_name || profiles.first_name || profiles.last_name  || profiles.maiden_name)  
          like '%${filter.toLowerCase().replace(' ', '%')}%'
          limit ${pageSize} offset ${(page - 1) * pageSize}
          `;
        }

        if (filter != '' && type == 'startWith') {
          query = query + ` and (LOWER(profiles.first_name) like '${filter.toLowerCase().replace(' ', '%')}%' OR
          LOWER(profiles.maiden_name) like '${filter.toLowerCase().replace(' ', '%')}%' OR
          LOWER(profiles.last_name) like '${filter.toLowerCase().replace(' ', '%')}%')
          limit ${pageSize} offset ${(page - 1) * pageSize}
          `;
        }



        console.log(query);
        return client.query(query).then((res: any) => {
          console.log(res.rows.length)
          client.release();
          return res.rows;
        })
          .catch((err: any) => {
            client.release();
            console.error(err);
          })
      })
      .catch((err: any) => {
        console.error(err);
      });
  }

  GetEvents(date: Date): Promise<any[]> {

    this.pool.on('error', (err: any, client: any) => {
      console.error('Error:', err);
    });

    return this.pool.connect()
      .then((client: any) => {


        let query = `select type, year, month, day, profiles.first_name,profiles.last_name, profiles.id from events 
        join profiles on profiles.id = events.person1 or profiles.id = events.person2
        where day = ${date.getDate()} and month = ${date.getMonth() + 1} and profiles.is_deleted = false
        `;

        console.log(query);
        return client.query(query).then((res: any) => {
          console.log(res.rows.length)
          client.release();
          return res.rows;
        })
          .catch((err: any) => {
            client.release();
            console.error(err);
          })
      })
      .catch((err: any) => {
        console.error(err);
      });
  }


  InitDatabase2(data: any[]) {



    const pool = new Pool({
      user: process.env.PG_USER,
      host: '192.168.0.18',
      database: 'res01',
      password: '',
      port: 5432,
    });

    pool.on('error', (err: any, client: any) => {
      console.error('Error:', err);
    });

    pool.connect()
      .then((client: any) => {

        for (let i = 0; i < data.length; i++) {
          const query = `INSERT INTO public.relations ("person1", "person2", "type") 
          VALUES('${data[i].person1_id.toString()}', '${data[i].person2_id.toString()}', '${data[i].type}') on conflict do nothing;
          `
          // const query = `update profiles set gender = '${data[i].gender}', maiden_name = '${data[i].maide'nName}' where id =  '${data[i]._id.toString()}';`;
          console.log(query);

          client.query(query).then((res: any) => {
            console.log('Table is successfully created');
          })
            .catch((err: any) => {
              console.error(err);
            })

        }
      })
      .catch((err: any) => {
        console.error(err);
      });



    console.log('done');



  }
}