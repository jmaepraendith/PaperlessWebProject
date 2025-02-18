# import cv2
# import numpy as np
# import pytesseract
# import google.generativeai as genai

# def preprocess_image(image):
#     """Convert image to grayscale and apply edge detection."""
#     gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
#     blurred = cv2.GaussianBlur(gray, (5, 5), 0)
#     edged = cv2.Canny(blurred, 50, 150)
#     return gray, edged

# def find_document_contour(thresh):
#     """Find the largest document contour and filter it."""
#     contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
#     contours = sorted(contours, key=cv2.contourArea, reverse=True)

#     for contour in contours:
#         epsilon = 0.02 * cv2.arcLength(contour, True)
#         approx = cv2.approxPolyDP(contour, epsilon, True)
        
#         if len(approx) == 4 and cv2.contourArea(contour) > 1000:
#             return approx

#     raise ValueError("No document found in the image.")

# def order_points(pts):
#     """Order four points in the sequence: top-left, top-right, bottom-right, bottom-left."""
#     rect = np.zeros((4, 2), dtype="float32")
#     s = pts.sum(axis=1)
#     rect[0] = pts[np.argmin(s)]  # top-left
#     rect[2] = pts[np.argmax(s)]  # bottom-right

#     diff = np.diff(pts, axis=1)
#     rect[1] = pts[np.argmin(diff)]  # top-right
#     rect[3] = pts[np.argmax(diff)]  # bottom-left

#     return rect

# def align_image(image, document_contour):
#     """Align the image by applying a perspective transform."""
#     points = document_contour.reshape(4, 2)
#     rect = order_points(points)

#     (tl, tr, br, bl) = rect
#     widthA = np.linalg.norm(br - bl)
#     widthB = np.linalg.norm(tr - tl)
#     maxWidth = max(int(widthA), int(widthB))

#     heightA = np.linalg.norm(tr - br)
#     heightB = np.linalg.norm(tl - bl)
#     maxHeight = max(int(heightA), int(heightB))

#     dst = np.array([
#         [0, 0],
#         [maxWidth - 1, 0],
#         [maxWidth - 1, maxHeight - 1],
#         [0, maxHeight - 1]
#     ], dtype="float32")

#     M = cv2.getPerspectiveTransform(rect, dst)
#     aligned = cv2.warpPerspective(image, M, (maxWidth, maxHeight))

#     return aligned

# def enhance_image_for_ocr(image):
#     """Enhance image quality before OCR (sharpness, contrast, noise reduction)."""
#     kernel = np.array([[0, -1, 0], 
#                        [-1, 5, -1], 
#                        [0, -1, 0]])
#     sharpened = cv2.filter2D(image, -1, kernel)
    
#     alpha = 2  # contrast
#     beta = 20  # brightness
#     enhanced = cv2.convertScaleAbs(sharpened, alpha=alpha, beta=beta)
    
#     ksize = (3, 3)
#     denoised = cv2.GaussianBlur(enhanced, ksize, 0)
    
#     return denoised

# def process_document(image_path):
#     """Complete document processing: load image, find document, align, OCR."""
#     image = cv2.imread(image_path)
#     gray, thresh = preprocess_image(image)
#     document_contour = find_document_contour(thresh)
#     aligned = align_image(image, document_contour)
#     enhanced_image = enhance_image_for_ocr(aligned)

#     # Perform OCR
#     text = pytesseract.image_to_string(enhanced_image, lang='tha+eng')

#     # Structure the extracted data using generative AI
#     genai.configure(api_key="AIzaSyDoff8KD1r-hYc7xT1cms1aSuexdAlZWxA")
#     model = genai.GenerativeModel("gemini-1.5-flash")

#     response = model.generate_content(
#          f"Given the following OCR output that contains both Thai and English text with some errors, "
#                 f"please correct the errors and provide the corrected information in a structured JSON format. "
#                 f"Each field in the output should be categorized appropriately. "
#                 f"OCR Text must be json as output only: {text}"
#     )

#     structured_data = response.text if response.text else "No structured data available"
#     return structured_data










import cv2
import numpy as np
import pytesseract
import google.generativeai as genai

def preprocess_image(image):
    """Convert image to grayscale and apply edge detection."""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    edged = cv2.Canny(blurred, 50, 150)
    return gray, edged

def find_document_contour(thresh):
    """Find the largest document contour and filter it."""
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    contours = sorted(contours, key=cv2.contourArea, reverse=True)

    for contour in contours:
        epsilon = 0.02 * cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour, epsilon, True)
        
        if len(approx) == 4 and cv2.contourArea(contour) > 1000:
            return approx

    raise ValueError("No document found in the image.")

def order_points(pts):
    """Order four points in the sequence: top-left, top-right, bottom-right, bottom-left."""
    rect = np.zeros((4, 2), dtype="float32")
    s = pts.sum(axis=1)
    rect[0] = pts[np.argmin(s)]  # top-left
    rect[2] = pts[np.argmax(s)]  # bottom-right

    diff = np.diff(pts, axis=1)
    rect[1] = pts[np.argmin(diff)]  # top-right
    rect[3] = pts[np.argmax(diff)]  # bottom-left

    return rect

def align_image(image, document_contour):
    """Align the image by applying a perspective transform."""
    points = document_contour.reshape(4, 2)
    rect = order_points(points)

    (tl, tr, br, bl) = rect
    widthA = np.linalg.norm(br - bl)
    widthB = np.linalg.norm(tr - tl)
    maxWidth = max(int(widthA), int(widthB))

    heightA = np.linalg.norm(tr - br)
    heightB = np.linalg.norm(tl - bl)
    maxHeight = max(int(heightA), int(heightB))

    dst = np.array([
        [0, 0],
        [maxWidth - 1, 0],
        [maxWidth - 1, maxHeight - 1],
        [0, maxHeight - 1]
    ], dtype="float32")

    M = cv2.getPerspectiveTransform(rect, dst)
    aligned = cv2.warpPerspective(image, M, (maxWidth, maxHeight))

    return aligned

def enhance_image_for_ocr(image):
    """Enhance image quality before OCR (sharpness, contrast, noise reduction)."""
    kernel = np.array([[0, -1, 0], 
                       [-1, 5, -1], 
                       [0, -1, 0]])
    sharpened = cv2.filter2D(image, -1, kernel)
    
    alpha = 2  # contrast
    beta = 20  # brightness
    enhanced = cv2.convertScaleAbs(sharpened, alpha=alpha, beta=beta)
    
    ksize = (3, 3)
    denoised = cv2.GaussianBlur(enhanced, ksize, 0)
    
    return denoised

def process_document(image_path):
    """Complete document processing: load image, find document, align, OCR."""
    image = cv2.imread(image_path)
    gray, thresh = preprocess_image(image)
    document_contour = find_document_contour(thresh)
    aligned = align_image(image, document_contour)
    enhanced_image = enhance_image_for_ocr(aligned)

    # Perform OCR
    text = pytesseract.image_to_string(enhanced_image, lang='tha+eng')

    # Structure the extracted data using generative AI
    genai.configure(api_key="AIzaSyDoff8KD1r-hYc7xT1cms1aSuexdAlZWxA")
    model = genai.GenerativeModel("gemini-1.5-flash")

    response = model.generate_content(
         f"Given the following OCR output that contains both Thai and English text with some errors, "
                f"please correct the errors and provide the corrected information in a structured JSON format. "
                f"Each field in the output should be categorized appropriately. "
                f"OCR Text must be json as output only: {text}"
    )

    structured_data = response.text if response.text else "No structured data available"
    return structured_data