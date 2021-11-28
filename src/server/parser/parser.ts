import _ from "lodash";
import DefaultMap from "./defaultMap";

type PackageObject = Record<string, string>;

export interface Node {
  name: string;
  description: string;
}

export type NodeId = Node["name"];

export enum edgeTypes {
  "normal",
  "reversed",
  "alternative",
  "reversed-alternative",
}

export interface Edge {
  target: NodeId;
  type: edgeTypes;
  alternatives?: NodeId[];
}

interface PackageGraph {
  nodes: Map<NodeId, Node>;
  edges: DefaultMap<NodeId, Edge[]>;
}

const edgeMapDefaultValue: Edge[] = [];
/**
 * Graph singleton for the whole app.
 */
export const graph: PackageGraph = {
  nodes: new Map(),
  edges: new DefaultMap(edgeMapDefaultValue),
};

/**
 *
 * Parses single package with Regex. Rexex used matches all 'key: value' -pairs
 * in block that follows the Debian control file syntax.
 *
 * @returns Key-value pairs representing single package
 */
const parseSinglePackageStringToObject = (pkg: string): PackageObject => {
  const debianControlFileKeyValueSplitter = /^([\w-]+):(.+(?:\n .*)*)/gm;

  return [...pkg.matchAll(debianControlFileKeyValueSplitter)].reduce((acc: PackageObject, curr: RegExpMatchArray) => {
    const [, key, value] = curr;
    return {
      ...acc,
      [key]: value.trim(),
    };
  }, {});
};

const trimDepencency = (dependency: string) => dependency.split("(")[0].trim();

const addAlternativeDepsToGraph = (nodeId: NodeId, dependencies: string, graph: PackageGraph) => {
  const alternatives = dependencies.split("|").map(dependency => trimDepencency(dependency));
  const [target, ...rest] = alternatives;

  graph.edges.get(nodeId).push({ target: target, type: edgeTypes["alternative"], alternatives: rest });
  alternatives.forEach(target => {
    graph.edges.get(target).push({
      target: nodeId,
      type: edgeTypes["reversed-alternative"],
      alternatives: alternatives.filter(other => other !== target),
    });
  });
};

// - Remove hard-coded line breaks, but not the first one
// - Replace dots indicating paragraph breaks with newlines
// - Drop literal "URL" strings from urls
const parseDescription = (description: string) => {
  const [shortDescription, ...rest] = description.split("\n");
  const restFormatted = rest.join("\n").replace(/\n/g, "").replace(/ \. /g, "\n").replace(/URL:/g, "").trim();
  return shortDescription.trim().concat("\n", restFormatted);
};

const enrichGraphFromPackageObject = (pkg: PackageObject, graph: PackageGraph) => {
  const wantedProperties = ["Package", "Description"];
  if (_.difference(wantedProperties, Object.keys(pkg)).length > 0) {
    console.error(
      `Note! Package didn't have all wanted properties, falling back to other props. Pkg: ${JSON.stringify(pkg)}`
    );
  }

  const node = {
    name: pkg.Package || pkg.Source,
    description: parseDescription(pkg.Description),
  };
  graph.nodes.set(node.name, node);

  (pkg.Depends?.split(",") || []).forEach(dependency => {
    if (dependency.includes("|")) {
      addAlternativeDepsToGraph(node.name, dependency, graph);
    } else {
      const target = trimDepencency(dependency);
      graph.edges.get(node.name).push({ target, type: edgeTypes["normal"] });
      graph.edges.get(target).push({ target: node.name, type: edgeTypes["reversed"] });
    }
  });
};

export const createPackageGraph = (packages: string) => {
  packages
    .trim()
    .split("\n\n")
    .map(pkg => parseSinglePackageStringToObject(pkg))
    .forEach(pkg => enrichGraphFromPackageObject(pkg, graph));

  [...graph.edges.entries()].forEach(([nodeName, edgeList]) => {
    graph.edges.set(nodeName, _.uniqBy(edgeList, "target"));
  });
};
