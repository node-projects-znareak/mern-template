import React from "react";
import ReactDOM from "react-dom";
import Routers from "./Components/Routers";
import { QueryClient, QueryClientProvider } from "react-query";
import UserProvider from "./Components/Context/UserProvider";
import "./Style/App.scss";

const client = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 0,
    },
  },
});

ReactDOM.render(
  <React.StrictMode>
    <QueryClientProvider client={client}>
      <UserProvider>
        <Routers />
      </UserProvider>
    </QueryClientProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
