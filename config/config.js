require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT || 'mysql',
    logging:false,
      dialectOptions: {
    connectTimeout: 60000, // 60s
  },
    pool: {
      max: 5, // maximum number of connections in pool
      min: 0, // minimum number of connections in pool
      acquire: 30000, // maximum time, in milliseconds, that pool will try to get a connection before throwing an error
      idle: 10000, // maximum time, in milliseconds, that a connection can be idle before being released
    }
  },
  test: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE_TEST,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT || 'mysql',
    pool: {
      max: 5, // maximum number of connections in pool
      min: 0, // minimum number of connections in pool
      acquire: 30000, // maximum time, in milliseconds, that pool will try to get a connection before throwing an error
      idle: 10000, // maximum time, in milliseconds, that a connection can be idle before being released
    }
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT || 'mysql',
    pool: {
      max: 10, // Higher limit for production, depending on your usage
      min: 0,
      acquire: 30000,
      idle: 10000,
    }
  },
};


