//const { Pool } = require('pg');
import postgresql from 'pg';

const { Pool } = postgresql;


export default (callback = null) => {
    const pool = new Pool({
       /* host: process.env.DBHOST,
        user: process.env.DBUSER,
        port: process.env.DBPORT,
        password: process.env.DBPASSWORD,
        database: process.env.DBDATABASE,
        ssl: true*/
        connectionString: `postgresql://${process.env.DBUSER}:${process.env.DBPASSWORD}@${process.env.DBHOST}/${process.env.DBDATABASE}?sslmode=require`
    })

    const connection = {
        pool,
        query: (...args) => {
          return pool.connect().then((client) => {
            return client.query(...args).then((res) => {
              client.release();
              return res;
            });
          });
        },
      };
    
      process.postgresql = connection;
    
      if (callback) {
        callback(connection);
      }
    
      return connection;

    /*client.query(`Select * FROM Test`, (error, res)=> {
        if(!error){
            console.log(res.rows);
        } else {
            console.log(error.message);
        }
        client.end;
    }) */

    //module.exports = pool
};