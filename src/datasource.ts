import defaults from "lodash/defaults";

import {
    DataQueryRequest,
    DataQueryResponse,
    DataSourceApi,
    DataSourceInstanceSettings,
    MutableDataFrame,
    FieldType
} from "@grafana/data";

import { MyQuery, MyDataSourceOptions, defaultQuery } from "./types";
import axios from "axios";

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
    serverUrl: string;
    apiKey: string;
    database: string;

    constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
        super(instanceSettings);

        this.serverUrl = instanceSettings.jsonData.serverUrl;
        this.apiKey = instanceSettings.jsonData.apiKey;
        this.database = instanceSettings.jsonData.database;
    }

    async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
        const { range } = options;
        const from = range!.from.valueOf();
        const to = range!.to.valueOf();

        // Return a constant for each query.
        const data = await Promise.all(options.targets.map(async (target) => {
            const query = defaults(target, defaultQuery);

            const request = await axios.post(this.serverUrl + "/datasource", {
                database: this.database,
                query,
                time: {
                    from,
                    to
                }
            }, {
                headers: {
                    Authorization: this.apiKey
                }
            });

            const response = request.data as Array<{ time: Date, value: number }>;



            return new MutableDataFrame({
                refId: query.refId,
                fields: [
                    { name: "Time", values: response.map(bucket => bucket.time), type: FieldType.time },
                    { name: "Value", values: response.map(bucket => bucket.value), type: FieldType.number }
                ]
            });
        }));

        return { data };
    }

    async testDatasource() {

        await axios.get(this.serverUrl + "/ping?database=" + this.database, {
            headers: {
                Authorization: this.apiKey
            }
        });

        return {
            status: "success",
            message: "Success"
        };
    }
}
