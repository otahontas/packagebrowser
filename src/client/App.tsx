import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PackageList from "./components/PackageList";
import SinglePackage from "./components/SinglePackage";
import Layout from "./components/Layout";
import GlobalStyle from "./GlobalStyle";

const App = () => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate replace to="/packages" />} />
          <Route path="packages" element={<Layout />}>
            <Route index element={<PackageList />} />
            <Route path=":packageName" element={<SinglePackage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <GlobalStyle />
    </QueryClientProvider>
  );
};

export default App;
