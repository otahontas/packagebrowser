import { RouteShorthandOptions } from "fastify";
import fp from "fastify-plugin";
import _ from "lodash";
import { graph } from "./parser";
import type { Package } from "./parser";

declare module "fastify" {}

const baseApiUrl = "/api/packages";
const defaultPageSize = 25;

const allPackagesRouteOpts: RouteShorthandOptions = {
  schema: {
    response: {
      200: {
        type: "object",
        required: ["packages", "cursors"],
        properties: {
          packages: {
            type: "array",
            items: {
              type: "string",
            },
          },
          cursors: {
            type: "object",
            required: [],
            properties: {
              after: { type: "string", nullable: true },
              before: { type: "string", nullable: true },
            },
          },
        },
      },
    },
  },
};

const singlePackageRouteOps: RouteShorthandOptions = {
  schema: {
    response: {
      200: {
        type: "object",
        required: ["name", "description", "dependencies", "reverseDependencies"],
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          dependencies: {
            type: "array",
            items: {
              type: "string",
            },
          },
          reverseDependencies: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },
      },
    },
  },
};

interface AllPackagesQuery {
  size?: string;
  before?: string;
  after?: string;
}

interface Cursors {
  after?: string;
  before?: string;
}

interface PaginatedReplyProps {
  sizeFromReq: number;
  nodes: Array<Package["name"]>;
  before?: string;
  after?: string;
}

const getNodesToPaginate = ({ before, after, nodes }: Omit<PaginatedReplyProps, "sizeFromReq">) => {
  if (before) return _.dropRightWhile(nodes, node => node >= before);
  if (after) return _.dropWhile(nodes, node => node <= after);
  return nodes;
};

const createPaginatedReply = ({ sizeFromReq, before, after, nodes }: PaginatedReplyProps) => {
  const cursors: Cursors = {
    after: undefined,
    before: undefined,
  };

  const nodesToPaginate = getNodesToPaginate({ before, after, nodes });
  const pageSize = sizeFromReq > nodesToPaginate.length ? nodesToPaginate.length : sizeFromReq;
  const paginated = before ? _.takeRight(nodesToPaginate, pageSize) : _.take(nodesToPaginate, pageSize);

  const first = paginated[0];
  const last = paginated[paginated.length - 1];
  const originalIndexOfFirst = _.sortedIndexOf(nodes, first);
  const originalIndexOfLast = _.sortedIndexOf(nodes, last);
  if (originalIndexOfFirst > 0) cursors.before = first;
  if (originalIndexOfLast < nodes.length - 1) cursors.after = last;
  return { paginated, cursors };
};

export default fp(async fastify => {
  fastify.get<{ Querystring: AllPackagesQuery }>(baseApiUrl, allPackagesRouteOpts, async (request, reply) => {
    const { size, before: encodedBefore, after: encodedAfter } = request.query;

    const before = encodedBefore && decodeURIComponent(encodedBefore);
    const after = encodedAfter && decodeURIComponent(encodedAfter);

    if (before && after) reply.code(400).send({ error: "Using before and after at the same time is not allowed." });
    if (before && !graph.nodes.has(before)) reply.code(400).send({ error: `Bad cursor: ${before}` });
    if (after && !graph.nodes.has(after)) reply.code(400).send({ error: `Bad cursor: ${after}` });

    const nodes = _.sortBy([...graph.nodes.keys()]);

    const sizeFromReq = size ? parseInt(size, 10) : defaultPageSize;
    if (sizeFromReq < 1) reply.code(400).send({ error: `Page size should be at least 1.` });

    const { paginated, cursors } = createPaginatedReply({ sizeFromReq, before, after, nodes });

    return { packages: paginated, cursors };
  });

  fastify.get<{ Params: { name: string } }>(`${baseApiUrl}:name`, singlePackageRouteOps, async (request, reply) => {
    const { name } = request.params;

    const node = graph.nodes.get(name);
    const edges = graph.edges.get(name);

    if (!node) {
      reply.callNotFound();
    } else {
      reply.send({
        ...node,
        dependencies: edges.filter(edge => ["normal", "alternative"].includes(edge.type)),
        reverseDependencies: edges.filter(edge => ["reversed", "reversed-alternative"].includes(edge.type)),
      });
    }
  });
}, "3.X");
