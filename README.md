# TikTok Ads Moderation System

## Getting Started

1. Install the required dependencies for to run the flask backend.

**Gurobi**
Installation of Gurobi is required to run our optimization models, you can use pip to install Gurobi into your currently active Python environment
```bash
python -m pip install gurobipy
```
A license is also required to run Gurobi. Refer to this [link](https://www.gurobi.com/academia/academic-program-and-licenses/) for free Gurobi licenses.


2. Install the node packages to run the react frontend.
```bash
npm install
```

3. Run the flask backend.
```bash
py main.py
```
4. Run the react frontend in /ad-input
```bash
npm start
```


## Introduction

Welcome to the TikTok Ads Moderation System! This system is designed to assist moderators in efficiently reviewing and moderating advertisements on TikTok. It employs a combination of machine learning models and optimization techniques to prioritize ads, flag potential violations, categorize ads, and match them with the most suitable moderators.

## Features
1. Advertisement Scoring System
- Feature Engineering: Utilizes various features such as days_diff, tier score, and more to calculate an ad's priority score.
- Gurobi Optimizer: Maximizes the priority score using an optimization model.
2. Violation Flagging and Categorizing Ads
- Violation Flagging: Samples frames from video ads and uses CLIP as a zero-shot classifier to flag potential violations.
- Categorizing Ads: Employs biencoders to categorize ads based on their descriptions.
- Confidence Metric: Generates a confidence score for each ad's violation prediction.
3. Moderator Scoring and Matching System
- Scoring System for Moderators: Scores moderators based on productivity and accuracy.
- Max Tasks per Day: Calculates the maximum number of tasks each moderator can handle.
- Generating Expertise: Matches ad categories with moderator expertise (assumed to be null for now).
- Moderator Allocation Gurobi Optimizer: Matches ads with moderators while considering ad scores, confidence, and other constraints.
4. Full-Stack Web App of Ads Submission Form
- Provides a user-friendly web app for advertisers to submit ads for moderation.

## How It Works
Our system consists of three main components: the Advertisement Scoring System, Violation Flagging and Categorization of Ads, and the Moderator Scoring and Matching System. Here's a brief overview of how they work together:

1. Advertisement Scoring System: This component calculates a priority score for each ad using features like days_diff, tier score, and more. The Gurobi optimizer maximizes this score to prioritize ads effectively.
2. Violation Flagging and Categorization of Ads: It checks video ads for potential violations using CLIP and categorizes ads based on their descriptions. A confidence metric is generated to represent the model's certainty in its predictions.
3. Moderator Scoring and Matching System: Moderators are scored based on productivity and accuracy. An optimization model matches ads with moderators while considering ad scores, confidence levels, and constraints like maximum tasks per day and expertise.
4. Full-Stack Web App: A web app is provided for advertisers to submit ads easily.

## Technologies Used
- CLIP
- Gurobi Optimizer
- Machine Learning
- Python
- SentenceTransformers
- React (Front-end)
- Flask (Back-end)
