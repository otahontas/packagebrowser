import Fastify, { FastifyInstance } from "fastify";
import fastifyStatic from "fastify-static";
import path from "path";
import routes from "./routes";
import { createPackageGraph } from "./parser";
import { readFileFromPathToString, readUrlContentToString } from "./io";
import { statusFileExampleUrl, statusFilePath, port, inProduction, address } from "./conf";

const server: FastifyInstance = Fastify({ logger: true });
server.register(routes);

if (inProduction) {
  server.register(fastifyStatic, {
    root: path.join(__dirname, "public"),
    wildcard: false,
  });

  server.get("*", (_, reply) => {
    reply.sendFile("index.html");
  });
}

const onStart = async () => {
  server.log.info("Reading package file...");
  let packagesAsString;

  try {
    packagesAsString = await readFileFromPathToString(statusFilePath);
  } catch (error) {
    server.log.error("Couldn't read package file from default location, falling back to example file from Github");

    try {
      packagesAsString = await readUrlContentToString(statusFileExampleUrl);
    } catch (error) {
      server.log.error("Couldn't read example file from Github");
      throw error;
    }
  }

  server.log.info("Creating graph from package file...");
  createPackageGraph(packagesAsString);
  server.log.info("Graph succesfully created!");
};

const closeGracefully = async () => {
  server.log.info("Shutting down server...");
  await server.close();
  process.exit();
};
process.on("SIGINT", closeGracefully);

export const startServer = async () => {
  try {
    await onStart();
    await server.listen(port, address);
  } catch (error) {
    server.log.error("Following error happened file starting server:");
    server.log.error(error);
    process.exit(1);
  }
};
