import { ApiRequest } from './event';
import { Metadata, NumericId } from './types';

export interface ProtocolExecutionContext {
  readonly userId: NumericId;
  readonly sessionId: NumericId;
  readonly moduleId: NumericId;
}

export interface ProtocolExecutionResult {
  readonly allowed: boolean;
  readonly metadata?: Metadata;
  readonly commission?: number;
  readonly discount?: number;
  readonly reward?: number;
}

export interface ProtocolEngine {
  execute<T extends object>(request: ApiRequest<T>, context: ProtocolExecutionContext): Promise<ProtocolExecutionResult>;
}

export class DefaultProtocolEngine implements ProtocolEngine {
  private readonly throttle = new Map<string, number>();

  async execute<T extends object>(request: ApiRequest<T>, context: ProtocolExecutionContext): Promise<ProtocolExecutionResult> {
    // Basic validation / permission placeholder — no business logic here.
    const key = `${context.userId}:${request.action}`;

    const count = (this.throttle.get(key) ?? 0) + 1;
    this.throttle.set(key, count);

    // Very small throttling rule: deny after 1000 calls (placeholder configurable)
    if (count > 1000) {
      return { allowed: false };
    }

    // Permissions, commissions, discounts, rewards are delegated to business rules elsewhere.
    // Here we only prepare canonical metadata and allow the request.
    const metadata: Metadata = {
      protocol: {
        executedAt: new Date().toISOString(),
        callCount: count,
      },
    };

    return { allowed: true, metadata };
  }
}
