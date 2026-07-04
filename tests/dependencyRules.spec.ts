import fs from 'fs';
import path from 'path';

describe('Architecture dependency rules', () => {
  const root = path.resolve(__dirname, '..');
  const forbiddenPairs = [
    { from: 'core', to: 'app' },
    { from: 'core', to: 'components' },
    { from: 'core', to: 'modules' },
    { from: 'app', to: 'infrastructure' },
    { from: 'modules', to: 'infrastructure' },
    { from: 'engines', to: 'app' },
    { from: 'engines', to: 'modules' },
  ];

  function walk(dir: string, files: string[] = []): string[] {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name === '.next') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full, files);
      } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
        files.push(full);
      }
    }
    return files;
  }

  it('keeps core imports away from app, components, and modules', () => {
    const files = walk(root);
    const violations: string[] = [];

    files.forEach((file) => {
      const content = fs.readFileSync(file, 'utf8');
      const rel = path.relative(root, file).replace(/\\/g, '/');
      if (!rel.startsWith('core/')) return;

      forbiddenPairs.filter((pair) => pair.from === 'core').forEach((pair) => {
        if (content.includes(`'${pair.to}/`) || content.includes(`"${pair.to}/`)) {
          violations.push(`${rel} -> ${pair.to}`);
        }
      });
    });

    expect(violations).toEqual([]);
  });

  it('keeps app and modules from importing infrastructure directly', () => {
    const files = walk(root);
    const violations: string[] = [];

    files.forEach((file) => {
      const content = fs.readFileSync(file, 'utf8');
      const rel = path.relative(root, file).replace(/\\/g, '/');
      if (rel.startsWith('app/') || rel.startsWith('modules/') || rel.startsWith('components/')) {
        if (content.includes("from '../infrastructure") || content.includes("from '../../infrastructure") || content.includes("from './infrastructure")) {
          violations.push(rel);
        }
      }
    });

    expect(violations).toEqual([]);
  });
});
