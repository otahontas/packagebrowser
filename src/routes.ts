import { RouteShorthandOptions } from "fastify";
import fp from "fastify-plugin";
import { graph } from "./parser";

declare module "fastify" {}

const allPackagesRouteOpts: RouteShorthandOptions = {
  schema: {
    response: {
      200: {
        type: "array",
      },
    },
  },
};

const singlePackageRouteOps: RouteShorthandOptions = {
  schema: {
    response: {
      200: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          dependencies: {
            type: "array",
          },
          reverseDependencies: {
            type: "array",
          },
        },
      },
    },
  },
};

export default fp(async fastify => {
  fastify.get("/api/packages", allPackagesRouteOpts, async () => [...graph.nodes.keys()]);

  fastify.get<{ Params: { name: string } }>("/api/packages/:name", singlePackageRouteOps, async (request, reply) => {
    const { name } = request.params;

    const node = graph.nodes.get(name);
    const edges = graph.edges.get(name);

    if (!node) {
      reply.callNotFound();
    } else {
      reply.send({
        name: node.name,
        description: node.description,
        dependencies: edges.filter(edge => ["normal", "alternative"].includes(edge.type)),
        reverseDependencies: edges.filter(edge => ["reversed", "reversed-alternative"].includes(edge.type)),
      });
    }
  });
}, "3.X");
