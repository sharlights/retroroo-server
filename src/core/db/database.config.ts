import * as dotenv from 'dotenv';
import { DataSourceOptions } from 'typeorm';

export function loadDatabaseConfig(env = process.env.NODE_ENV || 'dev'): DataSourceOptions {
  dotenv.config({ path: `.env.${env}` });

  return {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: process.env.DB_SYNC === 'true',
    autoLoadEntities: true,
  } as DataSourceOptions;
}
