import { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface MyQuery extends DataQuery {
  collection: string;
  interval: string;
  type: string;
  fields: Array<string>;
}

export const defaultQuery: Partial<MyQuery> = {
  interval: '1h',
  collection: 'default',
  type: 'time',
};

/**
 * These are options configured for each DataSource instance
 */
export interface MyDataSourceOptions extends DataSourceJsonData {
  serverUrl: string;
  apiKey: string;
  database: string;
}
