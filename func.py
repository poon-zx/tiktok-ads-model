import cv2
import tempfile
from PIL import Image
from werkzeug.datastructures import FileStorage


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
               date: str, video_file: FileStorage) -> dict:
    return