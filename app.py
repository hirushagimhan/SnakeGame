from flask import Flask, render_template, jsonify, request
import json
import os

app = Flask(__name__)

# Store high scores in memory (in a production environment, you'd want to use a database)
high_scores = []

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/submit_score', methods=['POST'])
def submit_score():
    data = request.get_json()
    score = {
        'name': data.get('name', 'Anonymous'),
        'score': data.get('score', 0)
    }
    high_scores.append(score)
    
    # Sort high scores in descending order
    high_scores.sort(key=lambda x: x['score'], reverse=True)
    
    # Keep only top 10 scores using list slicing
    while len(high_scores) > 10:
        high_scores.pop()
        
    return jsonify({'status': 'success'})

@app.route('/get_high_scores')
def get_high_scores():
    return jsonify(high_scores)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)