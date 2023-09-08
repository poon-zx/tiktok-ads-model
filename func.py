import cv2
import tempfile
from PIL import Image
from werkzeug.datastructures import FileStorage
import pandas as pd
from datetime import datetime
from gurobipy import Model, GRB
import uuid


def extract_frames_from_video(file_storage: FileStorage, num_frames: int) -> list:
    """
    Extract frames from the video

    :param file_storage: video file
    :param num_frames: number of frames to extract from the video
    :return: list of PIL images
    """
    frames = []

    with tempfile.NamedTemporaryFile(suffix='.mp4') as temp_file:
        temp_file.write(file_storage.read())
        video_path = temp_file.name

        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise Exception("Error: Could not open video file.")
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        frame_interval = int(total_frames / num_frames)

        frame_count = 0
        while True:
            ret, frame = cap.read()

            if (not ret) or (frame is None) or (len(frames) >= num_frames):
                break

            if frame_count % frame_interval == 0:
                pil_frame = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
                frames.append(pil_frame)

            frame_count += 1

        cap.release()

        return frames

def analyse_ad(ad_title: str, advertiser_name: str, description: str,
               delivery_market: str, product_line: str, task_type: str,
               date: str, video_file: FileStorage, confidence) -> dict:

    # Load the st_combinations file into a DataFrame
    df = pd.read_excel("./EDA/Datasets/st_combinations.xlsx")

    # Load the moderator data
    moderator_data = pd.read_excel("./Scoring/moderator_scored.xlsx")

    # Convert the DataFrame to a dictionary using the three specified columns as a key
    st_dict = {}

    for index, row in df.iterrows():
        key = (row['delivery_country'], row['product_line'], row['task_type_en'])
        value = row['baseline_st']
        st_dict[key] = value

    # Obtain baseline_st
    baseline_st = st_dict.get((delivery_market, product_line, task_type), 1.20)

    # Obtain days_diff
    given_date = datetime.strptime(date, '%d/%m/%Y')
    target_date = datetime.strptime("9/9/2023", '%d/%m/%Y')
    delta = given_date - target_date
    days_diff = delta.days

    # Min-max normalization for baseline_st
    min_baseline_st = 0.54
    max_baseline_st = 7.59
    normalized_baseline_st = (baseline_st - min_baseline_st) / (max_baseline_st - min_baseline_st)
    
    # Min-max normalization for days_diff
    min_days_diff = 0
    max_days_diff = 37
    normalized_days_diff = (days_diff - min_days_diff) / (max_days_diff - min_days_diff)
    
    # Compute the average of the two normalized values
    ad_score = round(abs((normalized_baseline_st - normalized_days_diff) / 2), 3)

    print(ad_score)

    # Generate ad_id
    ad_id = str(uuid.uuid4())

    # Convert to DataFrame
    ads_dataset = pd.DataFrame({
        'ad_id': [ad_id],
        'ad_title': [ad_title],
        'advertiser_name': [advertiser_name],
        'description': [description],
        'delivery_market': [delivery_market],
        'product_line': [product_line],
        'task_type': [task_type],
        'date': [date],
        'baseline_st': [baseline_st],
        'days_diff': [days_diff],
        'ad_score': [ad_score],
        'confidence': [confidence]
    })

    # Initialize the Gurobi model
    m = Model("AdTaskAllocation")

    # Create the decision variables
    x = {(ad_id, mod): m.addVar(vtype=GRB.BINARY, name=f"x_{ad_id}_{mod}")
        for ad_id in ads_dataset['ad_id']
        for mod in moderator_data['moderator']}

    # Set the objective function
    m.setObjective(sum(x[ad_row['ad_id'], mod_row['moderator']] * abs(0.5 * (ad_row['ad_score'] - mod_row['moderator_score']) + 
        0.5 * (ad_row['confidence'] - mod_row['normalized_productivity'] + mod_row['normalized_accuracy'])) 
                    for _, ad_row in ads_dataset.iterrows() for _, mod_row in moderator_data.iterrows()), GRB.MINIMIZE)

    # Each ad should be allocated to only one moderator
    for _, ad_row in ads_dataset.iterrows():
        ad_id = ad_row['ad_id']
        m.addConstr(sum(x[ad_id, mod_row['moderator']] for _, mod_row in moderator_data.iterrows()) == 1)

    # The total tasks assigned to a moderator should not exceed their max tasks per day
    for _, mod_row in moderator_data.iterrows():
        mod = mod_row['moderator']
        m.addConstr(sum(x[ad_row['ad_id'], mod] for _, ad_row in ads_dataset.iterrows()) <= mod_row['max_tasks_per_day'])

    # Only assign an ad to a moderator if the ad's market matches the moderator's market

    # Preprocess moderator data into a dictionary by market
    moderator_market_dict = {}
    for _, mod_row in moderator_data.iterrows():
        mod = mod_row['moderator']
        market = eval(mod_row['market'])
        for i in market:
            if i not in moderator_market_dict:
                moderator_market_dict[i] = []
            moderator_market_dict[i].append(mod)

    # Check the moderator constraint more efficiently
    for _, ad_row in ads_dataset.iterrows():
        ad_id = ad_row['ad_id']
        ad_market = ad_row['delivery_market']
        
        # Get the list of moderators that match the ad's market from the preprocessed dictionary
        matching_mods = moderator_market_dict.get(ad_market, [])

        # Get all the moderators
        all_mods = moderator_data['moderator'].tolist()

        # For each moderator, if they are not in the matching moderators list, 
        # set their assignment variable for the current ad to 0.
        for mod in all_mods:
            if mod not in matching_mods:
                m.addConstr(x[ad_id, mod] == 0)

    # Solve the model
    m.optimize()

    # Extract the assignments from the solution
    assignments = {}
    for _, ad_row in ads_dataset.iterrows():
        for _, mod_row in moderator_data.iterrows():
            if x[ad_row['ad_id'], mod_row['moderator']].x > 0.5:  # If this ad is assigned to this moderator
                assignments[ad_row['ad_id']] = mod_row['moderator']

    PAID_HOURS_PER_DAY = 8

    # Find the assigned moderator and compute the increased utilization
    assigned_moderator = assignments[ad_id]
    mod_data = moderator_data[moderator_data['moderator'] == assigned_moderator].iloc[0]
    increase_in_utilisation = mod_data['handling time'] / (PAID_HOURS_PER_DAY * 60 * 60 * 1000)
    market = mod_data['market']
    mod_score = mod_data['moderator_score']
    new_utilisation = mod_data["Utilisation %"] + increase_in_utilisation

    result = {
        "baseline_st": baseline_st,
        "ad_score": ad_score,
        "assigned_moderator": assigned_moderator,
        "normalized_productivity": mod_data['normalized_productivity'],
        "normalized_accuracy": mod_data['normalized_accuracy'],
        "remaining_tasks_today": round(mod_data['max_tasks_per_day'] - 1, 2),  # Subtracting 1 as we've assigned one ad
        "increase_in_utilisation": increase_in_utilisation,
        "market": market,
        "days_diff": days_diff,
        "mod_score": mod_score,
        "new_utilisation": new_utilisation
    }

    return result

def score(x):
    """Calculate score based on distance from 0.5"""
    if abs(x - 0.4) < 0.1:
        return 1 - abs(x - 0.4) * 10  # Scale score linearly within [0.4, 0.5]
    elif abs(x - 0.6) < 0.1:
        return 1 - abs(x - 0.6) * 10  # Scale score linearly within [0.5, 0.6]
    return 0  # for values exactly at 0.5

def calculate_confidence(A):
    n = len(A)
    
    # Check conditions
    if all(x <= 0.4 for x in A):
        return sum(1 - x for x in A) / n
    elif any(x >= 0.6 for x in A):
        return max(A)
    elif all(x >= 0 and x < 0.6 for x in A):
        total_score = sum(score(x) for x in A)
        # Normalize the confidence to be in the range [0, 0.6]
        return 0.6 * (total_score / n)
    else:
        return None

def top_category(data):
    # Extract the ad_category dictionary
    ad_category = data["ad_category"]

    # Find the key (category) with the maximum score
    top_category = max(ad_category, key=ad_category.get)
    highest_score = ad_category[top_category]

    # Update the ad_category dictionary to only have the top category and its score
    top_category = top_category.split("\\n")[0]
    data["ad_category"] = {top_category: highest_score}
    print(data)
    return data

def get_top_violations(d):
    top_3_dict = {}
    sorted_violations = sorted(d, key=d.get, reverse=True)[:3]
    top_3_dict = {violation: d[violation] for violation in sorted_violations if d[violation] >= 0.6}
    return top_3_dict
    
