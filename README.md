# ProjectMatch — AI-Powered Project Recommendation System

A full-stack web application that recommends student projects based on skills and interests using **Content-Based Filtering** with TF-IDF vectorization and Cosine Similarity.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [How It Works](#how-it-works)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Screenshots](#screenshots)
- [Future Improvements](#future-improvements)

---

## Overview

ProjectMatch helps students discover the most relevant projects based on their current skills and interests. Instead of manually browsing through hundreds of projects, students simply enter what they know and what they enjoy — the system does the rest using machine learning.

The recommendation engine is built on **Content-Based Filtering**, meaning it compares a student's profile against every project in the database and returns the best matches ranked by similarity score.

---

## Features

- Smart project recommendations using TF-IDF + Cosine Similarity
- Tag-based skill input with live autocomplete suggestions
- Domain filtering with clickable interest chips
- Difficulty level filter (Beginner / Intermediate / Advanced)
- Browse all 40 projects with domain and difficulty filters
- Match percentage score displayed on every recommendation
- Project detail modal with full description, skills, and tags
- Fully responsive design for desktop and mobile
- REST API backend with 6 endpoints

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Python, Flask |
| Machine Learning | Pandas, Scikit-learn (TF-IDF) |
| Database | MySQL |
| Algorithm | Content-Based Filtering |

---

## Project Structure

```
projectmatch/
│
├── app.py                    # Flask application and API routes
├── requirements.txt          # Python dependencies
├── schema.sql                # MySQL database schema
│
├── data/
│   └── projects.csv          # Project dataset (40 projects)
│
├── ml/
│   └── recommender.py        # TF-IDF recommendation engine
│
├── static/
│   ├── css/
│   │   └── style.css         # All styles
│   └── js/
│       └── main.js           # All frontend logic
│
└── templates/
    └── index.html            # Main HTML page
```

---

## Installation

### Prerequisites

Make sure the following are installed on your machine:

- Python 3.8 or higher — [python.org](https://python.org)
- pip (comes with Python)
- MySQL — [mysql.com](https://dev.mysql.com/downloads/) *(optional)*
- Git — [git-scm.com](https://git-scm.com)

### Step 1 — Clone the Repository

```bash
git clone https://github.com/your-username/projectmatch.git
cd projectmatch
```

### Step 2 — Install Python Dependencies

```bash
pip install -r requirements.txt
```

### Step 3 — Set Up MySQL Database (Optional)

The app works fully without MySQL. MySQL is only needed if you want to save student profiles and recommendation history.

```bash
mysql -u root -p < schema.sql
```

---

## Running the Project

```bash
python app.py
```

Then open your browser and go to:

```
http://localhost:5000
```

You should see the ProjectMatch interface ready to use.

---

## How It Works

### Recommendation Pipeline

```
Student enters skills + interests
              ↓
  Combined into a single text string
              ↓
  TF-IDF Vectorizer converts it to a vector
              ↓
  Cosine Similarity computed against all 40 projects
              ↓
  Projects filtered by difficulty (if selected)
              ↓
  Results sorted by similarity score (highest first)
              ↓
  Top 6 matches returned to the frontend
```

### TF-IDF Explained

**TF (Term Frequency)** measures how often a skill appears in a project description.

**IDF (Inverse Document Frequency)** rewards rare and specific skills and penalizes very common words.

```
TF-IDF Score = TF × IDF
```

A project with the skill `mediapipe` scores higher for a student who knows MediaPipe because that skill is rare across all projects — making it a more meaningful signal.

### Cosine Similarity

```
similarity = (A · B) / (|A| × |B|)
```

Compares the angle between the student's skill vector and each project's skill vector. A score of 1.0 means a perfect match. A score of 0.0 means no overlap at all.

Only projects with a similarity score above 5% are shown to avoid irrelevant results.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Serves the main frontend page |
| POST | `/api/recommend` | Returns personalized project recommendations |
| GET | `/api/skills` | Returns all available skills for autocomplete |
| GET | `/api/domains` | Returns all project domains |
| GET | `/api/projects` | Returns all 40 projects |
| GET | `/api/project/<id>` | Returns a single project with similar projects |

### Example — POST /api/recommend

**Request:**
```json
{
  "skills": ["python", "pandas", "scikit-learn"],
  "interests": ["Data Science"],
  "difficulty": "Intermediate"
}
```

**Response:**
```json
{
  "recommendations": [
    {
      "id": 7,
      "title": "Sentiment Analysis Tool",
      "description": "Analyze sentiment of tweets and reviews using NLP",
      "skills": ["python", "nltk", "scikit-learn", "pandas"],
      "domain": "Data Science",
      "difficulty": "Intermediate",
      "tags": ["nlp", "text-analysis", "social-media"],
      "similarity": 84.3
    }
  ],
  "count": 4
}
```

---

## Database Schema

The MySQL database has 4 tables:

**students** — stores student profiles including name, email, skills, interests, and level.

**projects** — stores all projects with title, description, skills, domain, and difficulty.

**recommendations** — tracks which projects were recommended to which student and when.

**feedback** — stores student ratings (1–5 stars) and comments on recommended projects.

```sql
students          → id, name, email, skills, interests, level
projects          → id, title, description, skills, domain, difficulty, tags
recommendations   → id, student_id, project_id, similarity_score, recommended_at
feedback          → id, student_id, project_id, rating, comment
```

---

## Project Dataset

The system includes 40 projects across 12 domains:

| Domain | Projects |
|---|---|
| Web Development | 7 |
| AI / ML | 6 |
| Data Science | 5 |
| DevOps | 2 |
| Cybersecurity | 2 |
| Game Development | 2 |
| Robotics | 2 |
| Embedded Systems | 2 |
| Networking | 2 |
| Computer Graphics | 2 |
| IoT | 1 |
| Blockchain | 1 |
| Mobile | 2 |
| Big Data | 2 |
| Cloud Computing | 2 |
| Systems | 1 |

---

## Future Improvements

- Add user authentication with Flask-Login so students can save their profiles
- Implement collaborative filtering using the feedback ratings table
- Add a project submission form so students can contribute new projects
- Export recommended projects as a PDF report
- Add an admin dashboard to manage the project dataset
- Use word embeddings (Word2Vec or BERT) for semantic skill matching
- Deploy to the cloud using Railway, Render, or AWS

---

## License

This project is open source and available under the [MIT License](LICENSE).
