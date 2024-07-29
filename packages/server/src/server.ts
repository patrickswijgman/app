import { createServer } from "http";
import { Content, internalError, notFound, serveContent } from "./utils.js";

type Config = {
  server: {
    host: string;
    port: number;
  };
  routes: Record<string, () => Content>;
};

/**
 * Start the HTTP web server.
 */
export function server(c: Config) {
  createServer((req, res) => {
    try {
      const url = new URL(`http://${c.server.host}:${c.server.port}${req.url}`);
      const route = c.routes[url.pathname];

      if (route) {
        serveContent(res, 200, route());
      } else {
        notFound(res);
      }
    } catch (e) {
      internalError(res, e);
    }
  }).listen(
    {
      host: c.server.host,
      port: c.server.port,
    },
    () => {
      console.log(
        `Server is running at http://${c.server.host}:${c.server.port}`,
      );
    },
  );
}
