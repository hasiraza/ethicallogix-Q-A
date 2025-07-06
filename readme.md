# Ethicallogix File Q&A Web Application


A full-stack web application that allows users to upload files and ask questions about their content using AI-powered responses via OpenAI API.

## Features

- **File Upload**: Support for TXT, PDF, DOCX, CSV, and JSON files
- **AI-Powered Q&A**: Uses OpenAI GPT-3.5-turbo to answer questions about uploaded files
- **Multiple File Management**: Upload and manage multiple files simultaneously
- **Interactive Chat Interface**: Clean, modern UI for asking questions and viewing responses
- **File Operations**: Delete files when no longer needed
- **Real-time Updates**: Instant responses and file management

## Tech Stack

### Backend (Python Flask)
- Flask web framework
- OpenAI API integration
- File processing for multiple formats
- CORS support for frontend integration
- RESTful API design

### Frontend (React)
- Modern React with hooks
- Tailwind CSS for styling
- Lucide React icons
- Responsive design
- Real-time file management

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 14+
- OpenAI API key

### Backend Setup

1. **Clone and navigate to project directory**
```bash
git clone <your-repo>
cd file-qa-app
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install Python dependencies**
```bash
pip install -r requirements.txt
```

4. **Set up environment variables**
```bash
# Create .env file
echo "OPENAI_API_KEY=your_openai_api_key_here" > .env
```

5. **Run the Flask server**
```bash
python app.py
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. **Create React app (if starting fresh)**
```bash
npx create-react-app frontend
cd frontend
```

2. **Install dependencies**
```bash
npm install lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

3. **Configure Tailwind CSS**
Update `tailwind.config.js`:
```javascript
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

4. **Add Tailwind to CSS**
Replace contents of `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

5. **Replace App.js with the React component**
Copy the React component code to `src/App.js`

6. **Start the development server**
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### POST /upload
Upload a new file
- **Body**: FormData with 'file' field
- **Response**: File ID and metadata

### POST /ask
Ask a question about an uploaded file
- **Body**: JSON with 'question' and 'file_id'
- **Response**: AI-generated answer

### GET /files
Get list of all uploaded files
- **Response**: Array of file metadata

### DELETE /file/{file_id}
Delete a specific file
- **Response**: Success message

## Usage

1. **Upload Files**: Click "Choose File" and select documents (TXT, PDF, DOCX, CSV, JSON)
2. **Select File**: Click on any uploaded file to select it for questioning
3. **Ask Questions**: Type your question in the input field and click "Ask"
4. **View Answers**: AI-powered responses appear in the chat interface
5. **Manage Files**: Delete files using the trash icon

## File Support

- **TXT**: Plain text files
- **PDF**: Portable Document Format
- **DOCX**: Microsoft Word documents
- **CSV**: Comma-separated values
- **JSON**: JavaScript Object Notation

## Security Considerations

- File uploads are limited to 16MB
- Only specific file types are allowed
- Filenames are sanitized for security
- CORS is configured for frontend access

## Deployment

### Backend Deployment
- Use production WSGI server (Gunicorn, uWSGI)
- Set environment variables for OpenAI API key
- Configure proper file storage (AWS S3, etc.)
- Set up database for production use

### Frontend Deployment
- Build for production: `npm run build`
- Serve static files with Nginx/Apache
- Update API endpoints for production backend

## Environment Variables

```bash
OPENAI_API_KEY=your_openai_api_key_here
FLASK_ENV=production  # for production
```

## Troubleshooting

### Common Issues

1. **OpenAI API Key Error**
   - Ensure your API key is set in environment variables
   - Check API key has sufficient credits

2. **File Upload Issues**
   - Verify file size is under 16MB
   - Check file format is supported

3. **CORS Issues**
   - Ensure Flask-CORS is installed
   - Check frontend API URL matches backend

4. **Missing Dependencies**
   - Install all requirements: `pip install -r requirements.txt`
   - For React: `npm install`

## License

MIT License - Feel free to use and modify as needed.
