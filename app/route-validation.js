class RouteValidationError extends Error {}

/**
 * Validates a GET route's path, expected status, and response time limit.
 *
 * @param {{path: string, expectedStatus: string, maxResponseMs: string}} input Form values.
 * @param {Array<{path: string}>} existingRoutes Routes already saved for the project.
 * @returns {{path: string, expectedStatus: number, maxResponseMs: number}} Values for storage.
 * @throws {RouteValidationError} When a value is invalid or the path already exists.
 */
function validateRoute(input, existingRoutes = []) {
	const routePath = typeof input?.path === 'string' ? input.path.trim() : '';
	if (!routePath.startsWith('/') || routePath.startsWith('//') || routePath.length > 500 ||
		routePath.includes('\\') || routePath.includes('#') || /\s/.test(routePath)) {
		throw new RouteValidationError('Enter a path starting with /, without spaces or a fragment.');
	}

	let parsedPath;
	try {
		parsedPath = new URL(routePath, 'https://example.invalid');
	} catch {
		throw new RouteValidationError('Enter a valid route path.');
	}
	if (parsedPath.origin !== 'https://example.invalid') {
		throw new RouteValidationError('Enter a route path, not a full URL.');
	}
	const normalizedPath = parsedPath.pathname + parsedPath.search;
	if (existingRoutes.some((route) => route.path === normalizedPath)) {
		throw new RouteValidationError('This route already exists in the project.');
	}

	const statusText = input?.expectedStatus === undefined || input.expectedStatus === ''
		? '200' : String(input.expectedStatus);
	if (!/^\d{3}$/.test(statusText) || Number(statusText) < 100 || Number(statusText) > 599) {
		throw new RouteValidationError('Expected HTTP status must be between 100 and 599.');
	}

	const timeText = String(input?.maxResponseMs ?? '');
	if (!/^\d+$/.test(timeText) || Number(timeText) < 1 || Number(timeText) > 60000) {
		throw new RouteValidationError('Maximum response time must be between 1 and 60000 ms.');
	}

	return {
		path: normalizedPath,
		expectedStatus: Number(statusText),
		maxResponseMs: Number(timeText)
	};
}

module.exports = { validateRoute, RouteValidationError };
