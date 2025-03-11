import sys
import argparse
import requests
import cv2
import numpy as np
import tensorflow as tf
import json
import os

# ✅ Load MobileNetV2 once at script start (cache model for speed)
MODEL = tf.keras.applications.MobileNetV2(
    input_shape=(224, 224, 3),
    include_top=False,
    weights='imagenet',
    pooling='avg'
)

def download_image(url):
    response = requests.get(url)
    if response.status_code == 200:
        image_array = np.asarray(bytearray(response.content), dtype="uint8")
        img = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
        return img
    else:
        raise Exception("Failed to download image from URL")

def preprocess_image(image):
    resized_img = cv2.resize(image, (224, 224))
    img_rgb = cv2.cvtColor(resized_img, cv2.COLOR_BGR2RGB)
    normalized_img = img_rgb / 255.0
    return normalized_img

def generate_embedding(image):
    img_batch = np.expand_dims(image, axis=0)
    embedding = MODEL.predict(img_batch)
    return embedding.flatten()

def save_embedding(embedding, output_path):
    embedding_list = embedding.tolist()
    with open(output_path, 'w') as f:
        json.dump({"embedding": embedding_list}, f)

def main():
    parser = argparse.ArgumentParser(description='Sock Processing Pipeline')
    parser.add_argument('--input', type=str, required=True, help='Input Cloudinary Image URL')
    parser.add_argument('--output', type=str, default='embedding.json', help='Output embedding JSON file path')

    args = parser.parse_args()

    print("Downloading image...")
    img = download_image(args.input)

    print("Preprocessing image...")
    preprocessed_img = preprocess_image(img)

    print("Generating embedding...")
    embedding = generate_embedding(preprocessed_img)

    print(f"Saving embedding to {args.output}")
    save_embedding(embedding, args.output)

    print("Process completed successfully.")

if __name__ == "__main__":
    main()
