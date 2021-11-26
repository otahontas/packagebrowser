import { RouteShorthandOptions } from "fastify";
import fp from "fastify-plugin";
import _ from "lodash";
import { Static, Type } from "@sinclair/typebox";
import { graph } from "./parser";
import { edgeTypes } from "./parser";
export { edgeTypes as dependencyTypes };
import type { NodeId, Edge } from "./parser";

declare module "fastify" {}

const baseUrl = "/api/packages";

// === Route schemas and options ===

const allPackages = Type.Object({
  packages: Type.Array(Type.String()),
  cursors: Type.Object({
    after: Type.Optional(Type.String()),
    before: Type.Optional(Type.String()),
  }),
});

const allPackagesRouterOptions: RouteShorthandOptions = {
  schema: {
    response: {
      200: allPackages,
    },
  },
};

// A bit of repetition in schema below for two reasons:
// a) Fastify is not able to parse schema out of the box when using references (e.g. $dependency).
// b) Making objecs inside alternatives-array recursive would break type inferring.
const singlePackage = Type.Object({
  name: Type.String(),
  description: Type.String(),
  dependencies: Type.Array(
    Type.Object({
      target: Type.String(),
      type: Type.Enum(edgeTypes),
      targetInGraph: Type.Boolean(),
      alternatives: Type.Optional(
        Type.Array(
          Type.Object({
            target: Type.String(),
            targetInGraph: Type.Boolean(),
          })
        )
      ),
    })
  ),
  reverseDependencies: Type.Array(
    Type.Object({
      target: Type.String(),
      type: Type.Enum(edgeTypes),
      targetInGraph: Type.Boolean(),
      alternatives: Type.Optional(
        Type.Array(
          Type.Object({
            target: Type.String(),
            targetInGraph: Type.Boolean(),
          })
        )
      ),
    })
  ),
});

const singlePackageRouteOptions: RouteShorthandOptions = {
  schema: {
    response: {
      200: singlePackage,
    },
  },
};

// === Types needed in helpers and routes ===
export type AllPackages = Static<typeof allPackages>;

export type SinglePackage = Static<typeof singlePackage>;

type Cursors = AllPackages["cursors"];

type Dependencies = SinglePackage["dependencies"];

// === Helper functions ===
interface PaginateProps extends Cursors {
  nodes: NodeId[];
  pageSize: number;
}

type GetNodesToPaginateProps = Omit<PaginateProps, "pageSize">;

const getNodesToPaginate = ({ after, before, nodes }: GetNodesToPaginateProps) => {
  if (before) return _.dropRightWhile(nodes, node => node >= before);
  if (after) return _.dropWhile(nodes, node => node <= after);
  return nodes;
};

const paginate = ({ after, before, nodes, pageSize }: PaginateProps) => {
  const cursors: Cursors = {};

  const nodesToPaginate = getNodesToPaginate({ before, after, nodes });
  const adjustedPageSize = pageSize > nodesToPaginate.length ? nodesToPaginate.length : pageSize;
  const paginated = before ? _.takeRight(nodesToPaginate, adjustedPageSize) : _.take(nodesToPaginate, adjustedPageSize);

  const first = paginated[0];
  const last = paginated[paginated.length - 1];
  const originalIndexOfFirst = _.sortedIndexOf(nodes, first);
  const originalIndexOfLast = _.sortedIndexOf(nodes, last);
  if (originalIndexOfFirst > 0) cursors.before = first;
  if (originalIndexOfLast < nodes.length - 1) cursors.after = last;

  return { paginated, cursors };
};

interface CreateDependenciesFromEdgesProps {
  edges: Edge[];
  filterReversed: boolean;
}

const createDependenciesFromEdges = ({ edges, filterReversed }: CreateDependenciesFromEdgesProps): Dependencies =>
  edges
    .filter(({ type }) =>
      filterReversed
        ? type === edgeTypes["reversed"] || type === edgeTypes["reversed-alternative"]
        : type === edgeTypes["normal"] || type === edgeTypes["alternative"]
    )
    .map(edge => ({
      ...edge,
      targetInGraph: graph.nodes.has(edge.target),
      alternatives: edge.alternatives?.map(alternative => ({
        target: alternative,
        targetInGraph: graph.nodes.has(alternative),
      })),
    }));

// === Route declarations ===
interface AllPackagesQuery extends Cursors {
  size?: string;
}

interface SinglePackageParams {
  id: string;
}

export default fp(async fastify => {
  fastify.get<{ Querystring: AllPackagesQuery }>(baseUrl, allPackagesRouterOptions, async (request, reply) => {
    const { after: afterFromQuery, before: beforeFromQuery, size: sizeFromQuery } = request.query;
    const after = afterFromQuery && decodeURIComponent(afterFromQuery);
    const before = beforeFromQuery && decodeURIComponent(beforeFromQuery);

    if (before && after) reply.code(400).send({ error: "Using before and after at the same time is not allowed." });
    if (before && !graph.nodes.has(before)) reply.code(400).send({ error: `Bad cursor: ${before}` });
    if (after && !graph.nodes.has(after)) reply.code(400).send({ error: `Bad cursor: ${after}` });

    const defaultPageSize = 100;
    const pageSize = sizeFromQuery ? parseInt(sizeFromQuery, 10) : defaultPageSize;
    if (pageSize < 1) reply.code(400).send({ error: `Page size should be at least 1.` });

    const { paginated, cursors } = paginate({
      after,
      before,
      pageSize,
      nodes: _.sortBy([...graph.nodes.keys()]),
    });
    const body: AllPackages = { packages: paginated, cursors };
    return body;
  });

  fastify.get<{ Params: SinglePackageParams }>(`${baseUrl}/:id`, singlePackageRouteOptions, async (request, reply) => {
    const { id } = request.params;

    const node = graph.nodes.get(id);
    const edges = graph.edges.get(id);

    if (!node) {
      reply.callNotFound();
    } else {
      const body: SinglePackage = {
        ...node,
        dependencies: createDependenciesFromEdges({ edges, filterReversed: false }),
        reverseDependencies: createDependenciesFromEdges({ edges, filterReversed: true }),
      };
      reply.send(body);
    }
  });
}, "3.X");
