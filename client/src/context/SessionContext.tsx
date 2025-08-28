import constate from "constate";
import useSessionContext from "@/hooks/session/useSessionContext";

const [SessionProvider, useSessionContextHook] = constate(useSessionContext);

// eslint-disable-next-line react-refresh/only-export-components
export { SessionProvider, useSessionContextHook as useSessionContext };
