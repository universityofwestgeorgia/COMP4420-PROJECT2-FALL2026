const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { openProjectStore } = require('./project-store');

test('saves routes under their own projects', async () => {
	const store = await openProjectStore(':memory:');
	try {
		const firstProject = await store.addProject({ name: 'First', baseUrl: 'https://first.example' });
		const secondProject = await store.addProject({ name: 'Second', baseUrl: 'https://second.example' });
		const firstRoute = await store.addRoute(firstProject.id, {
			path: '/health', expectedStatus: '200', maxResponseMs: '500'
		});
		await store.addRoute(secondProject.id, {
			path: '/health', expectedStatus: '204', maxResponseMs: '1000'
		});

		assert.equal(firstRoute.projectId, firstProject.id);
		assert.equal(firstRoute.expectedStatus, 200);
		assert.equal((await store.listRoutes(firstProject.id)).length, 1);
		assert.equal((await store.listRoutes(secondProject.id))[0].expectedStatus, 204);
	} finally {
		await store.close();
	}
});

test('rejects duplicate routes and a missing project', async () => {
	const store = await openProjectStore(':memory:');
	try {
		const project = await store.addProject({ name: 'Site', baseUrl: 'https://site.example' });
		const route = { path: '/', maxResponseMs: '5000' };
		await store.addRoute(project.id, route);
		await assert.rejects(store.addRoute(project.id, route), /route already exists/i);
		await assert.rejects(store.addRoute(999, route), /Project not found/i);
		assert.equal((await store.listRoutes(project.id)).length, 1);
	} finally {
		await store.close();
	}
});

test('keeps routes after reopening the SQLite file', async () => {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'project2-routes-'));
	const databasePath = path.join(directory, 'monitor.db');
	let store;
	try {
		store = await openProjectStore(databasePath);
		const project = await store.addProject({ name: 'Saved', baseUrl: 'https://saved.example' });
		await store.addRoute(project.id, { path: '/api/health', maxResponseMs: '750' });
		await store.close();
		store = null;
		store = await openProjectStore(databasePath);
		const routes = await store.listRoutes(project.id);
		assert.equal(routes[0].path, '/api/health');
		assert.equal(routes[0].maxResponseMs, 750);
	} finally {
		if (store) await store.close();
		fs.rmSync(directory, { recursive: true, force: true });
	}
});
