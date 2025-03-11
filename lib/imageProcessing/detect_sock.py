# lib/imageProcessing/detect_sock.py
import cv2

def detect_sock(image_path):
    image = cv2.imread(image_path)
    # Convert image to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    # Apply a threshold to segment the sock from the background
    _, thresh = cv2.threshold(gray, 100, 255, cv2.THRESH_BINARY)
    # Find contours as a basic detection mechanism
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    # Draw contours on the original image for visualization
    cv2.drawContours(image, contours, -1, (0, 255, 0), 2)
    cv2.imwrite('data/sock-images/detected_sock.jpg', image)
    return contours

if __name__ == '__main__':
    detect_sock('data/sock-images/sample_sock.jpg')
