import * as React from "react";
import axios from "axios";
import { QueryKey, useQuery } from "react-query";
import { useParams, Link } from "react-router-dom";
import { apiUrl } from "../../conf";
import { dependencyTypes } from "../../../server/routes";
import type { SinglePackage } from "../../../server/routes";

const getPackage = async ({ queryKey }: { queryKey: QueryKey }) => {
  const [, packageName] = queryKey;
  const { data } = await axios.get<SinglePackage>(`${apiUrl}/${packageName}`);
  return data;
};

type Dependency = SinglePackage["dependencies"][number];

interface DependencyProps {
  dependency: Dependency;
}

interface LinkProps {
  dependency: Pick<Dependency, "target" | "targetInGraph">;
}

interface AlternativeProps {
  alternatives: Required<Dependency>["alternatives"];
}

const parseAlternatives = ({ alternatives }: AlternativeProps) => {
  console.log("parsing alternatives", alternatives);
  return alternatives;
};

const DependencyLink = ({ dependency }: LinkProps) =>
  dependency.targetInGraph ? (
    <Link to={`../${dependency.target}`}>{dependency.target}</Link>
  ) : (
    <span>{dependency.target} (No link available)</span>
  );

const DependencyItem = ({ dependency }: DependencyProps) => {
  return (
    <li style={{ border: "1px solid black", padding: "8px" }}>
      <DependencyLink dependency={dependency} />
      {dependency.alternatives && (
        <p>
          {dependency.type === dependencyTypes["reversed-alternative"]
            ? "can alternatively depend on: "
            : "can alternatively install: "}
          {parseAlternatives({ alternatives: dependency.alternatives }).map(alternative => (
            <React.Fragment key={alternative.target}>
              <DependencyLink dependency={alternative} />{" "}
            </React.Fragment>
          ))}
        </p>
      )}
    </li>
  );
};

const SinglePackageView = () => {
  const { packageName } = useParams();
  const { status, data, error } = useQuery<SinglePackage, Error>(["singlePackage", packageName], getPackage);

  if (status === "loading") return <span>Loading...</span>;
  if (status === "error" && error) return <span>Error: {error.message}</span>;

  return (
    <>
      <h1>{data?.name}</h1>
      <p>{data?.description}</p>
      {data && data.dependencies.length > 0 && (
        <>
          <h2>Packages this package depends on</h2>
          <ul>
            {data.dependencies.map(dependency => (
              <DependencyItem key={dependency.target} dependency={dependency} />
            ))}
          </ul>
        </>
      )}
      {data && data.reverseDependencies.length > 0 && (
        <>
          <h2>Packages that depend on this package</h2>
          <ul>
            {data.reverseDependencies.map(dependency => (
              <DependencyItem key={dependency.target} dependency={dependency} />
            ))}
          </ul>
        </>
      )}
    </>
  );
};

export default SinglePackageView;
