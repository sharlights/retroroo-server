import { DataSource } from 'typeorm';
import { loadDatabaseConfig } from './core/db/database.config';

export const AppDataSource = new DataSource(loadDatabaseConfig());
