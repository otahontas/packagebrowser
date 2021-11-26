import * as React from "react";
import axios from "axios";
import { QueryClient, QueryClientProvider, useInfiniteQuery } from "react-query";

const apiUrl = "http://localhost:8081/api/packages";

const getPackages = async ({ pageParam = undefined }) => {
  const url = !pageParam ? apiUrl : `${apiUrl}?after=${encodeURIComponent(pageParam)}`;
  const { data } = await axios.get(url);
  return data;
};

const List = () => {
  const { data, error, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, status } = useInfiniteQuery(
    "packages",
    getPackages,
    {
      getNextPageParam: lastPage => {
        console.log("getting next page param from ", lastPage);
        console.log(lastPage.cursors.after);
        return lastPage.cursors.after;
      },
    }
  );

  if (status === "loading") return <p>loading....</p>;
  if (status === "error") return <p>Error!....{(error as Error).message}</p>;
  return (
    <>
      {data?.pages.map((group, i) => (
        <React.Fragment key={i}>
          {group.packages.map((packageName: string) => (
            <p key={packageName}>{packageName}</p>
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

const App = () => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <List />
    </QueryClientProvider>
  );
};

export default App;
