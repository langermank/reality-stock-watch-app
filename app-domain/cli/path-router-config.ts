import type { HandlerParamsType } from 'app-domain/app-components/path-router/path-route-default-handler';
import { PathRouteDefaultHandler } from 'app-domain/app-components/path-router/path-route-default-handler';
import { PathRouter } from '../app-components/path-router/path-router';

export const cliPathRouter = () => {
  const defaultHandler = new PathRouteDefaultHandler(`${__dirname}/../../cli/controllers`);

  const notFoundHandler = async (params: HandlerParamsType) => {
    console.log(`${params.path} is not a valid command`);

    return null;
  };

  const pathRouter = new PathRouter({
    defaultRouteHandler: defaultHandler,
    routeSeparator: ':',
    defaultMissingRouteHandler: notFoundHandler,
  });

  pathRouter.addRoute({
    name: 'db-migration',
    path: 'migrate',
  });

  return pathRouter;
};
