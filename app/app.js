const path = require('node:path');
const express = require('express');
const { openProjectStore } = require('./project-store');
const { ProjectValidationError } = require('./project-validation');

/** Creates the web routes using the supplied project store. */
function createApp(store) {
	const app = express();
	app.set('view engine', 'ejs');
	app.set('views', path.join(__dirname, 'views'));
	app.use(express.urlencoded({ extended: false }));

	app.get('/', async function (req, res, next) {
		try {
			res.render('page/landing', { projects: await store.listProjects(), error: null });
		} catch (error) {
			next(error);
		}
	});

	app.post('/projects', async function (req, res, next) {
		try {
			await store.addProject(req.body);
			res.redirect('/');
		} catch (error) {
			if (!(error instanceof ProjectValidationError)) return next(error);
			try {
				res.status(400).render('page/landing', {
					projects: await store.listProjects(),
					error: error.message
				});
			} catch (listError) {
				next(listError);
			}
		}
	});

	app.get('/projects/:id', async function (req, res, next) {
		try {
			const project = await store.getProject(req.params.id);
			if (!project) return res.status(404).send('Project not found.');
			res.render('page/project', { project });
		} catch (error) {
			next(error);
		}
	});

	return app;
}

/** Opens the database before accepting web requests. */
async function start() {
	const store = await openProjectStore();
	const port = process.env.PORT || 8080;
	createApp(store).listen(port, function () {
		console.log(`App listening on port ${port}!`);
	});
}

if (require.main === module) {
	start().catch((error) => {
		console.error(error);
		process.exitCode = 1;
	});
}

module.exports = { createApp };
