# Project 2: Endpoint Monitor

## Purpose

Build a small Node.js web application that checks whether selected pages and API routes on the student's own sites respond as expected. The project replaces the original Container Deck concept with the new monitoring idea discussed with the instructor.

## Two-page flow

1. **Projects page (`/`)**: list saved projects and add a project with a name and base URL. Selecting a project opens its detail page.
2. **Project detail page (`/projects/:id`)**: list that project's routes with the latest response time, expected response time, and pass/fail status. Add a route and run its check.

Each route is a relative path under its project's base URL, such as `/`, `/api/health`, or `/about`. The first version checks GET requests. For each route, store an expected HTTP status (default `200`) and a maximum response time in milliseconds. A check passes only when it receives the expected status within the configured time. Timeouts, network errors, wrong status codes, and slow responses are failures with a visible explanation.

## Persistence and access

Use one local SQLite database for projects, routes, and the latest check result. Closing the browser does not erase the list; restarting the Node.js process reads it again. The MVP has no user accounts, so everyone who can access the deployed app sees the same data.

For the class demonstration, use only public routes on the student's own sites and avoid credentials or private URLs. An openly accessible version would also let visitors change the shared list unless editing access is restricted; this is a known limitation to resolve before a longer-lived public deployment.

## MVP boundary

- Checks run when the user requests them; continuous scheduling is a later enhancement.
- Show only the latest result for each route; historical charts are a later enhancement.
- No login, container control, Docker integration, or deployment automation is required for this MVP.
- The app must run with documented Node.js commands on the student's computer and in the course VLab environment.

## Verification targets

- A reachable route on one of the student's sites returns the expected status.
- A missing route reports the unexpected status.
- A stopped or unreachable site reports a connection error or timeout.
- A route slower than its configured threshold reports a failure.
- Saved projects and routes remain after restarting the app.
