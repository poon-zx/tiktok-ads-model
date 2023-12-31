import json
import os
from flask import Flask, request, render_template
from flask_cors import CORS, cross_origin
from func import extract_frames_from_video, analyse_ad, calculate_confidence, top_category, get_top_violations
from werkzeug.datastructures import FileStorage

from violations.violation_checker import ViolationChecker

DEFAULT_FILE_NAME = "videoFile"

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = os.environ.get("SECRET_KEY")
app.config['MAX_CONTENT_LENGTH'] = 1024 * 1024 * 1024  # 1GB
sample_data = {
    "video_violation": {
        "Violence": 0.2313412085175514,
        "Nudity or Sexual Activity": 0.18042190819978715,
        "Hate Speech": 0.2057467833161354,
        "Bullying or Harassment": 0.20117659717798234,
        "Scam or Fraud": 0.18724700510501863,
        "Suicide or Self-Harm": 0.1926332324743271,
        "Sale of Illegal/Regulated Goods": 0.18096445202827455,
        "Counterfeit Goods": 0.16708229929208757,
        "Controlled Substances": 0.15342690646648408,
        "Weapons or Ammunition": 0.24873889684677125,
        "Sexual Content": 0.1868179738521576,
        "Alcohol": 0.16104911565780639,
        "Gambling": 0.18248966932296753
    },
    "ad_category": {
        "Financial Services": 0.6193647734266479,
        "Consumer Goods": 0.47762112417407576,
        "Food & Beverages": 0.5787563024322729,
        "Automobiles": 0.877835291053938,
        "Entertainment & Media": 0.016401770806587224,
        "Travel & Tourism": 0.034172944331359534,
        "Real Estate": 0.15442423819858941,
        "E-commerce & Online Services": 0.5395460295800252,
        "Health & Wellness": 0.18489376778716315,
        "Education & Training": 0.4840913998947366,
        "Tech & Software": 0.7807660691493897,
        "Events & Occasions": 0.5822961067434335,
        "Home & Garden": 0.05711569929769911,
        "Pets & Animals": 0.6982649603016671,
        "Sports & Outdoors": 0.26188911599404185
    },
    "ad_score_equation": {
        "score": 0,
        "confidence": 0
    },
    "moderator_matching": {
        "moderator_score": 0.7839359734541377,
        "max_tasks_per_day": 8,
        "market": "market",
        "expertise": "expertise",
        "increased moderator utilisation (%)": 47.77747699078465
    }
}

checker = ViolationChecker(config_path = 'violations/config.yaml')

@app.route('/')
def home():
    return render_template("index.html")


@app.route('/upload', methods=["GET", "POST"])
@cross_origin(options=None)
def upload():
    if request.method == "POST":
        file = request.files.get(DEFAULT_FILE_NAME)
        data = request.form
        ad_title = data.get('adTitle')
        advertiser_name = data.get('advertiserName')
        description = data.get('description')
        delivery_market = data.get('deliveryMarket')
        product_line = data.get('productLine')
        task_type = data.get('taskType')
        date = data.get('startDate')
        print(file)
        # print(data)
        # print(extract_frames_from_video(file, 10))

        out = checker.get_results(ad_description = description, file_storage = file)

        video_violation_values = list(out["violation_labels"].values())
        confidence = round(calculate_confidence(video_violation_values), 3)

        ad_results = analyse_ad(ad_title, advertiser_name, description, delivery_market, product_line, task_type, date, file, confidence)
        
        out = top_category(out)

    json_data = {
        "ad_score_equation": {
        "score": ad_results["ad_score"],
        "baseline_st": ad_results["baseline_st"],
        "days_diff": ad_results["days_diff"],
        "confidence": confidence
    },
    "moderator_matching": {
        "moderator_id": ad_results["assigned_moderator"],
        "moderator_score": ad_results["mod_score"],
        "productivity": ad_results["normalized_productivity"],
        "accuracy": ad_results["normalized_accuracy"],
        "remaining_tasks": ad_results["remaining_tasks_today"],
        "market": ad_results["market"],
        "expertise": "No Data",
        "utilization": ad_results["new_utilisation"]
    }
    }

    out["violation_labels"] = get_top_violations(out["violation_labels"])

    result_json = out | json_data
    print(result_json)

    return json.dumps(result_json)
    return "post method only please"

if __name__ == "__main__":
    app.run(debug=True)
