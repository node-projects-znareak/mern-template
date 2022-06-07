import React from "react";
import ReactDOM from "react-dom/client";
import Routers from "./Components/Routers";
import UserProvider from "./Components/Context/UserProvider";
import { QueryClient, QueryClientProvider } from "react-query";
// import { ReactQueryDevtools } from "react-query/devtools";

import "./Style/App.scss";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";

const root = document.getElementById("root");
const client = new QueryClient({
  defaultOptions: {
    queries: {
      notifyOnChangePropsExclusions: ["isStale"],
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <QueryClientProvider client={client}>
      <UserProvider>
        <Routers />
      </UserProvider>
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  </React.StrictMode>
);
