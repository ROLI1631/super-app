import { EventBus, EventHandler, EventMessage } from './eventBus';

export class InProcessEventBus implements EventBus {
  private readonly handlers = new Map<string, Set<EventHandler<object>>>();

  publish<T extends object>(event: EventMessage<T>): Promise<void> {
    const handlers = this.handlers.get(event.type);
    if (!handlers || handlers.size === 0) {
      return Promise.resolve();
    }

    const promises: Promise<void>[] = [];
    handlers.forEach((handler) => {
      try {
        const result = handler(event as EventMessage<object>);
        if (result instanceof Promise) {
          promises.push(result);
        }
      } catch (error) {
        promises.push(Promise.reject(error));
      }
    });

    return Promise.all(promises).then(() => undefined);
  }

  subscribe<T extends object>(type: string, handler: EventHandler<T>): void {
    const list = this.handlers.get(type) ?? new Set<EventHandler<object>>();
    list.add(handler as EventHandler<object>);
    this.handlers.set(type, list);
  }

  unsubscribe<T extends object>(type: string, handler: EventHandler<T>): void {
    const list = this.handlers.get(type);
    if (!list) {
      return;
    }

    list.delete(handler as EventHandler<object>);
    if (list.size === 0) {
      this.handlers.delete(type);
    }
  }
}
