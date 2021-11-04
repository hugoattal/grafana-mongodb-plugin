import * as Fastify from "fastify";
import { config } from "dotenv";
import * as Database from "./database";
import { register as PingHandler } from "@/ping";
import { register as DatasourceHandler } from "@/datasource";
import fastifyCors from "fastify-cors";
import middiePlugin from "middie";
import createHttpError from "http-errors";

config();

async function init() {
    const isDevelopment = (process.env.NODE_ENV === "development");
    const server: Fastify.FastifyInstance = Fastify.fastify({ logger: isDevelopment });

    server.register(middiePlugin);
    server.register(fastifyCors, {origin: process.env.CORS_ORIGIN});

    server.addHook("onRequest", (request, _response, next) => {
        if (request.headers.authorization !== process.env.API_KEY) {
            throw new createHttpError.Forbidden("Bad API Key");
        }
        next();
    });

    server.addHook("onReady", async () => {
        await Database.connect();
    })

    server.addHook("onClose", async () => {
        await Database.close();
    })

    server.register(PingHandler);
    server.register(DatasourceHandler);

    return server;
}

init().then((server) => {
    server.listen(Number(process.env.BACKEND_PORT), async (error: Error) => {
        server.ready(() => {
            console.log(server.printRoutes());
        });

        if (error) {
            server.log.error({ error });
            process.exit(1);
        }
    });
});
