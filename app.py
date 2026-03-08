from flask import Flask, request, jsonify, render_template
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))
from ml.recommender import get_recommender

app = Flask(__name__)
recommender = get_recommender()


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/recommend', methods=['POST'])
def recommend():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    skills = data.get('skills', [])
    interests = data.get('interests', [])
    difficulty = data.get('difficulty', 'Any')

    if not skills and not interests:
        return jsonify({'error': 'Please provide at least one skill or interest'}), 400

    results = recommender.recommend(skills, interests, difficulty, top_n=6)
    return jsonify({'recommendations': results, 'count': len(results)})


@app.route('/api/skills', methods=['GET'])
def get_skills():
    skills = recommender.get_all_skills()
    return jsonify({'skills': skills})


@app.route('/api/domains', methods=['GET'])
def get_domains():
    domains = recommender.get_all_domains()
    return jsonify({'domains': domains})


@app.route('/api/project/<int:project_id>', methods=['GET'])
def get_project(project_id):
    project = recommender.get_project_by_id(project_id)
    if not project:
        return jsonify({'error': 'Project not found'}), 404
    similar = recommender.get_similar_projects(project_id, top_n=4)
    return jsonify({'project': project, 'similar': similar})


@app.route('/api/projects', methods=['GET'])
def get_all_projects():
    projects = recommender.get_all_projects()
    return jsonify({'projects': projects})


if __name__ == '__main__':
    app.run(debug=True, port=5000)
