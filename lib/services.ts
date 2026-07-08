import { createDefaultInfrastructureServices } from '../infrastructure/factory';

const services = createDefaultInfrastructureServices();

if (services.identityCore.listIdentities().length === 0) {
  services.identityCore.registerIdentity({
    kind: 'user',
    handle: 'so8fi',
    alias: 'superuser',
  });
}

// Seed sample data once in the service layer
if (services.catalog.listCategories().length === 0) {
  const categories = [
    services.catalog.registerCategory('Products'),
    services.catalog.registerCategory('Services'),
    services.catalog.registerCategory('Marketplace'),
  ];

  services.catalog.registerObject({
    parentId: categories[0].id,
    kind: 'product',
    title: 'Mobile Phone',
    description: 'High-performance mobile device with modern features.',
    categoryId: categories[0].id,
    status: 'published',
    visibility: 'public',
  });

  services.catalog.registerObject({
    parentId: categories[0].id,
    kind: 'product',
    title: 'Wireless Headphones',
    description: 'Noise-cancelling audio headset for music and calls.',
    categoryId: categories[0].id,
    status: 'published',
    visibility: 'public',
  });

  services.catalog.registerObject({
    parentId: categories[1].id,
    kind: 'service',
    title: 'Business Consulting',
    description: 'Expert advisory services for operational scaling.',
    categoryId: categories[1].id,
    status: 'published',
    visibility: 'public',
  });

  services.catalog.registerObject({
    parentId: categories[1].id,
    kind: 'service',
    title: 'Design Workshop',
    description: 'Creative design and product strategy sessions.',
    categoryId: categories[1].id,
    status: 'published',
    visibility: 'public',
  });

  const marketplaceListing = services.catalog.registerObject({
    parentId: categories[2].id,
    kind: 'marketplace_listing',
    title: 'Shared Workspace',
    description: 'Bookable shared office location for teams.',
    categoryId: categories[2].id,
    status: 'published',
    visibility: 'public',
  });

  services.marketplace
    .createListing(1, {
      title: 'Shared Workspace',
      description: 'Flexible coworking space with high-speed internet.',
      categoryId: marketplaceListing.categoryId,
      price: 200,
    }, { userId: 1, sessionId: 1, containerId: 0, moduleId: 0 })
    .catch(() => {});
}

if (services.walletRegistry.listWallets().length === 0) {
  const wallet = services.walletRegistry.createWallet(1, 'USD');
  services.balanceEngine.adjust(wallet.id, { available: 1200, pending: 100 });
}

export const catalogApi = new CatalogApi(services.catalog);
export const marketplaceApi = services.marketplaceApi;
export const financeApi = services.financeApi;
export const identityCore = services.identityCore;
export const coreServices = services;
