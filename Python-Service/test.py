import cv2
import numpy as np
import pytesseract
import easyocr
import re
import os
import pandas as pd
from PIL import Image
from flask import Flask, request, render_template, send_file
from werkzeug.utils import secure_filename

# โฟลเดอร์สำหรับอัปโหลดและนามสกุลไฟล์ที่อนุญาต
UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# ฟังก์ชันแก้ภาพเอียง (Deskew) โดยใช้ Hough Transform
def deskew_image(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150, apertureSize=3)
    lines = cv2.HoughLines(edges, 1, np.pi/180, 200)
    if lines is not None:
        angles = []
        for rho, theta in lines[:, 0]:
            angle = (theta * 180/np.pi) - 90
            angles.append(angle)
        if len(angles) > 0:
            median_angle = np.median(angles)
            (h, w) = image.shape[:2]
            center = (w // 2, h // 2)
            M = cv2.getRotationMatrix2D(center, median_angle, 1.0)
            rotated = cv2.warpAffine(image, M, (w, h),
                                     flags=cv2.INTER_CUBIC,
                                     borderMode=cv2.BORDER_REPLICATE)
            return rotated
    return image

# ฟังก์ชันปรับปรุงคุณภาพของภาพก่อน OCR
def preprocess_image(image_path):
    image = cv2.imread(image_path)
    image = deskew_image(image)  # ปรับภาพให้ตรง
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    thresh = cv2.adaptiveThreshold(gray, 255,
                                   cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                   cv2.THRESH_BINARY, 31, 10)
    kernel = np.ones((1,1), np.uint8)
    processed = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
    return processed

# ฟังก์ชัน OCR ดึงข้อความจากภาพด้วย Tesseract และ EasyOCR
def extract_text(image_path):
    image = preprocess_image(image_path)
    pil_image = Image.fromarray(image)
    tesseract_text = pytesseract.image_to_string(pil_image, lang="eng+tha")
    reader = easyocr.Reader(['en', 'th'])
    easyocr_text = reader.readtext(image_path, detail=0)
    return tesseract_text + " " + " ".join(easyocr_text)

# ฟังก์ชันจำแนกประเภทเอกสารจากข้อความ OCR
def classify_document(text):
    if re.search(r"\b(TAX INVOICE|VAT|ภาษีมูลค่าเพิ่ม)\b", text, re.IGNORECASE):
        return "ใบกำกับภาษี"
    elif re.search(r"\b(RECEIPT|ใบเสร็จรับเงิน)\b", text, re.IGNORECASE):
        return "ใบเสร็จ"
    elif re.search(r"\b(ORDER NO|PO|PURCHASE ORDER|วันที่สั่งซื้อ)\b", text, re.IGNORECASE):
        return "ใบสั่งซื้อสินค้า"
    else:
        return "ไม่ทราบประเภท"

# ฟังก์ชันดึงข้อมูลสำหรับแต่ละประเภท (ตัวอย่างแบบ dummy)
def extract_data_receipt(text):
    date = re.search(r"\d{2}/\d{2}/\d{4}", text)
    total = re.search(r"TOTAL\s*[:\-]?\s*([\d,]+\.\d{2})", text, re.IGNORECASE)
    return {
        "Date": date.group(0) if date else "ไม่พบข้อมูล",
        "Store Name": "ไม่พบข้อมูล",  # สามารถปรับปรุงให้ดึงจาก OCR ได้
        "Items": "ไม่พบข้อมูล",
        "Quantity": "ไม่พบข้อมูล",
        "Price": "ไม่พบข้อมูล",
        "Total": total.group(1) if total else "ไม่พบข้อมูล"
    }

def extract_data_tax_invoice(text):
    date = re.search(r"\d{2}/\d{2}/\d{4}", text)
    invoice_no = re.search(r"INV\s*[:\-]?\s*(\d+)", text, re.IGNORECASE)
    tax_id = re.search(r"(\d{13})", text)
    total = re.search(r"TOTAL\s*[:\-]?\s*([\d,]+\.\d{2})", text, re.IGNORECASE)
    return {
        "Invoice No": invoice_no.group(1) if invoice_no else "ไม่พบข้อมูล",
        "Date": date.group(0) if date else "ไม่พบข้อมูล",
        "Company": "ไม่พบข้อมูล",  # สามารถปรับปรุงให้ดึงข้อมูลบริษัทได้
        "Tax ID": tax_id.group(1) if tax_id else "ไม่พบข้อมูล",
        "VAT": "ไม่พบข้อมูล",      # สามารถปรับปรุงให้ดึงข้อมูล VAT ได้
        "Total": total.group(1) if total else "ไม่พบข้อมูล"
    }

def extract_data_purchase_order(text):
    date = re.search(r"\d{2}/\d{2}/\d{4}", text)
    order_no = re.search(r"ORDER\s*NO\s*[:\-]?\s*(\d+)", text, re.IGNORECASE)
    return {
        "Order No": order_no.group(1) if order_no else "ไม่พบข้อมูล",
        "Date": date.group(0) if date else "ไม่พบข้อมูล",
        "Supplier": "ไม่พบข้อมูล",  # สามารถปรับปรุงให้ดึงข้อมูล Supplier ได้
        "Items": "ไม่พบข้อมูล",
        "Quantity": "ไม่พบข้อมูล",
        "Price": "ไม่พบข้อมูล"
    }

def extract_data_unknown(text):
    # สำหรับประเภทที่ไม่ทราบ ให้เก็บข้อความทั้งหมด
    return {"Extracted Text": text.strip()}

# กำหนด fixed columns สำหรับแต่ละประเภท (ทุกประเภทมี "Image Name")
doc_fixed_columns = {
    "ใบเสร็จ": ["Image Name", "Date", "Store Name", "Items", "Quantity", "Price", "Total"],
    "ใบกำกับภาษี": ["Image Name", "Invoice No", "Date", "Company", "Tax ID", "VAT", "Total"],
    "ใบสั่งซื้อสินค้า": ["Image Name", "Order No", "Date", "Supplier", "Items", "Quantity", "Price"],
    "ไม่ทราบประเภท": ["Image Name", "Extracted Text"]
}

# สร้าง DataFrame ว่างสำหรับเก็บข้อมูลของแต่ละประเภท
data = {doc_type: pd.DataFrame(columns=columns) for doc_type, columns in doc_fixed_columns.items()}

# สร้าง Flask App
app = Flask(__name__)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

@app.route("/", methods=["GET", "POST"])
def upload_file():
    if request.method == "POST":
        if "files[]" not in request.files:
            return "No file part"
        
        files = request.files.getlist("files[]")
        
        for file in files:
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
                file.save(filepath)
                
                text = extract_text(filepath)
                doc_type = classify_document(text)
                
                # ดึงข้อมูลตามประเภทเอกสาร
                if doc_type == "ใบเสร็จ":
                    extracted = extract_data_receipt(text)
                elif doc_type == "ใบกำกับภาษี":
                    extracted = extract_data_tax_invoice(text)
                elif doc_type == "ใบสั่งซื้อสินค้า":
                    extracted = extract_data_purchase_order(text)
                else:
                    extracted = extract_data_unknown(text)
                
                # เพิ่มข้อมูลชื่อไฟล์ (Image Name)
                extracted["Image Name"] = filename
                
                # สร้าง row ที่มีเฉพาะ key ตาม fixed columns ของประเภทนั้น
                row = {col: extracted.get(col, "ไม่พบข้อมูล") for col in doc_fixed_columns[doc_type]}
                
                # เพิ่ม row ลงใน DataFrame ของประเภทนั้น
                data[doc_type] = pd.concat([data[doc_type], pd.DataFrame([row])], ignore_index=True)
        
        output_file = "extracted_data.xlsx"
        with pd.ExcelWriter(output_file) as writer:
            for category, df in data.items():
                df.to_excel(writer, sheet_name=category, index=False)
        
        return send_file(output_file, as_attachment=True)
    
    return render_template("upload.html")

if __name__ == "__main__":
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    app.run(debug=True)
