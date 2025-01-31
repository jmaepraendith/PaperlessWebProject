# from flask import Flask, request, jsonify
# import os
# from ocr import process_document 

# app = Flask(__name__)

# @app.route('/process', methods=['POST'])
# def process_file():
#     if 'file' not in request.files:
#         return jsonify({'error': 'No file uploaded'}), 400

#     file = request.files['file']
#     file_path = os.path.join('/tmp', file.filename)
#     file.save(file_path)

#     try:
#         # Process the uploaded image
#         text, _ = process_document(file_path)

#         # Generate structured data from OCR text
#         structured_data = {
#             "invoice_number": "12345",
#             "buyer_name": "John Doe",
#             "seller_name": "ACME Corp.",
#             "invoice_date": "2025-01-01",
#             "quantity": 10,
#             "unit_price": 100,
#             "total_before_tax": 1000,
#             "vat": 70,
#             "total_amount_including_VAT": 1070,
#             "payment_terms": "Net 30",
#             "payment_method": "Credit Card"
#         }

#         return jsonify(structured_data), 200
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500
#     finally:
#         os.remove(file_path)

# if __name__ == '__main__':
#     app.run(port=5000)


from flask import Flask, request, jsonify
import os
from ocr import process_document

app = Flask(__name__)

@app.route('/process', methods=['POST'])
def process_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    file_path = os.path.join('/tmp', file.filename)
    file.save(file_path)

    try:
        # Process the uploaded image
        structured_data = process_document(file_path)
        return jsonify(structured_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        os.remove(file_path)

if __name__ == '__main__':
    app.run(port=5000)
