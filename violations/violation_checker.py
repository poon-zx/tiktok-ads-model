import cv2
import torch
import tempfile
import yaml
import torch.nn.functional as F
import numpy as np

from transformers import AutoProcessor, CLIPModel, AutoTokenizer
from sentence_transformers import SentenceTransformer

from PIL import Image
from werkzeug.datastructures import FileStorage

class ViolationChecker:

    def __init__(self, config_path: str, clip_path: str = "openai/clip-vit-base-patch32", sentence_transformer_path: str = "BAAI/bge-base-en"):
        """
        Initialize the violation checker

        :param config_path: path to the config file
        :param video_path: path to the video file
        :param clip_path: path to the CLIP model (default: "openai/clip-vit-base-patch32")
        :param sentence_transformer_path: path to the sentence transformer model (default: "BAAI/bge-base-en")
        """

        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        with open(config_path) as f:
            self.config = yaml.load(f, Loader=yaml.FullLoader)
        self.violation_labels = self.config['violation_labels']
        self.ad_categories = self.config['ad_categories']

        self.clip_model = CLIPModel.from_pretrained(clip_path).to(self.device)
        self.clip_processor = AutoProcessor.from_pretrained(clip_path)
        self.tokenizer = AutoTokenizer.from_pretrained(clip_path)

        self.sentence_transformer = SentenceTransformer(sentence_transformer_path)

    def get_results(self, ad_description: str, file_storage: FileStorage, num_frames: int = 10) -> dict:
        
        """
        Get the violation labels and ad categories for the video

        :param ad_description: description of the ad
        :param video_path: path to the video file
        :param num_frames: number of frames to extract from the video (default: 10)
        :return: dictionary of violation labels and their probabilities
        """

        return self(ad_description = ad_description, file_storage = file_storage, num_frames = num_frames)

    def __call__(self, ad_description: str, file_storage: FileStorage, num_frames: int = 10) -> dict:
        """
        Get the violation labels and ad categories for the video

        :param ad_description: description of the ad
        :param file_storage: the file storage 
        :param num_frames: number of frames to extract from the video (default: 10)
        :return: dictionary of violation labels and their probabilities
        """

        violation_labels = self.get_violation_labels(file_storage = file_storage, num_frames = num_frames)
        ad_category = self.get_ad_category(ad_description = ad_description)

        return {
            "violation_labels": violation_labels,
            "ad_category": ad_category
        }

    def get_ad_category(self, ad_description: str) -> dict:
        """
        Get the ad category for the ad description
        
        :param ad_description: description of the ad
        :return: dictionary of ad categories and their probabilities
        """

        input_texts = [ad_description] + self.ad_categories
        embeddings = self.sentence_transformer.encode(input_texts, convert_to_tensor=True, normalize_embeddings=True)
        query = embeddings[0]
        categories = embeddings[1:]
        cos_sim = F.cosine_similarity(query, categories)
        return dict(zip(self.ad_categories, cos_sim.tolist()))

    def get_violation_labels(self, file_storage: FileStorage, num_frames: int = 10) -> dict:
        """
        Get the violation labels for the video

        :param file_storage: the file storage object
        :param num_frames: number of frames to extract from the video (default: 10)
        :return: dictionary of violation labels and their probabilities
        """

        frames = self._extract_frames_from_video(file_storage, num_frames)

        img_inputs = self.clip_processor(images = frames, return_tensors="pt")
        img_inputs = {k: v.to(self.device) for k, v in img_inputs.items()}
        image_features = self.clip_model.get_image_features(**img_inputs)

        out = {}
        for label in self.violation_labels:
            inputs = self.tokenizer([label, ""], padding=True, return_tensors="pt")
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            text_features = self.clip_model.get_text_features(**inputs)
            indiv = []
            for im in image_features:
                cos_sim = F.cosine_similarity(im.unsqueeze(0), text_features) * 100
                indiv.append(cos_sim.softmax(dim=0)[0].item())

            highest = max(indiv)
            out[label] = highest
        return out

    def _extract_frames_from_video(self, file_storage: FileStorage, num_frames: int) -> list:
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


if __name__ == "__main__":
    # Example usage
    ad_description = """The SAR 21 is a bullpup-style assault rifle designed and manufactured in Singapore. 
It features a selective-fire system with options for semi-automatic and automatic firing modes, a 5.56x45mm NATO caliber, 
a detachable magazine, and a built-in optical scope for improved accuracy. Known for its reliability and ergonomic design,
the SAR 21 is utilized by the Singapore Armed Forces and other military and law enforcement units worldwide.
"""

    checker = ViolationChecker(config_path = 'config.yaml')
    out = checker.get_results(ad_description = ad_description, video_path = "test.mp4")


    print(out)
# {'violation_labels': {'Violence': 0.759814453125,
#   'Nudity or Sexual Activity': 0.0839385986328125,
#   'Hate Speech': 0.377484130859375,
#   'Bullying or Harassment': 0.106317138671875,
#   'Scam or Fraud': 0.1013671875,
#   'Suicide or Self-Harm': 0.03049812316894531,
#   'Sale of Illegal/Regulated Goods': 0.10452346801757813,
#   'Intellectual Property Violation': 0.519189453125,
#   'Counterfeit Goods': 0.05797004699707031,
#   'Dangerous Products or Services': 0.3290283203125,
#   'Controlled Substances': 0.189990234375,
#   'Weapons or Ammunition': 0.907421875,
#   'Sexual Content': 0.5730712890625,
#   'Alcohol': 0.0583953857421875,
#   'Gambling': 0.05427627563476563},
#  'ad_category': {'Counterfeit Goods\\nAny content promoting products that mimic the brand features of another in an attempt to pass as genuine': 0.6870056390762329,
#   'Dangerous Products or Services\\nIncluding recreational drugs, psychoactive substances, weapons, ammunition, and explosives': 0.7483649253845215,
#   'Controlled Substances\\nContent that promotes the sale, distribution, or use of tobacco, illegal drugs, narcotics, or excessive alcohol': 0.6887493133544922,
#   'Weapons or Ammunition\\nContent promoting the sale, distribution, or use of firearms, weapons, or explosives': 0.7620818614959717,
#   'Sexual Content\\nGenerally allowed on a limited basis and often subject to age restrictions': 0.7112984657287598,
#   'Alcohol\\nRestricted and subject to age-related regulations': 0.7029865980148315,
#   'Gambling\\nReal money and simulated gambling content may be allowed with specific regulations': 0.7002195119857788}}