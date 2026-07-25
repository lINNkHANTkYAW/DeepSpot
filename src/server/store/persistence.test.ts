import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createStore } from './index';
import { persistAppStore } from './persistence';

test('persists app state to disk and reloads it', async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'deepspot-store-'));
  const storeFile = path.join(tempDir, 'store.json');

  process.env.DEEP_SPOT_STORE_PATH = storeFile;

  const store = await createStore();
  const firstUserId = Object.keys(store.users)[0];
  const user = store.users[firstUserId];
  if (user) {
    user.displayName = 'Persisted User';
  }
  store.posts[0] = { ...store.posts[0], caption: 'Updated caption' } as any;

  persistAppStore(store);

  assert.ok(fs.existsSync(storeFile), 'store file should be created');

  const reloadedStore = await createStore();
  const reloadedUser = reloadedStore.users[Object.keys(reloadedStore.users)[0]];

  assert.equal(reloadedUser?.displayName, 'Persisted User');
  assert.equal(reloadedStore.posts[0].caption, 'Updated caption');
});
