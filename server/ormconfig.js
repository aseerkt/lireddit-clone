module.exports = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'lireddit',
  username: 'postgres',
  password: 'postgres',
  synchronize: true,
  logging: true,
  entities: ['src/entities/**/*.js'],
  migrations: ['src/migrations/**/*.js'],
  subscribers: ['src/subscribers/**/*.js'],
  cli: {
    entitiesDir: 'src/entities',
    migrationsDir: 'src/migration',
    subscribersDir: 'src/subscriber',
  },
};
