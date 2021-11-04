import { DataQuery, DataSourceJsonData } from "@grafana/data";

export interface MyQuery extends DataQuery {
    collection: string;
    interval: string;
}

export const defaultQuery: Partial<MyQuery> = {
    interval: "1h",
    collection: "default"
};

/**
 * These are options configured for each DataSource instance
 */
export interface MyDataSourceOptions extends DataSourceJsonData {
    serverUrl: string;
    apiKey: string;
    database: string;
}
