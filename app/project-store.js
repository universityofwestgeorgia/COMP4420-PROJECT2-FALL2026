const fs = require('node:fs');
const path = require('node:path');
const sqlite3 = require('sqlite3');
const { validateProject } = require('./project-validation');
const { validateRoute, RouteValidationError } = require('./route-validation');

const listProjectsQuery = 'SELECT id, name, base_url AS baseUrl, created_at AS createdAt FROM projects ORDER BY id DESC';
const getProjectQuery = 'SELECT id, name, base_url AS baseUrl, created_at AS createdAt FROM projects WHERE id = ?';
const insertProjectQuery = 'INSERT INTO projects (name, base_url) VALUES (?, ?)';
const listRoutesQuery = 'SELECT id, project_id AS projectId, path, expected_status AS expectedStatus, max_response_ms AS maxResponseMs, created_at AS createdAt FROM routes WHERE project_id = ? ORDER BY id';
const insertRouteQuery = 'INSERT INTO routes (project_id, path, expected_status, max_response_ms) VALUES (?, ?, ?, ?)';
const getRouteQuery = 'SELECT id, project_id AS projectId, path, expected_status AS expectedStatus, max_response_ms AS maxResponseMs, created_at AS createdAt FROM routes WHERE id = ?';

/**
 * Opens the project database and creates its schema if necessary.
 *
 * @param {string} databasePath SQLite file path, or `:memory:` for tests.
 * @returns {Promise<object>} Operations for saving and retrieving projects.
 */
async function openProjectStore(databasePath = path.join(__dirname, 'data', 'monitor.db')) {
	if (databasePath !== ':memory:') {
		fs.mkdirSync(path.dirname(databasePath), { recursive: true });
	}

	const db = await new Promise((resolve, reject) => {
		const connection = new sqlite3.Database(databasePath, (error) => {
			if (error) reject(error);
			else resolve(connection);
		});
	});

	const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
	await new Promise((resolve, reject) => {
		db.exec(schema, (error) => error ? reject(error) : resolve());
	});

	/** Returns all projects, newest first. */
	function listProjects() {
		return new Promise((resolve, reject) => {
			db.all(listProjectsQuery, (error, rows) => error ? reject(error) : resolve(rows));
		});
	}

	/** Returns one project, or null when its identifier does not exist. */
	function getProject(identifier) {
		const id = Number(identifier);
		if (!Number.isSafeInteger(id) || id < 1) return Promise.resolve(null);

		return new Promise((resolve, reject) => {
			db.get(getProjectQuery, [id], (error, row) => error ? reject(error) : resolve(row || null));
		});
	}

	/** Validates and saves a project, then returns its saved record. */
	async function addProject(input) {
		const existingProjects = await listProjects();
		const project = validateProject(input, existingProjects);
		const id = await new Promise((resolve, reject) => {
			db.run(insertProjectQuery, [project.name, project.baseUrl], function (error) {
				if (error) reject(error);
				else resolve(this.lastID);
			});
		});
		return getProject(id);
	}

	/** Returns the routes saved under one project, in creation order. */
	function listRoutes(projectIdentifier) {
		const projectId = Number(projectIdentifier);
		if (!Number.isSafeInteger(projectId) || projectId < 1) return Promise.resolve([]);
		return new Promise((resolve, reject) => {
			db.all(listRoutesQuery, [projectId], (error, rows) => error ? reject(error) : resolve(rows));
		});
	}

	/** Validates and saves a GET route under an existing project. */
	async function addRoute(projectIdentifier, input) {
		const project = await getProject(projectIdentifier);
		if (!project) throw new RouteValidationError('Project not found.');
		const existingRoutes = await listRoutes(project.id);
		const route = validateRoute(input, existingRoutes);
		const id = await new Promise((resolve, reject) => {
			db.run(insertRouteQuery,
				[project.id, route.path, route.expectedStatus, route.maxResponseMs],
				function (error) {
					if (error) reject(error);
					else resolve(this.lastID);
				});
		});
		return new Promise((resolve, reject) => {
			db.get(getRouteQuery, [id], (error, row) => error ? reject(error) : resolve(row));
		});
	}

	/** Closes the database after use. */
	function close() {
		return new Promise((resolve, reject) => {
			db.close((error) => error ? reject(error) : resolve());
		});
	}

	return { listProjects, getProject, addProject, listRoutes, addRoute, close };
}

module.exports = { openProjectStore };
