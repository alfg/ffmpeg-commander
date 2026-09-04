import { describe, it, expect, beforeEach, vi } from 'vitest';
import storage from '@/lib/storage';
import presets from '@/lib/presets';
import { makeForm } from './fixtures/form';

// Characterization tests for the localStorage layer.
//
// The key names are a compatibility contract: users have saved presets and
// queued jobs under them today, so the port must read the same keys or people
// lose their data on first load.

const PRESETS_KEY = 'presets';
const QUEUE_KEY = 'queue';

beforeEach(() => localStorage.clear());

describe('localStorage keys', () => {
  it('saves user presets under the "presets" key', () => {
    presets.savePresetToLocalStorage('', '', makeForm() as never);
    expect(Object.keys(localStorage)).toEqual([PRESETS_KEY]);
  });

  it('stores the encode queue under the "queue" key', () => {
    storage.setItem(QUEUE_KEY, [{ id: 1 }]);
    storage.add(QUEUE_KEY, { id: 2 } as never);
    expect(storage.getAll(QUEUE_KEY)).toEqual([{ id: 1 }, { id: 2 }]);
  });
});

describe('storage.add', () => {
  it('appends to an existing array', () => {
    storage.setItem(QUEUE_KEY, [{ id: 1 }]);
    storage.add(QUEUE_KEY, { id: 2 } as never);
    expect(storage.getAll(QUEUE_KEY)).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it('creates the array when the key does not exist yet', () => {
    // The push used to sit inside `if (item)`, so the first item added to a
    // missing key was dropped and an empty array written in its place.
    storage.add(QUEUE_KEY, { id: 1 } as never);
    expect(storage.getAll(QUEUE_KEY)).toEqual([{ id: 1 }]);

    storage.add(QUEUE_KEY, { id: 2 } as never);
    expect(storage.getAll(QUEUE_KEY)).toEqual([{ id: 1 }, { id: 2 }]);
  });
});

describe('storage accessors', () => {
  it('getItem returns null for a missing key, getItems returns []', () => {
    expect(storage.getItem('nope')).toBeNull();
    expect(storage.getItems('nope')).toEqual([]);
    expect(storage.getAll('nope')).toEqual([]);
  });

  it('round-trips JSON through setItem/getItem', () => {
    storage.setItem('k', { a: 1, b: [2, 3] });
    expect(storage.getItem('k')).toEqual({ a: 1, b: [2, 3] });
  });

  it('updates status, error and detail flags by id', () => {
    storage.setItem(QUEUE_KEY, [{ id: 1, status: 'queued', _showDetails: false }]);
    expect(storage.updateStatus(QUEUE_KEY, 1, 'running')?.status).toBe('running');
    expect(storage.setError(QUEUE_KEY, 1, 'boom')?.error).toBe('boom');
    // eslint-disable-next-line no-underscore-dangle
    expect(storage.toggleDetails(QUEUE_KEY, 1, true)?._showDetails).toBe(true);
    expect(storage.getAll(QUEUE_KEY)[0])
      .toEqual({
        id: 1, status: 'running', error: 'boom', _showDetails: true,
      });
  });

  it('deleteAll removes the key', () => {
    storage.setItem(QUEUE_KEY, [{ id: 1 }]);
    storage.deleteAll(QUEUE_KEY);
    expect(localStorage.getItem(QUEUE_KEY)).toBeNull();
  });
});

describe('preset persistence', () => {
  it('names a new saved preset "preset-<ISO timestamp>"', () => {
    const name = presets.savePresetToLocalStorage('', '', makeForm() as never);
    expect(name).toMatch(/^preset-\d{4}-\d{2}-\d{2}T[\d:.]+Z$/);

    const saved = storage.getItems<{ name: string; value: string }>(PRESETS_KEY);
    expect(saved).toHaveLength(1);
    expect(saved[0].value).toBe(name);
  });

  it('updates an existing preset in place when a name is supplied', () => {
    const name = presets.savePresetToLocalStorage('', '', makeForm() as never);
    presets.savePresetToLocalStorage(name, 'My Preset', makeForm({ video: { codec: 'x265' } }) as never);

    const saved = storage.getItems<{ name: string; value: string; data: never }>(PRESETS_KEY);
    expect(saved).toHaveLength(1);
    expect(saved[0].name).toBe('My Preset');
    expect((saved[0].data as { video: { codec: string } }).video.codec).toBe('x265');
  });

  it('surfaces saved presets in the "saved" option group', () => {
    const name = presets.savePresetToLocalStorage('', '', makeForm() as never);
    const saved = presets.getPresetOptions().find((o) => o.id === 'saved');
    expect(saved?.data.map((p) => p.value)).toEqual([name]);
  });

  it('deletePreset removes one, deleteAllPresets clears the key', () => {
    // Preset ids are derived from the clock, so pin it to keep them distinct.
    const iso = vi.spyOn(Date.prototype, 'toISOString');
    iso.mockReturnValueOnce('2026-01-01T00:00:00.000Z');
    iso.mockReturnValueOnce('2026-01-01T00:00:01.000Z');

    const a = presets.savePresetToLocalStorage('', '', makeForm() as never);
    const b = presets.savePresetToLocalStorage('', '', makeForm() as never);
    expect(a).not.toBe(b);

    presets.deletePreset(a);
    expect(storage.getItems<{ value: string }>(PRESETS_KEY).map((p) => p.value)).toEqual([b]);

    presets.deleteAllPresets();
    expect(localStorage.getItem(PRESETS_KEY)).toBeNull();
    iso.mockRestore();
  });

  it('KNOWN BUG: two presets saved in the same millisecond share an id', () => {
    // The id is `preset-${new Date().toISOString()}` with no uniqueness check,
    // so colliding entries are indistinguishable and deleting one deletes both.
    // Only reachable via two saves inside a single millisecond, so this is a
    // latent defect rather than something users are hitting today.
    const iso = vi.spyOn(Date.prototype, 'toISOString')
      .mockReturnValue('2026-01-01T00:00:00.000Z');

    const a = presets.savePresetToLocalStorage('', '', makeForm() as never);
    const b = presets.savePresetToLocalStorage('', '', makeForm() as never);
    expect(a).toBe(b);
    expect(storage.getItems(PRESETS_KEY)).toHaveLength(2);

    presets.deletePreset(a);
    expect(storage.getItems(PRESETS_KEY)).toHaveLength(0);
    iso.mockRestore();
  });
});
