import { NavigationCore, NavigationTarget } from './navigationCore';
import { EntityKind, NumericId, Metadata } from './types';

export interface NavigationRoutes {
  readonly [entityKind: string]: string;
}

export class DefaultNavigationCore implements NavigationCore {
  constructor(private readonly routes: NavigationRoutes, private readonly defaultRoute = '/') {}

  resolveTarget(entityKind: EntityKind, id: NumericId, label: string): NavigationTarget {
    const routeTemplate = this.routes[entityKind] ?? this.defaultRoute;
    const routePath = this.buildPath(routeTemplate, id, label);

    return {
      entityKind,
      numericId: id,
      label,
      routePath,
      metadata: {} as Metadata,
    };
  }

  buildUrl(target: NavigationTarget): string {
    const query = target.parameters
      ? Object.entries(target.parameters)
          .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
          .join('&')
      : '';

    return query ? `${target.routePath}?${query}` : target.routePath;
  }

  getDefaultRoute(entityKind: EntityKind): string {
    return this.routes[entityKind] ?? this.defaultRoute;
  }

  private buildPath(template: string, id: NumericId, label: string): string {
    return template
      .replace(/:id/g, id.toString())
      .replace(/:label/g, encodeURIComponent(label));
  }
}
