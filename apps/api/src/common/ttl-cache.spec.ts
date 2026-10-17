import { TtlCache } from './ttl-cache';

describe('TtlCache', () => {
  it('serves cached values until they expire, then reloads', async () => {
    let clock = 0;
    const cache = new TtlCache<number>(1000, () => clock);
    const load = jest.fn().mockResolvedValueOnce(1).mockResolvedValueOnce(2);

    expect(await cache.get(load)).toBe(1);
    clock = 999;
    expect(await cache.get(load)).toBe(1);
    clock = 1000;
    expect(await cache.get(load)).toBe(2);
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('loads once for concurrent callers and reloads after invalidate', async () => {
    const cache = new TtlCache<string>(60_000);
    const load = jest.fn().mockResolvedValue('x');
    await Promise.all([cache.get(load), cache.get(load), cache.get(load)]);
    expect(load).toHaveBeenCalledTimes(1);
    cache.invalidate();
    await cache.get(load);
    expect(load).toHaveBeenCalledTimes(2);
  });
});
