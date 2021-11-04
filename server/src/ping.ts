import { FastifyInstance } from "fastify";
import * as Database from "./database";
import createHttpError from "http-errors";

export async function register(server: FastifyInstance): Promise<void> {
    server.get<{ Querystring: {database: string}}>(
        "/ping",
        async (request, reply) => {

            try {
                await Database.mongo.db(request.query.database).command({ ping: 1 });
            }
            catch(e){
                throw new createHttpError.InternalServerError("Server is not responding")
            }

            reply.send({
                message: "Success",
                success: true
            });
        });
}
