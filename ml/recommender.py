import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import os


class ProjectRecommender:
    def __init__(self, data_path=None):
        self.df = None
        self.tfidf_matrix = None
        self.vectorizer = None
        self.data_path = data_path or os.path.join(
            os.path.dirname(__file__), '..', 'data', 'projects.csv'
        )
        self._load_and_train()

    def _load_and_train(self):
        self.df = pd.read_csv(self.data_path)
        self.df['content'] = (
            self.df['skills'] + ' ' +
            self.df['domain'] + ' ' +
            self.df['tags'].str.replace(',', ' ') + ' ' +
            self.df['description']
        )
        self.vectorizer = TfidfVectorizer(
            stop_words='english',
            ngram_range=(1, 2),
            max_features=500
        )
        self.tfidf_matrix = self.vectorizer.fit_transform(self.df['content'])

    def recommend(self, skills: list, interests: list, difficulty: str = None, top_n: int = 6):
        if not skills and not interests:
            return []

        user_profile = ' '.join(skills + interests)
        user_vector = self.vectorizer.transform([user_profile])
        similarity_scores = cosine_similarity(user_vector, self.tfidf_matrix).flatten()

        working_df = self.df.copy()
        working_df['similarity'] = similarity_scores

        if difficulty and difficulty != 'Any':
            working_df = working_df[working_df['difficulty'] == difficulty]

        if working_df.empty:
            working_df = self.df.copy()
            working_df['similarity'] = similarity_scores

        top_projects = working_df[working_df['similarity'] > 0.05].sort_values(
            'similarity', ascending=False
        ).head(top_n)

        results = []
        for _, row in top_projects.iterrows():
            results.append({
                'id': int(row['project_id']),
                'title': row['title'],
                'description': row['description'],
                'skills': row['skills'].split(),
                'domain': row['domain'],
                'difficulty': row['difficulty'],
                'tags': row['tags'].split(','),
                'similarity': round(float(row['similarity']) * 100, 1)
            })

        return results

    def get_all_skills(self):
        all_skills = set()
        for skill_str in self.df['skills']:
            for s in skill_str.split():
                all_skills.add(s.lower())
        return sorted(list(all_skills))

    def get_all_domains(self):
        return sorted(self.df['domain'].unique().tolist())

    def get_project_by_id(self, project_id: int):
        row = self.df[self.df['project_id'] == project_id]
        if row.empty:
            return None
        row = row.iloc[0]
        return {
            'id': int(row['project_id']),
            'title': row['title'],
            'description': row['description'],
            'skills': row['skills'].split(),
            'domain': row['domain'],
            'difficulty': row['difficulty'],
            'tags': row['tags'].split(','),
        }

    def get_similar_projects(self, project_id: int, top_n: int = 4):
        idx = self.df[self.df['project_id'] == project_id].index
        if len(idx) == 0:
            return []
        idx = idx[0]
        sim_scores = cosine_similarity(
            self.tfidf_matrix[idx], self.tfidf_matrix
        ).flatten()
        similar_indices = sim_scores.argsort()[::-1][1:top_n + 1]
        results = []
        for i in similar_indices:
            row = self.df.iloc[i]
            results.append({
                'id': int(row['project_id']),
                'title': row['title'],
                'domain': row['domain'],
                'difficulty': row['difficulty'],
                'similarity': round(float(sim_scores[i]) * 100, 1)
            })
        return results

    def get_all_projects(self):
        projects = []
        for _, row in self.df.iterrows():
            projects.append({
                'id': int(row['project_id']),
                'title': row['title'],
                'description': row['description'],
                'skills': row['skills'].split(),
                'domain': row['domain'],
                'difficulty': row['difficulty'],
                'tags': row['tags'].split(','),
            })
        return projects


_recommender = None

def get_recommender():
    global _recommender
    if _recommender is None:
        _recommender = ProjectRecommender()
    return _recommender
