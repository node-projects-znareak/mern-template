import { ComponentType, Suspense } from "react";
import { LazyComponentProps } from "@interfaces/routes";

function LazyComponent({ component: Component, loader = null }: LazyComponentProps) {
  return (
    <Suspense fallback={loader}>
      <Component />
    </Suspense>
  );
}

function Async(component: ComponentType) {
  const lazyComponent = () => <LazyComponent component={component} />;
  return lazyComponent;
}

export default Async;
export { LazyComponent };
