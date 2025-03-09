import postgresql from 'pg';

const { Pool } = postgresql;

let pool;

const createDatabaseConnection = (callback = null) => {
  if (!pool) {
    pool = new Pool({
        ssl: {
            rejectUnauthorized: false  // This disables SSL certificate validation
        },
        connectionString: `postgresql://${process.env.DBUSER}:${process.env.DBPASSWORD}@${process.env.DBHOST}/${process.env.DBDATABASE}?sslmode=require`
    });
  }


    const connection = {
        pool,
        query: async (...args) => {
          const client = await pool.connect();
          try {
            const res = await client.query(...args);
            return res;
          } catch (err) {
            console.error('Query error', err);
            throw err;
          } finally {
            client.release();
          }
        },
    };

    if (callback) {
        callback(connection);
    }

    return connection;
};

export default createDatabaseConnection;