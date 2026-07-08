import { EventBus } from '../../core/eventBus';
import { NumericId } from '../../core/types';

export interface NotificationInput {
  readonly userId: NumericId;
  readonly eventId: string;
  readonly coordinate: string;
  readonly so8fiCode: string;
  readonly hash: string;
}

export interface NotificationRecord {
  readonly id: number;
  readonly userId: NumericId;
  readonly eventId: string;
  readonly coordinate: string;
}

export interface NotificationEngine {
  notify(input: NotificationInput): Promise<NotificationRecord>;
}

export class DefaultNotificationEngine implements NotificationEngine {
  private sequence = 0;

  constructor(private readonly eventBus: EventBus) {}

  async notify(input: NotificationInput): Promise<NotificationRecord> {
    this.sequence += 1;

    const notification: NotificationRecord = Object.freeze({
      id: this.sequence,
      userId: input.userId,
      eventId: input.eventId,
      coordinate: input.coordinate,
    });

    await this.eventBus.publish({
      type: 'core.notification.sent',
      payload: notification,
      sourceId: input.userId,
      timestamp: input.coordinate,
      metadata: {
        so8fiCode: input.so8fiCode,
        hash: input.hash,
      },
    });

    return notification;
  }
}
