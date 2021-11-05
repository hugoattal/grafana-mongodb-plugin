import { FastifyInstance } from 'fastify';
import createHttpError from 'http-errors';
import * as Database from './database';

type TBody = {
  database: string;
  query: {
    collection: string;
    interval: string;
    refId: string;
    type: 'time' | 'table';
    fields: Array<string>;
  };
  time: {
    from: number;
    to: number;
  };
};

export async function register(server: FastifyInstance): Promise<void> {
  server.post<{ Body: TBody }>('/datasource', async (request, reply) => {
    const from = new Date(request.body.time.from).getTime();
    const to = new Date(request.body.time.to).getTime();

    let response = {};

    switch (request.body.query.type) {
      case 'time':
        response = await getTimeSeries(from, to, request.body.query, request.body.database);
        break;

      case 'table':
        response = await getTable(from, to, request.body.query, request.body.database);
        break;
    }

    reply.send(response);
  });
}

async function getTimeSeries(
  from: number,
  to: number,
  query: { interval: string; collection: string },
  database: string
) {
  const interval = getIntervalInMs(query.interval);
  const bucketCount = (to - from) / interval;

  if (interval === 0 || bucketCount > 1000) {
    throw new createHttpError.BadRequest('Too much buckets');
  }

  const boundaries = generateBucketBoundaries(from, to, interval);

  const result = await Database.mongo
    .db(database)
    .collection(query.collection)
    .aggregate([
      {
        $project: {
          time: {
            $toLong: { $toDate: '$_id' },
          },
        },
      },
      {
        $bucket: {
          boundaries: boundaries,
          default: 'Other',
          groupBy: '$time',
        },
      },
      {
        $match: {
          _id: { $ne: 'Other' },
        },
      },
    ])
    .toArray();

  return fillMissingBuckets(result as Array<{ _id: number; count: number }>, boundaries);
}

async function getTable(
  from: number,
  to: number,
  query: { fields: Array<string>; collection: string },
  database: string
) {
  const project = {} as Record<string, number>;

  for (const field of query.fields) {
    project[field] = 1;
  }

  const result = await Database.mongo
    .db(database)
    .collection(query.collection)
    .aggregate([
      {
        $project: {
          ...project,
          time: {
            $toLong: { $toDate: '$_id' },
          },
        },
      },
      {
        $match: {
          time: {
            $gt: from,
            $lt: to,
          },
        },
      },
    ])
    .toArray();

  return result;
}

function getIntervalInMs(interval: string) {
  if (interval.endsWith('s')) {
    return parseInt(interval) * 1000;
  }
  if (interval.endsWith('m')) {
    return parseInt(interval) * 1000 * 60;
  }
  if (interval.endsWith('h')) {
    return parseInt(interval) * 1000 * 60 * 60;
  }
  if (interval.endsWith('d')) {
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

function fillMissingBuckets(buckets: Array<{ _id: number; count: number }>, boundaries: Array<number>) {
  const result = {} as Record<number, { time: number; value: number }>;

  boundaries.pop();

  for (const boundary of boundaries) {
    result[boundary] = {
      time: boundary,
      value: 0,
    };
  }

  for (const bucket of buckets) {
    result[bucket._id] = {
      time: bucket._id,
      value: bucket.count,
    };
  }

  return Object.values(result);
}
