# lib/imageProcessing/preprocess.py
import cv2

def load_and_preprocess(image_path):
    # Load image
    image = cv2.imread(image_path)
    # Resize image to a standard size (256x256)
    image = cv2.resize(image, (256, 256))
    # Optionally convert to grayscale if needed:
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    return gray

if __name__ == '__main__':
    processed = load_and_preprocess('data/sock-images/sample_sock.jpg')
    cv2.imwrite('data/sock-images/processed_sample.jpg', processed)
