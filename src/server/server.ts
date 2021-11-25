import Fastify, { FastifyInstance } from "fastify";
import routes from "./routes";
import { createPackageGraph } from "./parser";
import { readFileFromPathToString, readUrlContentToString } from "./io";
import { statusFileExampleUrl, statusFilePath, port } from "./conf";

const server: FastifyInstance = Fastify({ logger: true });
server.register(routes);

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

export const startServer = async () => {
  try {
    await onStart();
    await server.listen(port);
  } catch (error) {
    server.log.error("Following error happened file starting server:");
    server.log.error(error);
    process.exit(1);
  }
};
