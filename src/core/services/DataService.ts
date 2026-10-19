import type { Environment } from '../orm/environment';

export interface DataService {
  /**
   * Load data from a list of files.
   */
  loadData(env: Environment, files: string[]): Promise<void>;
}

export class DataServiceImpl implements DataService {
  async loadData(env: Environment, files: string[]): Promise<void> {
    for (const file of files) {
      console.log(`[DataService] Loading data from ${file}...`);
      // Implementation for CSV/XML loading would go here.
      // It would read the file from the filesystem and use env.adapter to insert records.
    }
  }
}
