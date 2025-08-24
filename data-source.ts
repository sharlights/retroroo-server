import { DataSource } from 'typeorm';
import { loadDatabaseConfig } from './src/core/db/database.config';

const base = loadDatabaseConfig();

export const AppDataSource = new DataSource({
  ...base,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  migrationsTableName: 'migrations',
});
