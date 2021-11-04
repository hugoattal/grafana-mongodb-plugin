import { FastifyInstance } from "fastify";
import * as Database from "./database";
import createHttpError from "http-errors";

type TBody = {
    database: string;
    query: {
        refId: string
        collection: string;
        interval: string;
    },
    time: {
        from: number,
        to: number
    }
}

export async function register(server: FastifyInstance): Promise<void> {
    server.post<{ Body: TBody }>(
        "/datasource",
        async (request, reply) => {

            const from = new Date(request.body.time.from).getTime();
            const to = new Date(request.body.time.to).getTime();

            const interval = getIntervalInMs(request.body.query.interval);
            const bucketCount = (to - from) / interval;

            if ((interval === 0) || bucketCount > 1000) {
                throw new createHttpError.BadRequest("Too much buckets");
            }

            const boundaries = generateBucketBoundaries(from, to, interval);

            const result = await Database.mongo.db(request.body.database).collection(request.body.query.collection).aggregate([{
                $project: {
                    time: {
                        $toLong: { $toDate: "$_id" }
                    }
                }
            }, {
                $bucket: {
                    groupBy: "$time",
                    boundaries: boundaries,
                    default: "Other"
                }
            }, {
                $match: {
                    _id: { $ne: "Other" }
                }
            }]).toArray();

            const response = fillMissingBuckets(result as Array<{ _id: number, count: number }>, boundaries);

            reply.send(response);
        });
}

function getIntervalInMs(interval: string) {
    if (interval.endsWith("s")) {
        return parseInt(interval) * 1000;
    }
    if (interval.endsWith("m")) {
        return parseInt(interval) * 1000 * 60;
    }
    if (interval.endsWith("h")) {
        return parseInt(interval) * 1000 * 60 * 60;
    }
    if (interval.endsWith("d")) {
        return parseInt(interval) * 1000 * 60 * 60 * 24;
    }

    return parseInt(interval);
}

function generateBucketBoundaries(from: number, to: number, interval: number) {
    let cursor = from;
    const boundaries = [];

    while (cursor < to) {
        boundaries.push(cursor);
        cursor += interval;
    }

    boundaries.push(to);

    return boundaries;
}

function fillMissingBuckets(buckets: Array<{ _id: number, count: number }>, boundaries: Array<number>) {
    const result = {} as Record<number, { time: Date, value: number }>;

    boundaries.pop();

    for (const boundary of boundaries) {
        result[boundary] = {
            time: new Date(boundary),
            value: 0
        };
    }

    for (const bucket of buckets) {
        result[bucket._id] = {
            time: new Date(bucket._id),
            value: bucket.count
        };
    }

    return Object.values(result);
}
