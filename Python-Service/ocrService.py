import os
import re
import cv2
import numpy as np
import pytesseract
import easyocr
from PIL import Image
from flask import Flask, request, jsonify

app = Flask(__name__)
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# --- Preprocessing functions ---
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

# --- OCR extraction ---
def extract_text(image_path):
    image = preprocess_image(image_path)
    pil_image = Image.fromarray(image)
    # Use Tesseract
    tesseract_text = pytesseract.image_to_string(pil_image, lang="eng+tha")
    # Use EasyOCR
    reader = easyocr.Reader(['en', 'th'])
    easyocr_result = reader.readtext(image_path, detail=0)
    combined_text = tesseract_text + " " + " ".join(easyocr_result)
    # Log the raw OCR text for debugging
    print("Extracted OCR text for {}:".format(image_path))
    print(combined_text)
    return combined_text

# --- Document classification ---
def classify_document(text):
    # Use a lower-case version to compare
    lower_text = text.lower()
    if "tax invoice" in lower_text or "vat" in lower_text or "ภาษีมูลค่าเพิ่ม" in lower_text:
        return "Invoice"  # tax invoice
    elif "receipt" in lower_text or "ใบเสร็จรับเงิน" in lower_text:
        return "Bill"  # receipt
    elif "order no" in lower_text or "po" in lower_text or "purchase order" in lower_text or "วันที่สั่งซื้อ" in lower_text:
        return "PurchaseOrder"
    else:
        return "Unknown"

# --- Data extraction per type ---
def extract_data_bill(text):
    # Try to extract based on expected keywords; you may need to adjust these
    receipt_number = re.search(r"receipt\s*#\s*(\S+)", text, re.IGNORECASE)
    receipt_date   = re.search(r"(\d{2}/\d{2}/\d{4})", text)
    amount_paid    = re.search(r"paid\s*\$([\d,]+\.\d{2})", text, re.IGNORECASE)
    payment_method = re.search(r"(cash|credit|transfer)", text, re.IGNORECASE)
    payer_name     = re.search(r"payer:\s*([A-Za-z\s]+)", text, re.IGNORECASE)
    payment_desc   = re.search(r"description:\s*(.+)", text, re.IGNORECASE)
    return {
        "receipt_number": receipt_number.group(1) if receipt_number else "",
        "receipt_date": receipt_date.group(0) if receipt_date else "",
        "amount_paid": amount_paid.group(1) if amount_paid else "",
        "payment_method": payment_method.group(1) if payment_method else "",
        "payer_name": payer_name.group(1).strip() if payer_name else "",
        "payment_description": payment_desc.group(1).strip() if payment_desc else ""
    }

def extract_data_invoice(text):
    invoice_number = re.search(r"invoice\s*#\s*(\S+)", text, re.IGNORECASE)
    invoice_date   = re.search(r"(\d{2}/\d{2}/\d{4})", text)
    seller_name    = re.search(r"seller:\s*([A-Za-z\s]+)", text, re.IGNORECASE)
    buyer_name     = re.search(r"buyer:\s*([A-Za-z\s]+)", text, re.IGNORECASE)
    description    = re.search(r"desc:\s*(.+)", text, re.IGNORECASE)
    quantity       = re.search(r"quantity:\s*(\d+)", text, re.IGNORECASE)
    unit_price     = re.search(r"unit price:\s*\$([\d,]+\.\d{2})", text, re.IGNORECASE)
    total_before   = re.search(r"subtotal:\s*\$([\d,]+\.\d{2})", text, re.IGNORECASE)
    vat            = re.search(r"vat:\s*\$([\d,]+\.\d{2})", text, re.IGNORECASE)
    total_incl_vat = re.search(r"total:\s*\$([\d,]+\.\d{2})", text, re.IGNORECASE)
    payment_terms  = re.search(r"terms:\s*(.+)", text, re.IGNORECASE)
    payment_method = re.search(r"(cash|credit|transfer)", text, re.IGNORECASE)
    return {
        "invoice_number": invoice_number.group(1) if invoice_number else "",
        "invoice_date": invoice_date.group(0) if invoice_date else "",
        "seller_name": seller_name.group(1).strip() if seller_name else "",
        "buyer_name": buyer_name.group(1).strip() if buyer_name else "",
        "description": description.group(1).strip() if description else "",
        "quantity": quantity.group(1) if quantity else "",
        "unit_price": unit_price.group(1) if unit_price else "",
        "total_before_tax": total_before.group(1) if total_before else "",
        "vat": vat.group(1) if vat else "",
        "total_amount_including_VAT": total_incl_vat.group(1) if total_incl_vat else "",
        "payment_terms": payment_terms.group(1).strip() if payment_terms else "",
        "payment_method": payment_method.group(1) if payment_method else ""
    }

def extract_data_purchase_order(text):
    po_number    = re.search(r"po\s*#\s*(\S+)", text, re.IGNORECASE)
    order_date   = re.search(r"(\d{2}/\d{2}/\d{4})", text)
    customer_name= re.search(r"customer:\s*([A-Za-z\s]+)", text, re.IGNORECASE)
    product_desc = re.search(r"product:\s*(.+)", text, re.IGNORECASE)
    quantity     = re.search(r"quantity:\s*(\d+)", text, re.IGNORECASE)
    unit_price   = re.search(r"unit price:\s*\$([\d,]+\.\d{2})", text, re.IGNORECASE)
    total_price  = re.search(r"total price:\s*\$([\d,]+\.\d{2})", text, re.IGNORECASE)
    supplier_name= re.search(r"supplier:\s*([A-Za-z\s]+)", text, re.IGNORECASE)
    order_status = re.search(r"(pending|shipped|completed)", text, re.IGNORECASE)
    delivery_date= re.search(r"delivery date:\s*(\d{2}/\d{2}/\d{4})", text, re.IGNORECASE)
    return {
        "purchase_order_number": po_number.group(1) if po_number else "",
        "order_date": order_date.group(0) if order_date else "",
        "customer_name": customer_name.group(1).strip() if customer_name else "",
        "product_description": product_desc.group(1).strip() if product_desc else "",
        "quantity": quantity.group(1) if quantity else "",
        "unit_price": unit_price.group(1) if unit_price else "",
        "total_price": total_price.group(1) if total_price else "",
        "supplier_name": supplier_name.group(1).strip() if supplier_name else "",
        "order_status": order_status.group(1) if order_status else "",
        "delivery_date": delivery_date.group(1) if delivery_date else ""
    }

# --- Endpoint to receive multiple files ---
@app.route("/extract", methods=["POST"])
def extract():
    if 'files' not in request.files:
        return jsonify({"error": "No files part in request"}), 400

    files = request.files.getlist("files")
    results = {
        "bills": [],
        "invoices": [],
        "purchaseOrders": [],
        "unknown": []
    }

    temp_folder = "temp_uploads"
    os.makedirs(temp_folder, exist_ok=True)

    for file in files:
        if file and allowed_file(file.filename):
            filepath = os.path.join(temp_folder, file.filename)
            file.save(filepath)
            text = extract_text(filepath)
            doc_type = classify_document(text)
            if doc_type == "Bill":
                data = extract_data_bill(text)
                data["file_image_name"] = file.filename
                results["bills"].append(data)
            elif doc_type == "Invoice":
                data = extract_data_invoice(text)
                data["file_image_name"] = file.filename
                results["invoices"].append(data)
            elif doc_type == "PurchaseOrder":
                data = extract_data_purchase_order(text)
                data["file_image_name"] = file.filename
                results["purchaseOrders"].append(data)
            else:
                results["unknown"].append({
                    "file_image_name": file.filename,
                    "Extracted_Text": text.strip()
                })
            os.remove(filepath)

    return jsonify(results)

if __name__ == "__main__":
    app.run(port=5001, debug=True)
