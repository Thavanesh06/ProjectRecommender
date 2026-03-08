CREATE DATABASE IF NOT EXISTS project_recommender;
USE project_recommender;

CREATE TABLE IF NOT EXISTS projects (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    skills      TEXT NOT NULL,
    domain      VARCHAR(100) NOT NULL,
    difficulty  ENUM('Beginner', 'Intermediate', 'Advanced') NOT NULL,
    tags        VARCHAR(500),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    skills      TEXT,
    interests   TEXT,
    level       ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Beginner',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recommendations (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    student_id       INT,
    project_id       INT,
    similarity_score FLOAT,
    recommended_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS feedback (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    student_id  INT,
    project_id  INT,
    rating      TINYINT CHECK (rating BETWEEN 1 AND 5),
    comment     TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX idx_projects_domain     ON projects(domain);
CREATE INDEX idx_projects_difficulty ON projects(difficulty);
CREATE INDEX idx_rec_student         ON recommendations(student_id);
CREATE INDEX idx_feedback_project    ON feedback(project_id);
