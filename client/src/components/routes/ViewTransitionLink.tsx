import type { MouseEvent } from "react";
import { flushSync } from "react-dom";
import { Link, useNavigate, type LinkProps } from "react-router-dom";

type DocumentWithViewTransition = Document & {
  startViewTransition?: (callback: () => void) => { finished: Promise<void> };
};

let transitionRunning = false;

function ViewTransitionLink({ to, onClick, state, replace, children, ...props }: LinkProps) {
  const navigate = useNavigate();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (typeof to !== "string") return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const startViewTransition = (document as DocumentWithViewTransition).startViewTransition;
    if (!startViewTransition || transitionRunning) return;

    event.preventDefault();
    transitionRunning = true;

    try {
      const transition = startViewTransition(() => {
        flushSync(() => {
          navigate(to, { state, replace });
        });
      });
      transition.finished.catch(() => {});
    } catch {
      navigate(to, { state, replace });
    } finally {
      window.setTimeout(() => {
        transitionRunning = false;
      }, 400);
    }
  };

  return (
    <Link {...props} to={to} state={state} replace={replace} onClick={handleClick}>
      {children}
    </Link>
  );
}

export default ViewTransitionLink;
