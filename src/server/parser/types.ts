import DefaultMap from "./defaultMap";

export type PackageObject = Record<string, string>;

export interface Package {
  name: string;
  description: string;
}

export interface Edge {
  target: Package["name"];
  type: "normal" | "reversed" | "alternative" | "reversed-alternative";
  alternatives?: Package["name"][];
}

export interface PackageGraph {
  nodes: Map<Package["name"], Package>;
  edges: DefaultMap<Package["name"], Edge[]>;
}
