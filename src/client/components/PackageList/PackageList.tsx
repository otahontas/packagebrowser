import * as React from "react";
import axios from "axios";
import _ from "lodash";
import { useInfiniteQuery } from "react-query";
import { Link as RouterLink } from "react-router-dom";
import ContentLoader from "react-content-loader";
import styled from "styled-components";
import { apiUrl } from "../../conf";
import type { AllPackages } from "../../../server/routes";
import { colors, fontWeights } from "../../constants";

const generareRandomNumInRange = (min: number, max: number) => Math.random() * (max - min) + min;

const Loader = ({ ...rest }) => (
  <ContentLoader
    speed={5}
    width={200}
    height={1000}
    viewBox="0 0 200 1000"
    backgroundColor={colors.gray[300]}
    foregroundColor={colors.gray[100]}
    {...rest}
  >
    {_.range(15, 1000, 30).map(num => (
      <rect key={num} x="10" y={num} rx="5" ry="5" width={generareRandomNumInRange(150, 250)} height="10" />
    ))}
  </ContentLoader>
);

const getPackages = async ({ pageParam = undefined }) => {
  const url = !pageParam ? apiUrl : `${apiUrl}?after=${encodeURIComponent(pageParam)}`;
  const { data } = await axios.get<AllPackages>(url);
  return data;
};

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

const Button = styled.button`
  border-radius: 4px;
  padding: 4px;
  color: ${props => (props.disabled ? colors.gray[300] : colors.primary)};
  background-color: ${colors.white};
  border: 2px solid currentColor;

  &:hover {
    background-color: ${props => !props.disabled && colors.gray[100]};
  }
`;

const PackageListView = () => {
  const { data, error, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery<AllPackages, Error>(
    "packages",
    getPackages,
    {
      getNextPageParam: lastPage => lastPage.cursors.after,
    }
  );

  if (status === "loading") return <Loader />;
  if (status === "error" && error) return <p>Error!....{error.message}</p>;
  return (
    <>
      {data?.pages.map((group, i) => (
        <React.Fragment key={i}>
          {group.packages.map(packageName => (
            <p key={packageName}>
              <Link key={packageName} to={packageName}>
                {packageName}
              </Link>
            </p>
          ))}
        </React.Fragment>
      ))}
      <div>
        <Button onClick={() => fetchNextPage()} disabled={!hasNextPage || isFetchingNextPage}>
          {isFetchingNextPage ? "Fetching..." : hasNextPage ? "Load More" : "Nothing more to load"}
        </Button>
      </div>
    </>
  );
};

export default PackageListView;
