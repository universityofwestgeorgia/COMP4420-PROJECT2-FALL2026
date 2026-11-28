-- Project records persist across server restarts.
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 80),
    base_url TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

PRAGMA foreign_keys = ON;

-- Each route belongs to one project and is checked with a GET request.
CREATE TABLE IF NOT EXISTS routes (
    id INTEGER PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    path TEXT NOT NULL,
    expected_status INTEGER NOT NULL CHECK (expected_status BETWEEN 100 AND 599),
    max_response_ms INTEGER NOT NULL CHECK (max_response_ms BETWEEN 1 AND 60000),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (project_id, path)
);
