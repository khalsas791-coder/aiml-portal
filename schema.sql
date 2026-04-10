-- Table for events
CREATE TABLE events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    image_path TEXT
);

-- Table for student projects
CREATE TABLE projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_name TEXT,
    project_title TEXT,
    description TEXT,
    github_link TEXT
);