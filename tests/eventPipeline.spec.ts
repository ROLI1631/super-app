import { createDefaultInfrastructureServices } from '../infrastructure/factory';

describe('Event pipeline', () => {
  it('should process a dispatched API request through the full event flow', async () => {
    const services = createDefaultInfrastructureServices();
    const received: unknown[] = [];

    services.eventPipeline.subscribe((event) => {
      received.push(event.payload);
    });

    await services.apiGateway.dispatch({
      action: 'user.login',
      payload: { username: 'tester' },
      userId: 100,
      sessionId: 200,
      containerId: 300,
      moduleId: 400,
    });

    expect(received.length).toBeGreaterThanOrEqual(1);
    const first = received[0];
    const receivedPayload = first && (first.payload !== undefined ? first.payload : first);
    expect(receivedPayload).toEqual({ username: 'tester' });

    const journalEntries = services.journal.query({ recordType: 'platform.event' });
    expect(journalEntries.length).toBe(1);
    // journal stores the PlatformEvent as payload; its inner payload should match
    expect(journalEntries[0].payload.payload).toEqual({ username: 'tester' });
  });
});
