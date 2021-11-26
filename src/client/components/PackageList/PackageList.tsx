import * as React from "react";
import axios from "axios";
import { useInfiniteQuery } from "react-query";
import { Link as RouterLink } from "react-router-dom";
import styled from "styled-components";
import { apiUrl } from "../../conf";
import type { AllPackages } from "../../../server/routes";
import { colors, fontWeights } from "../../constants";

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
  color: ${props => (props.disabled ? colors.gray[300] : colors.secondary)};
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

  if (status === "loading") return <p>loading....</p>;
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
          {isFetchingNextPage ? "Loading more..." : hasNextPage ? "Load More" : "Nothing more to load"}
        </Button>
      </div>
    </>
  );
};

export default PackageListView;
