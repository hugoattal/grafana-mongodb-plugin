import * as Fastify from "fastify";

async function init() {
    const isDevelopment = (process.env.NODE_ENV === "development");
    const server: Fastify.FastifyInstance = Fastify.fastify({ logger: isDevelopment });

    return server;
}

init().then((server) => {
    server.listen(Number(process.env.BACKEND_PORT), (error: Error) => {
        server.ready(() => {
            console.log(server.printRoutes());
        });

        if (error) {
            server.log.error({ error });
            process.exit(1);
        }
    });
});
