# from flask import Flask, request, jsonify
# import os
# import tempfile
# from ocr import process_document
# import json
# import re

# app = Flask(__name__)

# def extract_json(text):
#     """Extract JSON object from a markdown formatted string if necessary."""
#     match = re.search(r"```json\s*(\{.*\})\s*```", text, re.DOTALL)
#     if match:
#         return match.group(1).strip()
#     return text.strip()

# @app.route('/process', methods=['POST'])
# def process_file():
#     if 'file' not in request.files:
#         return jsonify({'error': 'No file uploaded'}), 400

#     file = request.files['file']

#     # Use a temporary directory for file storage
#     with tempfile.TemporaryDirectory() as temp_dir:
#         file_path = os.path.join(temp_dir, file.filename)
#         file.save(file_path)

#         try:
#             # Process the uploaded image
#             structured_data = process_document(file_path)
#             print('Structured Data:', structured_data)  # Log the structured data

#             # Clean the structured_data to remove any markdown formatting
#             cleaned_data = extract_json(structured_data)

#             # Parse the cleaned JSON string into a dictionary
#             structured_dict = json.loads(cleaned_data)

#             # Format the JSON output
#             formatted_data = {
#                 "bills": {
#                     file.filename: {
#                         "receipt_number": structured_dict.get("receipt_number", ""),
#                         "receipt_date": structured_dict.get("receipt_date", ""),
#                         "payment_description": structured_dict.get("payment_description", ""),
#                         "payer_name": structured_dict.get("payer_name", ""),
#                         "payment_method": structured_dict.get("payment_method", ""),
#                         "amount_paid": structured_dict.get("amount_paid", 0.0)
#                     }
#                 },
#                 "invoice": {
#                     file.filename: {
#                         "buyer_name": structured_dict.get("buyer_name", ""),
#                         "seller_name": structured_dict.get("seller_name", ""),
#                         "invoice_date": structured_dict.get("invoice_date", ""),
#                         "invoice_number": structured_dict.get("invoice_number", ""),
#                         "description": structured_dict.get("description", ""),
#                         "quantity": structured_dict.get("quantity", 0),
#                         "unit_price": structured_dict.get("unit_price", 0.0),
#                         "total_before_tax": structured_dict.get("total_before_tax", 0.0),
#                         "vat": structured_dict.get("vat", 0.0),
#                         "total_amount_including_VAT": structured_dict.get("total_amount_including_VAT", 0.0),
#                         "payment_terms": structured_dict.get("payment_terms", ""),
#                         "payment_method": structured_dict.get("payment_method", "")
#                     }
#                 },
#                 "purchaseOrder": {
#                     file.filename: {
#                         "purchase_order_number": structured_dict.get("purchase_order_number", ""),
#                         "order_date": structured_dict.get("order_date", ""),
#                         "customer_name": structured_dict.get("customer_name", ""),
#                         "product_description": structured_dict.get("product_description", ""),
#                         "quantity": structured_dict.get("quantity", 0),
#                         "unit_price": structured_dict.get("unit_price", 0.0),
#                         "total_price": structured_dict.get("total_price", 0.0),
#                         "order_status": structured_dict.get("order_status", ""),
#                         "delivery_date": structured_dict.get("delivery_date", ""),
#                         "supplier_name": structured_dict.get("supplier_name", "")
#                     }
#                 }
#             }

#             return jsonify(formatted_data), 200
#         except Exception as e:
#             print('Error processing file:', str(e))  # Log the error
#             return jsonify({'error': str(e)}), 500

# if __name__ == '__main__':
#     app.run(port=5000)









# from flask import Flask, request, jsonify
# import os
# import tempfile
# import re
# import json
# from ocr import process_document

# app = Flask(__name__)

# def extract_json(text):
#     """Extract JSON object from a markdown formatted string if necessary."""
#     match = re.search(r"```json\s*(\{.*\})\s*```", text, re.DOTALL)
#     if match:
#         return match.group(1).strip()
#     return text.strip()

# @app.route('/process', methods=['POST'])
# def process_file():
#     if 'file' not in request.files:
#         return jsonify({'error': 'No file uploaded'}), 400

#     file = request.files['file']

#     # Save the uploaded file temporarily
#     with tempfile.TemporaryDirectory() as temp_dir:
#         file_path = os.path.join(temp_dir, file.filename)
#         file.save(file_path)

#         try:
#             # Process the file using OCR
#             structured_data = process_document(file_path)
#             print('Structured Data:', structured_data)  # Log the structured data

#             # Clean the structured_data to remove any markdown formatting
#             cleaned_data = extract_json(structured_data)

#             # Parse the cleaned JSON string into a dictionary
#             structured_dict = json.loads(cleaned_data)
#             return jsonify(structured_data,structured_dict), 200
#         except Exception as e:
#             return jsonify({'error': str(e)}), 500

# if __name__ == '__main__':
#     app.run(port=5000)


from flask import Flask, request, jsonify
import os
import tempfile
import re
import json
from ocr import process_document

app = Flask(__name__)

def extract_json(text):
    """Extract JSON object from a markdown formatted string if necessary."""
    match = re.search(r"```json\s*(\{.*\})\s*```", text, re.DOTALL)
    if match:
        return match.group(1).strip()
    return text.strip()

@app.route('/process', methods=['POST'])
def process_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']

    # Save the uploaded file temporarily
    with tempfile.TemporaryDirectory() as temp_dir:
        file_path = os.path.join(temp_dir, file.filename)
        file.save(file_path)

        try:
            # Process the file using OCR
            structured_data = process_document(file_path)
            print('Structured Data:', structured_data)  # Log the structured data

            # Clean the structured_data to remove any markdown formatting
            cleaned_data = extract_json(structured_data)

            # Parse the cleaned JSON string into a dictionary
            structured_dict = json.loads(cleaned_data)

            # Return the structured data as JSON response
            return jsonify(structured_dict), 200
        except Exception as e:
            # Log the error and provide more detailed information
            print(f"Error occurred while processing the file: {str(e)}")
            return jsonify({'error': f"Failed to process file: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(port=5000)
