import { Suspense } from "react";
import Loader from "./Loaders/loader";

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

export default function Async(component, loader = <Loader />) {
  return () => <LazyComponent component={component} loader={loader} />;
}
