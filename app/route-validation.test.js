const test = require('node:test');
const assert = require('node:assert/strict');
const { validateRoute, RouteValidationError } = require('./route-validation');

test('accepts a route path with a query and default expected status', () => {
	assert.deepEqual(
		validateRoute({ path: ' /api/health?check=1 ', maxResponseMs: '5000' }),
		{ path: '/api/health?check=1', expectedStatus: 200, maxResponseMs: 5000 }
	);
});

test('accepts an explicit expected status and a root path', () => {
	assert.deepEqual(
		validateRoute({ path: '/', expectedStatus: '404', maxResponseMs: '250' }),
		{ path: '/', expectedStatus: 404, maxResponseMs: 250 }
	);
});

test('rejects absolute URLs, protocol-relative URLs, spaces, fragments, and backslashes', () => {
	for (const path of ['https://example.com/', '//example.com/', '/bad path', '/about#part', '/bad\\path', 'about']) {
		assert.throws(() => validateRoute({ path, maxResponseMs: '1000' }), RouteValidationError);
	}
});

test('rejects duplicate paths only within the selected project', () => {
	assert.throws(
		() => validateRoute({ path: '/about', maxResponseMs: '1000' }, [{ path: '/about' }]),
		/route already exists/i
	);
});

test('rejects invalid status codes and response time limits', () => {
	for (const expectedStatus of ['99', '600', '200.5', 'oops']) {
		assert.throws(() => validateRoute({ path: '/', expectedStatus, maxResponseMs: '1000' }), /HTTP status/);
	}
	for (const maxResponseMs of ['0', '60001', '1.5', 'oops', '']) {
		assert.throws(() => validateRoute({ path: '/', maxResponseMs }), /response time/);
	}
});
