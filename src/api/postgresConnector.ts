import dotenv from 'dotenv';
import LoggerService from '../services/logger_service';

import fs from 'fs';
import { Console } from 'console';
import { Pool } from 'pg';

dotenv.config();

export class PostgresConnector {

  logger: LoggerService;
  pool: Pool;


  constructor() {
    this.logger = new LoggerService('PostgresConnector');
    this.pool = new Pool({
      user: process.env.PG_USER,
      host: process.env.PG_HOST,
      database: process.env.PG_DB,
      password: process.env.PG_PASSWORD,
      port: 5432,
    });

  }

  GetPersonList(filter: string = '', page: number = 1, pageSize: number = 20): Promise<any[]> {

    this.pool.on('error', (err: any, client: any) => {
      console.error('Error:', err);
    });

    return this.pool.connect()
      .then((client: any) => {


        let query = `select  profiles.*, nickname as profile_id, event_b.year as year_of_birth, event_d.year as year_of_death, event_d.is_dead from profiles
        left join nicknames on  profiles.id = nicknames.id and nicknames .is_active  = true
        left join events event_b on event_b.person1 = profiles.id and event_b.type = 'Birth'
        left join events event_d on event_d.person1 = profiles.id and event_d.type = 'Death'`;

        if(filter!= ''){
          query = query + ` where LOWER(profiles.first_name || profiles.last_name  || profiles.maiden_name || profiles.first_name || profiles.last_name  || profiles.maiden_name)  
          like '%${filter.toLowerCase().replace(' ', '%')}%'
          limit ${pageSize} offset ${(page -1) * pageSize}
          `;
        }



        console.log(query);
        return client.query(query).then((res: any) => {
          console.log(res.rows.length)
          return res.rows;
        })
          .catch((err: any) => {
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
          const query = `INSERT INTO public.events ("type", "day", "month", "year",  person1, is_dead) 
          VALUES('Death', ${data[i].dayOfDeath ?? 0}, ${data[i].monthOfDeath ?? 0}, ${data[i].yearOfDeath ?? 0}, '${data[i]._id}', '${data[i].isDead}') on conflict do nothing;
          `
          // const query = `update profiles set gender = '${data[i].gender}', maiden_name = '${data[i].maidenName}' where id =  '${data[i]._id.toString()}';`;
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