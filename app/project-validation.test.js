const test = require('node:test');
const assert = require('node:assert/strict');
const { validateProject } = require('./project-validation');

test('normalizes a project name and site URL', () => {
	assert.deepEqual(
		validateProject({ name: '  My Site  ', baseUrl: ' HTTPS://Example.COM/ ' }),
		{ name: 'My Site', baseUrl: 'https://example.com' }
	);
});

test('accepts a local development server with a port', () => {
	assert.deepEqual(
		validateProject({ name: 'Local', baseUrl: 'http://localhost:8080' }),
		{ name: 'Local', baseUrl: 'http://localhost:8080' }
	);
});

test('rejects missing or overly long project names', () => {
	assert.throws(() => validateProject({ name: ' ', baseUrl: 'https://example.com' }), /name/i);
	assert.throws(() => validateProject({ name: 'x'.repeat(81), baseUrl: 'https://example.com' }), /name/i);
});

test('rejects invalid and non-HTTP URLs', () => {
	assert.throws(() => validateProject({ name: 'Site', baseUrl: 'not a URL' }), /valid project URL/i);
	assert.throws(() => validateProject({ name: 'Site', baseUrl: 'file:///tmp/data' }), /HTTP or HTTPS/i);
});

test('rejects credentials, paths, queries, and fragments in a base URL', () => {
	for (const baseUrl of [
		'https://user:pass@example.com',
		'https://example.com/private',
		'https://example.com/?token=secret',
		'https://example.com/#section'
	]) {
		assert.throws(() => validateProject({ name: 'Site', baseUrl }), /only the site address/i);
	}
});

test('rejects a duplicate normalized site URL', () => {
	assert.throws(
		() => validateProject(
			{ name: 'Second', baseUrl: 'https://EXAMPLE.com/' },
			[{ baseUrl: 'https://example.com' }]
		),
		/already exists/i
	);
});
