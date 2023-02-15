import { PathRouter, PathRoute, PathRouteDefaultHandler } from '@krhkt/path-router';
import type { HandlerParamsType } from '@krhkt/path-router';

export const cliPathRouter = (defaultControllerConstructorParams: any | undefined = undefined) => {
  const defaultHandler = new PathRouteDefaultHandler(
    `${__dirname}/../../app-domain/cli/controllers`,
    [defaultControllerConstructorParams],
  );

  const notFoundHandler = async (params: HandlerParamsType) => {
    console.log(`${params.path} is not a valid command`);

    return null;
  };

  const pathRouter = new PathRouter({
    defaultRouteHandler: defaultHandler,
    routeSeparator: ':',
    defaultMissingRouteHandler: notFoundHandler,
  });

  pathRouter
    // routes under infra are potentially dangerous to execute
    .addRoute({
      name: 'db-migration',
      path: 'infra:{controller}:{action}',
      defaults: { namespace: 'infra', action: 'main' },
    })

    .addRoute({
      name: 'default',
      path: '{controller}:{action}:{id}',
      constraints: { id: PathRoute.OptionalParam },
      defaults: { action: 'main' },
    });

  return pathRouter;
};
