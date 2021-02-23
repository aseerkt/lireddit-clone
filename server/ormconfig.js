const __dev__ = process.env.NODE_ENV !== 'production';

module.exports = {
  name: 'default',
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'lireddit',
  username: 'postgres',
  password: 'postgres',
  synchronize: __dev__,
  logging: __dev__,
  entities: ['dist/entities/**/*.js'],
  migrations: ['dist/migrations/**/*.js'],
  subscribers: ['dist/subscribers/**/*.js'],
  cli: {
    entitiesDir: 'src/entities',
    migrationsDir: 'src/migration',
    subscribersDir: 'src/subscriber',
  },
  seeds: ['dist/seeds/**/*.js'],
};
