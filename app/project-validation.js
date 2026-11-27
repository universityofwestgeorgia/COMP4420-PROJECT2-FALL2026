/**
 * Validates and normalizes a project before it is saved.
 *
 * @param {{name: string, baseUrl: string}} input Project values from a form.
 * @param {Array<{baseUrl: string}>} existingProjects Previously saved projects.
 * @returns {{name: string, baseUrl: string}} Normalized project values.
 * @throws {Error} When a required value is missing, invalid, or duplicated.
 */
function validateProject(input, existingProjects = []) {
	const name = typeof input?.name === 'string' ? input.name.trim() : '';
	if (name.length === 0 || name.length > 80) {
		throw new Error('Project name must be between 1 and 80 characters.');
	}

	const rawUrl = typeof input?.baseUrl === 'string' ? input.baseUrl.trim() : '';
	let url;
	try {
		url = new URL(rawUrl);
	} catch {
		throw new Error('Enter a valid project URL.');
	}

	if (!['http:', 'https:'].includes(url.protocol)) {
		throw new Error('Project URL must use HTTP or HTTPS.');
	}
	if (url.username || url.password || url.search || url.hash || url.pathname !== '/') {
		throw new Error('Project URL must contain only the site address and optional port.');
	}

	const baseUrl = url.origin;
	if (existingProjects.some((project) => project.baseUrl === baseUrl)) {
		throw new Error('A project with this URL already exists.');
	}

	return { name, baseUrl };
}

module.exports = { validateProject };
