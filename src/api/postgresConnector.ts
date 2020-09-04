import dotenv from 'dotenv';
import { Pool } from 'pg';
import LoggerService from '../services/logger_service';
import PersonController from './personController';

dotenv.config();
const bcrypt = require('bcryptjs');

export class PostgresConnector {
  CreateCredentials(id: string, login: string, email: string, password: string) {


    login = login.toLowerCase();
  
    return this.pool.connect()
    .then((client: any) => {

      const hash = bcrypt.hashSync(password, 10);
      let query = `insert into credentials(login, password, id) values('${login}', '${hash}', '${id}')`;

      console.log(query);
      return client.query(query).then((res: any) => {
        client.release();

        return "Account created"
      })
        .catch((err: any) => {
          client.release();
          return "Account creation failed"
          console.error(err);
        })
    })
    .catch((err: any) => {
      console.error(err);
      return "Account creation failed"
    });
  }

  GetPersonByLogin(login: string) {
    this.pool.on('error', (err: any, client: any) => {
      console.error('Error:', err);
    });

    return this.pool.connect()
      .then((client: any) => {


        let query = `select id, login from credentials where login= '${login}'`;

        console.log(query);
        return client.query(query).then((res: any) => {
          client.release();

          console.log(JSON.stringify(res.rows))
          if(res.rows.length>0){
            console.log(res.rows.length)
            return res.rows.map(this.mapLogin)[0];
          }
          else{
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

  mapLogin(r:any){
    return {
      id: r.id,
      login: r.login
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

    const data = await this.ExecuteQuery(query, (x:any)=>x.id);
    if(data.length  > 0 )
      return data[0]
    return id;

  }

  GetPersons(ids: string[]) {

    if(ids == undefined){
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
    let idList= ids.join("','");
    let query = `select relations.person1 from relations
        where person2 in( '${idList}')
        and type = 'Parent'
        `;
    let mapper = (x:any) =>x.person1;
    return this.ExecuteQuery(query, mapper);
  }

  GetChildrenIds(ids: string[]): any[] | Promise<any[]> {
    let idList= ids.join("','");
    let query = `select relations.person2 from relations
        where person1 in ( '${idList}')
        and type = 'Parent'
        `;
    let mapper = (x:any) =>x.person2;
    return this.ExecuteQuery(query, mapper);
  }

  GetSpouseIds(id: string): any[] | Promise<any[]> {
    let query = `select relations.person1, relations.person2 from relations
        where (person1 = '${id}' or person2 = '${id}')
        and type = 'Spouse'
        `;
    let mapper = (x:any) => x.person1 == id ? x.person2 : x.person1;
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

  GetPersonList(filter: string = '', page: number = 1, pageSize: number = 20): Promise<any[]> {

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

        where profiles.is_deleted = false
        `;

        if(filter!= ''){
          query = query + ` and LOWER(profiles.first_name || profiles.last_name  || profiles.maiden_name || profiles.first_name || profiles.last_name  || profiles.maiden_name)  
          like '%${filter.toLowerCase().replace(' ', '%')}%'
          limit ${pageSize} offset ${(page -1) * pageSize}
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
          VALUES('${data[i].person1_id.toString()}', '${data[i].person2_id.toString()}', '${data[i].type }') on conflict do nothing;
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