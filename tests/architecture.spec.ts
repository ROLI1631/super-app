import { createDefaultCoreServices } from '../core/factory';
import { createDefaultInfrastructureServices } from '../infrastructure/factory';

describe('Architecture layering', () => {
  it('keeps core services free of business engines', () => {
    const core = createDefaultCoreServices();

    expect(core).toHaveProperty('journal');
    expect(core).toHaveProperty('eventBus');
    expect(core).toHaveProperty('timeCore');
    expect(core).not.toHaveProperty('catalog');
    expect(core).not.toHaveProperty('marketplace');
    expect(core).not.toHaveProperty('walletRegistry');
  });

  it('composes engines and modules through infrastructure', () => {
    const runtime = createDefaultInfrastructureServices();

    expect(runtime).toHaveProperty('catalog');
    expect(runtime).toHaveProperty('marketplace');
    expect(runtime).toHaveProperty('apiGateway');
    expect(runtime).toHaveProperty('walletRegistry');
  });
});
