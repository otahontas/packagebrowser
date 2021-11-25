import _ from "lodash";
import DefaultMap from "./defaultMap";
import { Edge, PackageGraph, Package, PackageObject } from "./types";
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
 * Parses single package with Regex. Rexex used matches 'key: value' -pairs following
 * the Debian control file syntax.
 *
 * @returns Key-value pairs representing single package
 */
const parseSinglePackageStringToObject = (pkg: string) => {
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

const addAlternativeDepsToGraph = (node: Package, dependencies: string, graph: PackageGraph) => {
  const alternatives = dependencies.split("|").map(dependency => trimDepencency(dependency));
  const [target, ...rest] = alternatives;

  graph.edges.get(node.name).push({ target: target, type: "alternative", alternatives: rest });
  alternatives.forEach(target => {
    graph.edges.get(target).push({
      target: node.name,
      type: "reversed-alternative",
    });
  });
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
    description: pkg.Description,
  };
  graph.nodes.set(node.name, node);

  const rawDependencies = pkg.Depends ? pkg.Depends.split(",") : [];
  rawDependencies.forEach(dependency => {
    if (dependency.includes("|")) {
      addAlternativeDepsToGraph(node, dependency, graph);
    } else {
      const target = trimDepencency(dependency);
      graph.edges.get(node.name).push({ target, type: "normal" });
      graph.edges.get(target).push({ target: node.name, type: "reversed" });
    }
  });
};

export const createPackageGraph = (packages: string) => {
  packages
    .split("\n\n")
    .map(pkg => parseSinglePackageStringToObject(pkg))
    .forEach(pkg => enrichGraphFromPackageObject(pkg, graph));

  for (const [nodeName, edgeList] of graph.edges.entries()) {
    graph.edges.set(nodeName, _.uniqBy(edgeList, "target"));
  }
};
