import * as React from "react";
import axios from "axios";
import styled from "styled-components";
import { QueryKey, useQuery } from "react-query";
import { useParams, Link as RouterLink } from "react-router-dom";
import _ from "lodash";
import ContentLoader from "react-content-loader";
import { apiUrl } from "../../conf";
import { dependencyTypes } from "../../../server/routes";
import type { SinglePackage } from "../../../server/routes";
import { colors, fontWeights } from "../../constants";

const generareRandomNumInRange = (min: number, max: number) => Math.random() * (max - min) + min;

const Loader = ({ ...rest }) => (
  <ContentLoader
    speed={5}
    width={500}
    height={500}
    viewBox="0 0 500 500"
    backgroundColor={colors.gray[300]}
    foregroundColor={colors.gray[100]}
    {...rest}
  >
    <rect x="10" y="5" rx="5" ry="5" width="400" height="40" />
    {_.range(80, 200, 20).map(num => (
      <rect key={num} x="10" y={num} rx="5" ry="5" width={generareRandomNumInRange(350, 500)} height="5" />
    ))}
    <rect x="10" y="230" rx="5" ry="5" width="300" height="30" />
    {_.range(300, 350, 20).map(num => (
      <React.Fragment key={num}>
        <circle cx="30" cy={num + 5} r="5" />
        <rect x="45" y={num} rx="5" ry="5" width={generareRandomNumInRange(150, 250)} height="5" />
      </React.Fragment>
    ))}
  </ContentLoader>
);

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

const Link = styled(RouterLink)`
  display: block;
  text-decoration: none;
  font-weight: ${fontWeights.medium};
  color: ${colors.gray[900]};
  line-height: 2;

  &:hover {
    text-decoration: underline;
  }
`;

const DependencyLink = ({ dependency }: LinkProps) =>
  dependency.targetInGraph ? (
    <Link to={`../${dependency.target}`}>{dependency.target}</Link>
  ) : (
    <span>{dependency.target}</span>
  );

const StyledListItem = styled.li`
  &::marker {
    color: ${colors.secondary};
    content: " ⇒ ";
  }
`;

const Alternatives = styled.p`
  color: ${colors.gray[700]};
`;

const DependencyItem = ({ dependency }: DependencyProps) => {
  return (
    <StyledListItem>
      <DependencyLink dependency={dependency} />
      {dependency.alternatives && (
        <Alternatives>
          {dependency.type === dependencyTypes["reversed-alternative"]
            ? "which can alternatively depend on: "
            : "or alternatively: "}
          {dependency.alternatives.map((alternative, i) => (
            <span key={alternative.target}>
              {i > 0 && ", "}
              <DependencyLink dependency={alternative} />
            </span>
          ))}
        </Alternatives>
      )}
    </StyledListItem>
  );
};

const Title = styled.h2`
  font-size: 2.5rem;
  font-weight: ${fontWeights.bold};
`;

const Description = styled.p`
  white-space: pre-line;
`;

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const replaceSymbolsWithLists = (symbol: "+" | "*", original: string) => {
  const parts = original.split(`${symbol} `);
  let listed = [parts[0], "<ul>"];
  parts.forEach(part => (listed = listed.concat(["<li>", part, "</li>"])));
  return listed.join("");
};

const formatDescription = (description: SinglePackage["description"]) => {
  let formatted = description;

  // format links with replace
  formatted = formatted
    .replace(/<(.*)>/g, "<a href='$1'>$1</a>")
    .replace(/git:\/\/(.*)/g, "<a href='git://$1'>git://$1<a>");

  // If there are lists made with * or +, replace with <ul> <li> list
  if (formatted.includes(`* `)) {
    formatted = replaceSymbolsWithLists("*", formatted);
  }
  if (formatted.includes(`+ `) && ["c++", "g++"].every(str => !formatted.toLocaleLowerCase().includes(str))) {
    formatted = replaceSymbolsWithLists("+", formatted);
  }
  return { __html: formatted };
};

const SinglePackageView = () => {
  const { packageName } = useParams();
  const { status, data, error } = useQuery<SinglePackage, Error>(["singlePackage", packageName], getPackage);

  if (status === "loading") return <Loader />;
  if (status === "error" && error) return <Loader />;
  if (!data) return <span>Wasn't able to load data for some reason!</span>;

  return (
    <Stack>
      <Title>{data.name}</Title>
      <Description dangerouslySetInnerHTML={formatDescription(data.description)} />
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
    </Stack>
  );
};

export default SinglePackageView;
