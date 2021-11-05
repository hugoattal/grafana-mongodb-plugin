import { MongoClient } from 'mongodb';
import { config } from 'dotenv';

config();
export const mongo = new MongoClient(process.env.DB_URI as string);

export async function connect() {
  await mongo.connect();
}

export async function close() {
  await mongo.close();
}
