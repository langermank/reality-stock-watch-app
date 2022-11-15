export class PathRouter {
  _routeSeparator = ':';
  _routesMap;

  constructor(routesMap: any, routeSeparator = '') {
    this._routesMap = routesMap;

    if (routeSeparator) this._routeSeparator = routeSeparator;
  }

  processRouteName(routeString: string) {
    const routeParts = routeString.split(this._routeSeparator);
  }
}

export class PathRoutesMap {
  _routes = new Map<string, PathRoute>();

  addRoute(
    name: string,
    path: string,
    defaults: object | null = null,
    constraints = null,
  ) {
    const route = new PathRoute(name, path, defaults, constraints);

    this._routes[name] = route;
  }
}

export class PathRoute {
  separator: string;
  name: string;
  pathTemplate: string;
  defaults: object;
  constraints: object;
  routeHandler: PathRouteHandler;

  constructor(
    name: string,
    path: string,
    separator: string,
    defaults: object | null,
    constraints: object | null,
  ) {
    this.name = name;
    this.pathTemplate = path;
    this.separator = separator;
    this.defaults = defaults || {};
    this.constraints = constraints || {};
  }

  processPathTemplate() {
    const templateParts = this.pathTemplate.split(this.separator);
  }
}

export class PathRouteHandler {}
