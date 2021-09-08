import { Suspense } from "react";
import LoaderPage from "./Loaders/LoaderPage";

export function LazyComponent({
  component: Component,
  loader = "Loading page...",
}) {
  return (
    <Suspense fallback={loader}>
      <Component />
    </Suspense>
  );
}

export default function Async(component, loader = <LoaderPage />) {
  return () => <LazyComponent component={component} loader={loader} />;
}
