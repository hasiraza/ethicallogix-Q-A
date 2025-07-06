from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import os
from openai import OpenAI  # ✅ New official SDK
from werkzeug.utils import secure_filename
import PyPDF2
import docx
import json
from datetime import datetime
import logging
from dotenv import load_dotenv
load_dotenv(dotenv_path=".env")


print("LOADED:", os.getenv("OPENAI_API_KEY"))

# ✅ Initialize OpenAI client with explicit key
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ✅ Flask setup
app = Flask(
    __name__,
    static_folder='../frontend/build',
    static_url_path='/'
)
CORS(app)

# ✅ Config
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'docx', 'json', 'csv'}

# ✅ Ensure uploads folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# ✅ Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ✅ In-memory storage
uploaded_files = {}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_file(file_path, filename):
    try:
        if filename.endswith('.txt'):
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        elif filename.endswith('.pdf'):
            text = ""
            with open(file_path, 'rb') as f:
                reader = PyPDF2.PdfReader(f)
                for page in reader.pages:
                    text += page.extract_text() + "\n"
            return text
        elif filename.endswith('.docx'):
            doc = docx.Document(file_path)
            return "\n".join([p.text for p in doc.paragraphs])
        elif filename.endswith('.json'):
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.dumps(json.load(f), indent=2)
        elif filename.endswith('.csv'):
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
    except Exception as e:
        logger.error(f"Error extracting {filename}: {str(e)}")
        return None

def get_openai_response(question, context, max_tokens=1000):
    try:
        response = client.chat.completions.create(
            model="gpt-4o",  # ✅ Or any other model you want
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant. Answer using the provided document context."
                },
                {
                    "role": "user",
                    "content": f"Context:\n{context}\n\nQuestion: {question}"
                }
            ],
            max_tokens=max_tokens
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"OpenAI API error: {str(e)}")
        return f"Error: {str(e)}"

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
        filename = timestamp + filename
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        content = extract_text_from_file(file_path, filename)
        if content is None:
            return jsonify({'error': 'Could not extract file'}), 500
        file_id = filename
        uploaded_files[file_id] = {
            'filename': file.filename,
            'content': content,
            'upload_time': datetime.now().isoformat(),
            'file_path': file_path
        }
        return jsonify({
            'message': 'File uploaded',
            'file_id': file_id,
            'filename': file.filename,
            'content_length': len(content)
        }), 200
    return jsonify({'error': 'Invalid file type'}), 400

@app.route('/ask', methods=['POST'])
def ask_question():
    data = request.get_json()
    if not data or 'question' not in data or 'file_id' not in data:
        return jsonify({'error': 'Missing question or file_id'}), 400
    question = data['question']
    file_id = data['file_id']
    if file_id not in uploaded_files:
        return jsonify({'error': 'File not found'}), 404
    content = uploaded_files[file_id]['content']
    answer = get_openai_response(question, content)
    return jsonify({
        'question': question,
        'answer': answer,
        'filename': uploaded_files[file_id]['filename'],
        'timestamp': datetime.now().isoformat()
    }), 200

@app.route('/files', methods=['GET'])
def list_files():
    return jsonify({
        'files': [
            {
                'file_id': fid,
                'filename': info['filename'],
                'upload_time': info['upload_time'],
                'content_length': len(info['content'])
            }
            for fid, info in uploaded_files.items()
        ]
    }), 200

@app.route('/delete/<file_id>', methods=['DELETE'])
def delete_file(file_id):
    if file_id not in uploaded_files:
        return jsonify({'error': 'File not found'}), 404
    try:
        os.remove(uploaded_files[file_id]['file_path'])
    except OSError as e:
        logger.error(f"Delete error: {str(e)}")
    del uploaded_files[file_id]
    return jsonify({'message': 'File deleted'}), 200

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'}), 200

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    if not os.getenv('OPENAI_API_KEY'):
        logger.warning("OPENAI_API_KEY not set!")
    else:
        logger.info(f"OPENAI_API_KEY loaded: {os.getenv('OPENAI_API_KEY')[:10]}...")
    app.run(debug=True, host='0.0.0.0', port=5000)
