import { createDefaultCoreServices } from '../core/factory';

describe('Core implementation', () => {
  it('should compose default core services and persist immutable temporal journal entries through Time Core', async () => {
    const services = createDefaultCoreServices();
    const record = services.timeCore.record({ message: 'hello' }, 'system.event', 1);

    expect(record.id).toBeGreaterThan(0);
    expect(record.coordinate).toMatch(/^\d{4}\.\d{4}\.\d{3}\.\d{2}\.\d{2}\.\d{2}\.\d{2}\.\d{4}$/);
    expect(record.so8fiCode.startsWith('SO8FI.')).toBe(true);
    expect(record.protocol).toBe('system.event');
    expect(record.identityId).toBe(1);
    expect(record.hash).toHaveLength(64);

    const journalEntry = services.journal.readById(record.id);
    expect(journalEntry).toEqual(record);
  });

  it('should generate monotonic movement coordinates', () => {
    const services = createDefaultCoreServices();
    const first = services.timeCore.record({ message: 'first' }, 'system.event', 1);
    const second = services.timeCore.record({ message: 'second' }, 'system.event', 1);
    expect(first.coordinate < second.coordinate).toBe(true);
  });

  it('should publish and subscribe events through the Event Bus', async () => {
    const services = createDefaultCoreServices();
    const receivedEvents: unknown[] = [];

    services.eventBus.subscribe('test.event', (event) => {
      receivedEvents.push(event.payload);
    });

    await services.eventBus.publish({
      type: 'test.event',
      payload: { value: 42 },
      timestamp: services.timeCore.record({ value: 42 }, 'test.event', 1).coordinate,
    });

    expect(receivedEvents).toEqual([{ value: 42 }]);
  });

  it('should resolve identities by handle and alias', () => {
    const services = createDefaultCoreServices();
    const profile = services.identityCore.registerIdentity({
      kind: 'user',
      handle: 'so8fi',
      alias: 'architect',
    });

    expect(profile.id).toBeGreaterThan(0);
    expect(profile.kind).toBe('user');

    const resolvedByHandle = services.identityCore.resolveIdentity('so8fi');
    expect(resolvedByHandle?.matchedBy).toBe('handle');
    expect(resolvedByHandle?.identity.id).toBe(profile.id);

    const resolvedByAlias = services.identityCore.resolveIdentity('architect');
    expect(resolvedByAlias?.matchedBy).toBe('alias');
    expect(resolvedByAlias?.identity.id).toBe(profile.id);
  });

  it('should build navigation URLs by numeric id', () => {
    const services = createDefaultCoreServices();
    const target = services.navigationCore.resolveTarget('user', 10, 'SO8FI');

    expect(target.routePath).toContain('/user/10/');
    expect(services.navigationCore.buildUrl(target)).toBe(target.routePath);
  });
});
