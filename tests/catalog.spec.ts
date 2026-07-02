import { createDefaultCoreServices } from '../core/factory';

describe('Catalog Engine', () => {
  it('registers categories and objects, supports search and attribute discovery', () => {
    const services = createDefaultCoreServices();

    const cat = services.catalog.registerCategory('vehicles');
    const sub = services.catalog.registerCategory('cars', cat.id);

    const car = services.catalog.registerObject({
      parentId: undefined,
      categoryId: sub.id,
      subcategoryId: undefined,
      containerId: undefined,
      kind: 'vehicle',
      title: 'Red Sport Car',
      description: 'A fast red automobile',
      country: 'US',
      language: 'en',
      visibility: 'public',
      status: 'published',
      ownerId: 1,
      attributes: { brand: 'Speedster', horsepower: 420, doors: 2 },
    });

    const found = services.catalog.findById(car.id);
    expect(found).toBeDefined();
    expect(found?.title).toBe('Red Sport Car');

    const byCat = services.catalog.findByCategory(sub.id);
    expect(byCat.length).toBeGreaterThanOrEqual(1);

    const attrs = services.catalog.discoverAttributes(sub.id);
    expect(attrs).toContain('brand');

    const results = services.catalog.search('fast red', 'en');
    expect(results.length).toBeGreaterThanOrEqual(1);
  });
});
