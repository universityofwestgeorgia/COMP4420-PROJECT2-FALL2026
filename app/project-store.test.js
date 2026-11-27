const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { openProjectStore } = require('./project-store');

test('saves and lists projects in creation order', async () => {
	const store = await openProjectStore(':memory:');
	try {
		const first = await store.addProject({ name: 'First', baseUrl: 'https://first.example' });
		const second = await store.addProject({ name: 'Second', baseUrl: 'https://second.example' });
		assert.equal(first.baseUrl, 'https://first.example');
		assert.equal((await store.getProject(first.id)).name, 'First');
		assert.deepEqual((await store.listProjects()).map((project) => project.id), [second.id, first.id]);
		assert.equal(await store.getProject(999), null);
	} finally {
		await store.close();
	}
});

test('rejects a duplicate project URL', async () => {
	const store = await openProjectStore(':memory:');
	try {
		await store.addProject({ name: 'First', baseUrl: 'https://example.com' });
		await assert.rejects(
			store.addProject({ name: 'Second', baseUrl: 'https://EXAMPLE.com/' }),
			/already exists/i
		);
		assert.equal((await store.listProjects()).length, 1);
	} finally {
		await store.close();
	}
});

test('keeps projects after the database is reopened', async () => {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'project2-store-'));
	const databasePath = path.join(directory, 'monitor.db');
	let store;
	try {
		store = await openProjectStore(databasePath);
		await store.addProject({ name: 'Saved site', baseUrl: 'https://saved.example' });
		await store.close();
		store = null;
		store = await openProjectStore(databasePath);
		assert.equal((await store.listProjects())[0].name, 'Saved site');
	} finally {
		if (store) await store.close();
		fs.rmSync(directory, { recursive: true, force: true });
	}
});
