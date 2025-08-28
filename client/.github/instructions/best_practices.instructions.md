**Prompt for Code Agent: Project Structure and Implementation**
 
---
 
**You are a Code Agent for a React + TypeScript project. Follow these rules for every code or structure change:**
 
1. **Folder-by-feature:**
   * Each feature lives in its own folder under src.
   * Feature folders must be independent and never import from each other.
2. **Global directories (inside src only):**
   * `app/`, `assets/`, `components/` (shared), `config/`, `hooks/`, `lib/`, `tests/`, `types/`, `utils/`.
3. **Feature folder structure:**
   * Organize code by type:
     * Types: `types/<feature>/`
     * API fetchers: `api/<feature>/`
     * React Query hooks: `hooks/<feature>/`
     * Styles: SASS modules, colocated with components
     * Components: colocated within the feature folder
     * Pages: `pages/<feature>/`
     * Public URL files & assets: `/assets`
     * Public URL svg icons: `/assets/icons/`

4. **Mandatory technologies:**
   * HTTP: `axios` (never fetch)
   * Data/cache: `@tanstack/react-query`
   * CSS:`Tailwind CSS`, `sass`
   * UI: `Ant Design` (for components)
   * State management: `zustand` (for global state) or `@tanstack/react-query` (for local state)
   * Routing: `react-router-dom`
5. **Naming conventions:**
   * Hooks: `useCamelCase`
   * Handlers: `handleCamelCase`
   * Components/Pages: `PascalCase`
   * CSS classes: `kebab-case`
6. **Coding standards:**
   * Do not use excessive comments in the code, only when it is a complex flow
   * Use TypeScript for all code.
   * Use ESLint + Prettier and TypeScript.
   * Use absolute imports (configured in tsconfig.json).
   * Prefer arrow functions; use `export default` for pages, named exports for hooks.
   * No inline styles; Prioritize Tailwind CSS for styling, if Tailwind is insufficient, use SASS Modules. Only as a last resort, use CSS Modules o CSS files.
   * Use Ant Design components for UI elements, but customize with Tailwind CSS or SASS Modules when necessary.
   * Apply KISS, DRY, SOLID principles.
   * Keep logic, state, and styles close to usage.
   * Limit props and avoid large components.
   * Use `react-query`'s `useQuery` and `useMutation` for data fetching and mutations.
   * When creating a new generic or UI component, always follow this convention for typing the component's props:
     ```tsx
         import { PropsWithChildren, HTMLAttributes } from "react";
         import cls from "classnames"; // or your utility function

         export default function Container({
         children,
         className,
         ...props
         // This allows passing any HTML attributes
         }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
            return (
               <div className={cls("px-[16px]", className)} {...props}>
                  {children} // this optional children prop allows for nested content
               </div>
            );
         }
     ```
7. **API layer:**
   * Types → `types/<feature>/`
   * Axios instance → `lib/axios.ts`
   * Fetchers → `api/<feature>/`
   * Hooks → `hooks/<feature>/`
8. **Error handling:**
   * Always handle errors gracefully.
   * Use `try/catch` in async functions.
   * Never let errors break the UI; catch and show notifications or redirect.
   * Use `react-query`'s error handling features.
9. **Performance:**
   * Use `React.lazy()` for code-splitting in the router.
   * Use `React.memo` and `useCallback` as needed.
10. **TypeScript:**
    * Define types before implementation; avoid duplication.
   * Use `interface` for object types, `type` for unions and intersections.
   * Use `unknown` for unknown data, `any` only when absolutely necessary.
   * Use `enum` for fixed sets of values.
   * Use `Record<string, unknown>` for objects with dynamic keys.
---
 
**Always explain critical architectural decisions in comments. Prioritize clarity and maintainability. Never violate these rules.**
