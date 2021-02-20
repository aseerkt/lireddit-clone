module.exports = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'lireddit',
  username: 'postgres',
  password: 'postgres',
  synchronize: true,
  logging: true,
  entities: ['dist/entities/**/*.js'],
  migrations: ['dist/migrations/**/*.js'],
  subscribers: ['dist/subscribers/**/*.js'],
  cli: {
    entitiesDir: 'src/entities',
    migrationsDir: 'src/migration',
    subscribersDir: 'src/subscriber',
  },
};
