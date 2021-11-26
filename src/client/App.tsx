import { QueryClient, QueryClientProvider } from "react-query";
import PackageList from "./views/PackageList";
import SinglePackage from "./views/SinglePackage";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const Front = () => <p>Frontpage</p>;

const App = () => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Front />} />
          <Route path="packages">
            <Route index element={<PackageList />} />
            <Route path=":packageName" element={<SinglePackage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
