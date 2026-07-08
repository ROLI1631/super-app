import { createHash } from 'crypto';
import { So8fiCodeEngine, So8fiDecodedOutput, So8fiEncodeInput } from './so8fiCodeEngine';

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b));
  return `{${entries.map(([key, val]) => `${JSON.stringify(key)}:${stableStringify(val)}`).join(',')}}`;
}

function toBase64Url(content: string): string {
  return Buffer.from(content, 'utf8').toString('base64url');
}

function fromBase64Url(content: string): string {
  return Buffer.from(content, 'base64url').toString('utf8');
}

export class DefaultSo8fiCodeEngine implements So8fiCodeEngine {
  constructor(private readonly version = 'SO8FI-CODE.v1') {}

  encode(input: So8fiEncodeInput): string {
    const canonicalPayload = stableStringify(input.payload);
    const hash = createHash('sha256')
      .update(`${input.identityId}|${input.coordinate}|${input.protocol}|${input.kind}|${canonicalPayload}`)
      .digest('hex');

    const envelope = {
      v: this.version,
      i: input.identityId,
      c: input.coordinate,
      p: input.protocol,
      k: input.kind,
      h: hash,
      d: input.payload,
    };

    return `SO8FI.${toBase64Url(JSON.stringify(envelope))}`;
  }

  decode(code: string): So8fiDecodedOutput {
    if (!code.startsWith('SO8FI.')) {
      throw new Error('Invalid SO8FI code prefix');
    }

    const payload = code.slice('SO8FI.'.length);
    const decoded = JSON.parse(fromBase64Url(payload)) as {
      readonly v: string;
      readonly i: number;
      readonly c: string;
      readonly p: string;
      readonly k: So8fiDecodedOutput['kind'];
      readonly h: string;
      readonly d: unknown;
    };

    return {
      version: decoded.v,
      identityId: decoded.i,
      coordinate: decoded.c,
      protocol: decoded.p,
      kind: decoded.k,
      hash: decoded.h,
      payload: decoded.d,
    };
  }

  isValid(code: string): boolean {
    try {
      const decoded = this.decode(code);
      const expectedHash = createHash('sha256')
        .update(
          `${decoded.identityId}|${decoded.coordinate}|${decoded.protocol}|${decoded.kind}|${stableStringify(decoded.payload)}`,
        )
        .digest('hex');

      return expectedHash === decoded.hash;
    } catch {
      return false;
    }
  }
}
