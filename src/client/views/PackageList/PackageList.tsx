import * as React from "react";
import axios from "axios";
import { useInfiniteQuery } from "react-query";
import { Link } from "react-router-dom";
import { apiUrl } from "../../conf";
import type { AllPackages } from "../../../server/routes";

const getPackages = async ({ pageParam = undefined }) => {
  const url = !pageParam ? apiUrl : `${apiUrl}?after=${encodeURIComponent(pageParam)}`;
  const { data } = await axios.get<AllPackages>(url);
  return data;
};

const PackageListView = () => {
  const { data, error, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, status } = useInfiniteQuery<
    AllPackages,
    Error
  >("packages", getPackages, {
    getNextPageParam: lastPage => lastPage.cursors.after,
  });

  if (status === "loading") return <p>loading....</p>;
  if (status === "error" && error) return <p>Error!....{error.message}</p>;
  return (
    <>
      {data?.pages.map((group, i) => (
        <React.Fragment key={i}>
          {group.packages.map(packageName => (
            <p>
              <Link key={packageName} to={packageName}>
                {packageName}
              </Link>
            </p>
          ))}
        </React.Fragment>
      ))}
      <div>
        <button onClick={() => fetchNextPage()} disabled={!hasNextPage || isFetchingNextPage}>
          {isFetchingNextPage ? "Loading more..." : hasNextPage ? "Load More" : "Nothing more to load"}
        </button>
      </div>
      <div>{isFetching && !isFetchingNextPage ? "Fetching..." : null}</div>
    </>
  );
};

export default PackageListView;
