import { onRequest as proxyOnRequest } from "../[[path]].js";

export async function onRequest(context) {
  const table = context.params.table;

  // Rebuild the params.path format expected by [[path]].js
  // This ensures the catch-all proxy can correctly identify the subpath
  const newContext = {
    ...context,
    params: { path: ["read", table] }
  };

  return proxyOnRequest(newContext);
}