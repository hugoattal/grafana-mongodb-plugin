import { FastifyInstance } from "fastify";
import * as Database from "./database";
import createHttpError from "http-errors";

export async function register(server: FastifyInstance): Promise<void> {
    server.get(
        "/ping",
        async (_request, reply) => {

            try {
                await Database.mongo.db("lunapark").command({ ping: 1 });
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
