import _ from "lodash";
import DefaultMap from "./defaultMap";

type PackageObject = Record<string, string>;

interface Package {
  name: string;
  description: string;
}

interface Edge {
  target: Package["name"];
  type: "normal" | "reversed" | "alternative" | "reversed-alternative";
  alternatives?: Package["name"][];
}
interface PackageGraph {
  nodes: Map<Package["name"], Package>;
  edges: DefaultMap<Package["name"], Edge[]>;
}

/**
 *
 * Parses single package with regex matching 'key: value' -pairs in string that follows
 * debian control file syntax.
 *
 * @returns Key-value pairs representing single package
 */
const parseSinglePackageStringToObject = (pkg: string) => {
  const debianControlFileKeyValueSplitter = /^([\w-]+):(.+(?:\n .*)*)/gm;

  return [...pkg.matchAll(debianControlFileKeyValueSplitter)].reduce((acc: PackageObject, curr: RegExpMatchArray) => {
    const [, key, value] = curr;
    return {
      ...acc,
      [key]: value,
    };
  }, {});
};

const parseName = (name: string) => {
  if (name === "") {
    throw new Error("Name of the package was empty!");
  }
  return name.trim();
};

const parseDescription = (description: string) => {
  if (description === "") {
    throw new Error("Description of the package was empty!");
  }
  return description;
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
    throw new Error("Package didn't have all the wanted properties!");
  }

  const node = {
    name: parseName(pkg.Package),
    description: parseDescription(pkg.Description),
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

export const parsePackagesFromString = (packages: string) => {
  const edgeMapDefaultValue: Edge[] = [];
  const graph: PackageGraph = {
    nodes: new Map(),
    edges: new DefaultMap(edgeMapDefaultValue),
  };

  packages
    .split("\n\n")
    .map(pkg => parseSinglePackageStringToObject(pkg))
    .forEach(pkg => enrichGraphFromPackageObject(pkg, graph));

  for (const [nodeName, edgeList] of graph.edges.entries()) {
    graph.edges.set(nodeName, _.uniqBy(edgeList, "target"));
  }
  return graph;
};
