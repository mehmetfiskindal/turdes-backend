import { sanitizeBody } from './audit-log.interceptor';

describe('sanitizeBody', () => {
  it('removes sensitive top-level keys', () => {
    const input = {
      email: 'test@example.com',
      password: 'secret',
      token: 'abc',
      nested: { refreshToken: 'xyz', keep: 'ok' },
    };
    const out = sanitizeBody(input);
    expect(out.password).toBeUndefined();
    expect(out.token).toBeUndefined();
    expect(out.nested.refreshToken).toBeUndefined();
    expect(out.nested.keep).toBe('ok');
  });

  it('handles arrays', () => {
    const input = [
      { password: 'a', value: 1 },
      { refreshToken: 'b', value: 2 },
    ];
    const out = sanitizeBody(input) as any[];
    expect(out[0].password).toBeUndefined();
    expect(out[0].value).toBe(1);
    expect(out[1].refreshToken).toBeUndefined();
    expect(out[1].value).toBe(2);
  });

  it('returns primitives unchanged', () => {
    expect(sanitizeBody('str')).toBe('str');
    expect(sanitizeBody(5)).toBe(5);
    expect(sanitizeBody(null)).toBeNull();
  });
});
