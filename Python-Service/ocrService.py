import os
import cv2
import numpy as np
import pytesseract
import json
from PIL import Image
from flask import Flask, request, jsonify
import google.generativeai as genai
import requests

app = Flask(__name__)
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}

genai.configure(api_key="AIzaSyDoff8KD1r-hYc7xT1cms1aSuexdAlZWxA")

NODE_BACKEND_URL = "http://localhost:13889/process"

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def deskew_image(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150, apertureSize=3)
    lines = cv2.HoughLines(edges, 1, np.pi/180, 200)
    if lines is not None:
        angles = []
        for rho, theta in lines[:, 0]:
            angle = (theta * 180/np.pi) - 90
            angles.append(angle)
        if angles:
            median_angle = np.median(angles)
            (h, w) = image.shape[:2]
            center = (w // 2, h // 2)
            M = cv2.getRotationMatrix2D(center, median_angle, 1.0)
            rotated = cv2.warpAffine(image, M, (w, h),
                                     flags=cv2.INTER_CUBIC,
                                     borderMode=cv2.BORDER_REPLICATE)
            return rotated
    return image

def preprocess_image(image_path):
    image = cv2.imread(image_path)
    image = deskew_image(image)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    thresh = cv2.adaptiveThreshold(gray, 255,
                                   cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                   cv2.THRESH_BINARY, 31, 10)
    kernel = np.ones((1,1), np.uint8)
    processed = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
    return processed

# OCR extraction 
def extract_text(image_path):
    image = preprocess_image(image_path)
    pil_image = Image.fromarray(image)
    tesseract_text = pytesseract.image_to_string(pil_image, lang="eng+tha")
    print("Extracted OCR text for {}:".format(image_path))
    print(tesseract_text)
    return tesseract_text

# LLM formatting 
def llm_format_data(text, doc_type, image_path):
    if doc_type == "Bill":
        prompt = (
            f"You are an expert OCR text corrector. The following text was extracted from a receipt image. "
            "Correct any errors and output EXACTLY valid JSON following this schema. The bill or receipt may contain multiple product items; "
            "if so, output each product item as a separate JSON object with the same header details. Each JSON object must have the keys exactly as below:\n\n"
            "{\n"
            '    "file_type": "Bill",\n'
            '    "fileimagename": "{image_path}",\n'
            '    "receipt_number": string,\n'
            '    "receipt_date": string (DD/MM/YYYY),\n'
            '    "payment_description": string,\n'
            '    "payer_name": string,\n'
            '    "payment_method": string (one of "Cash", "Credit", "Transfer"),\n'
            '    "product_item":string,\n'
            '    "description": string,\n'
            '    "quantity": number,\n'
            '    "unit_price": number,\n'
            '    "total_product_price": number,\n'
            '    "all_product_total_price": number,\n'
            '    "amount_paid": number\n'
            "}\n\n"
            "Only output the JSON object. File image name: " + image_path + "\n"
            "OCR text: " + text
        )
    elif doc_type == "PurchaseOrder":
        prompt = (
            f"You are an expert OCR text corrector. The following text was extracted from a purchase order image. "
            "Correct any errors and output valid JSON following this schema. The purchase order may contain multiple product items; "
            "if so, output each product item as a separate JSON object with the same header details. Each JSON object must have the keys exactly as below:\n\n"
            "{\n"
            '  "file_type": "Purchase order",\n'	
            '  "fileimagename": image_path,\n'
            '  "purchase_order_number": string,\n'
            '  "order_date": string (DD/MM/YYYY),\n'
            '  "customer_name": string,\n'
	        '  "product_item":string,\n'
            '  "description": string,\n'
            '  "quantity": number,\n'
            '  "unit_price": number,\n'
	        '  "total_product_price":number,\n'	
            '  "all_product_total_price": number,\n'
            '  "supplier_name": string,\n'
            '  "order_status": string (one of "Pending", "Shipped", "Completed"),\n'
            '  "delivery_date": string (DD/MM/YYYY)\n'
            "}\n\n"
            "Output only the JSON objects (one per product item). File image name: " + image_path + "\n"
            "OCR text: " + text
        )
    elif doc_type == "Invoice":
        prompt = (
            f"You are an expert OCR text corrector. The following text was extracted from an invoice image. "
            "Correct any errors and output EXACTLY valid JSON following this schema. The invoice may contain multiple product items; "
            "if so, output each product item as a separate JSON object with the same header details. Each JSON object must have the keys exactly as below:\n\n"
            "{\n"
            '  "file_type": "Invoice",\n'
            '  "fileimagename": image_path,\n'
            '  "invoice_number": string,\n'
            '  "invoice_date": string (DD/MM/YYYY),\n'
            '  "seller_name": string,\n'
            '  "buyer_name": string,\n'
            '  "product_item":string,\n'
            '  "description": string,\n'
            '  "quantity": number,\n'
            '  "unit_price": number,\n'
	        '  "total_product_price":number,\n'	
            '  "all_total_before_tax": number,\n'
            '  "vat": number,\n'
            '  "all_total_amount_including_VAT": number,\n'
            '  "payment_terms": string,\n'
            '  "payment_method": string\n'
            "}\n\n"
            "Only output the JSON object. File image name: " + image_path + "\n"
            "OCR text: " + text
        )
    else:
        prompt = (
            f"You are an expert OCR text corrector. The following text was extracted from an image. "
            "Correct any errors and output EXACTLY valid JSON with a single key \"Extracted_Text\" containing the corrected text. "
            "File image name: " + image_path + "\n"
            "OCR text: " + text
        )
    try:
        response = genai.GenerativeModel("gemini-1.5-flash").generate_content(prompt) 
        
        output_text = response.text.strip()
        return output_text
    except Exception as e:
        print("LLM formatting error:", e)
        return {}

# classification by llm
def classify_document(text):
    prompt = (
        "You are an expert document classifier. Classify the following OCR extracted text into one of three categories: "
        "Invoice, PurchaseOrder, or Bill. Return only one word: 'Invoice', 'PurchaseOrder', or 'Bill'. OCR text: " + text
    )
    try:
        response = genai.GenerativeModel("gemini-1.5-flash").generate_content(prompt)
        classification = response.text.strip()
        print("LLM classification output:", classification)
        if "Invoice" in classification:
            return "Invoice"
        elif "PurchaseOrder" in classification:
            return "PurchaseOrder"
        elif "Bill" in classification or "Receipt" in classification:
            return "Bill"
        else:
            return "Unknown"
    except Exception as e:
        print("LLM classification error:", e)
        lower_text = text.lower()
        if "tax invoice" in lower_text or "vat" in lower_text or "ภาษีมูลค่าเพิ่ม" in lower_text:
            return "Invoice"
        elif "receipt" in lower_text or "ใบเสร็จรับเงิน" in lower_text:
            return "Bill"
        elif "order no" in lower_text or "po" in lower_text or "purchase order" in lower_text or "วันที่สั่งซื้อ" in lower_text:
            return "PurchaseOrder"
        else:
            return "Unknown"

def send_to_node_backend(json_data, filename):
    try:
        response = requests.post(NODE_BACKEND_URL, json=json_data)
        print(f"Sent data from {filename} to Node.js backend, response status: {response.status_code}")
    except Exception as e:
        print(f"Error sending {filename} to Node.js backend: {e}")



@app.route("/extract", methods=["POST"])
def extract():
    if 'files' not in request.files:
        return jsonify({"error": "No files part in request"}), 400

    files = request.files.getlist("files")
    temp_folder = "temp_uploads"
    os.makedirs(temp_folder, exist_ok=True)

    all_formatted_data = []

    for file in files:
        if file and allowed_file(file.filename):
            filepath = os.path.join(temp_folder, file.filename)
            file.save(filepath)
            raw_text = extract_text(filepath)
            doc_type = classify_document(raw_text)
            formatted_data = llm_format_data(raw_text, doc_type, file.filename)
            print("formatted_data: " + formatted_data)
            
            all_formatted_data.append({
                "filename": file.filename,
                "formatted_data": formatted_data
            })
            
            os.remove(filepath)

    print("all_formatted_data: ", all_formatted_data)
    return all_formatted_data

if __name__ == "__main__":
    app.run(port=5001, debug=True)
