import React, { useState, useRef } from 'react';
import { Upload, MessageSquare, File, Trash2, Send, Loader2, AlertCircle, Brain, Sparkles, FileText, Zap, Shield } from 'lucide-react';

const App = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [question, setQuestion] = useState('');
  const [conversations, setConversations] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const API_BASE_URL = 'http://localhost:5000';

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      const newFile = {
        id: result.file_id,
        name: result.filename,
        size: result.content_length,
        uploadTime: new Date().toISOString()
      };

      setUploadedFiles(prev => [...prev, newFile]);
      setSelectedFile(newFile);
      setConversations([]);
      
    } catch (error) {
      setError('Failed to upload file. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim() || !selectedFile) return;

    setIsAsking(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question,
          file_id: selectedFile.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get answer');
      }

      const result = await response.json();
      
      const newConversation = {
        id: Date.now(),
        question: result.question,
        answer: result.answer,
        timestamp: new Date().toISOString()
      };

      setConversations(prev => [...prev, newConversation]);
      setQuestion('');
      
    } catch (error) {
      setError('Failed to get answer. Please try again.');
      console.error('Ask error:', error);
    } finally {
      setIsAsking(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/delete/${fileId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
      
      if (selectedFile && selectedFile.id === fileId) {
        setSelectedFile(null);
        setConversations([]);
      }
      
    } catch (error) {
      setError('Failed to delete file. Please try again.');
      console.error('Delete error:', error);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-40 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header */}
          <div className="text-center mb-20">
            <div className="flex items-center justify-center mb-6">
              {/* Shield Icon */}
              <div className="relative mr-4">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-30 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-4 shadow-xl">
                  <Shield className="w-12 h-12 text-white" />
                </div>
              </div>
              
              {/* Brain Icon */}
              <div className="relative">
                <Brain className="w-12 h-12 text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text" />
              </div>
              
              <div className="ml-4">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                  Ethicallogix AI Assistant
                </h1>
                <div className="flex items-center justify-center space-x-2">
                  <Sparkles className="w-5 h-5 text-purple-500 animate-pulse" />
                  <p className="text-gray-600 text-lg">
                    Upload documents and ask questions - get AI-powered answers
                  </p>
                  <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
                </div>
              </div>
            </div>
            
            {/* Features Banner */}
            <div className="flex justify-center space-x-6 mb-8">
              <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                <FileText className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">Multiple Formats</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                <Zap className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-medium text-gray-700">Instant Answers</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                <Brain className="w-5 h-5 text-indigo-500" />
                <span className="text-sm font-medium text-gray-700">AI-Powered</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center shadow-lg animate-pulse">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Enhanced File Upload Section */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                <h2 className="text-xl font-semibold mb-6 flex items-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  <Upload className="w-5 h-5 mr-2 text-blue-500" />
                  Upload Files
                </h2>
                
                <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition-all duration-300">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.pdf,.docx,.json,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl flex items-center justify-center mx-auto disabled:opacity-50 transform hover:scale-105 transition-all duration-200 shadow-lg"
                  >
                    {isUploading ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                      <Upload className="w-5 h-5 mr-2" />
                    )}
                    {isUploading ? 'Uploading...' : 'Choose File'}
                  </button>
                  <p className="text-sm text-gray-600 mt-3 font-medium">
                    Supports: TXT, PDF, DOCX, JSON, CSV
                  </p>
                </div>
              </div>

              {/* Enhanced Uploaded Files List */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Uploaded Files
                </h3>
                
                {uploadedFiles.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No files uploaded yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {uploadedFiles.map((file) => (
                      <div
                        key={file.id}
                        className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                          selectedFile?.id === file.id 
                            ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 shadow-lg' 
                            : 'border-gray-200 hover:border-blue-300 bg-white/50 hover:bg-white/70'
                        }`}
                        onClick={() => {
                          setSelectedFile(file);
                          setConversations([]);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg mr-3">
                              <File className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-sm truncate text-gray-800">{file.name}</p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFile(file.id);
                            }}
                            className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Q&A Section */}
            <div className="lg:col-span-2">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 h-full border border-white/20">
                <h2 className="text-xl font-semibold mb-6 flex items-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  <MessageSquare className="w-5 h-5 mr-2 text-purple-500" />
                  Ask Questions
                </h2>

                {!selectedFile ? (
                  <div className="text-center py-16">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur opacity-20"></div>
                      <File className="w-20 h-20 text-gray-300 mx-auto relative z-10" />
                    </div>
                    <p className="text-gray-500 text-lg">Select a file to start asking questions</p>
                    <p className="text-gray-400 text-sm mt-2">Upload a document and let AI help you understand it</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200">
                      <div className="flex items-center">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg mr-3">
                          <FileText className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            Selected file: 
                          </p>
                          <p className="font-medium text-gray-800">{selectedFile.name}</p>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Question Input */}
                    <div className="flex space-x-3">
                      <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Ask a question about the file..."
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm placeholder-gray-400"
                        onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
                      />
                      <button
                        onClick={handleAskQuestion}
                        disabled={!question.trim() || isAsking}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl disabled:opacity-50 flex items-center transform hover:scale-105 transition-all duration-200 shadow-lg"
                      >
                        {isAsking ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {/* Enhanced Conversations */}
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {conversations.length === 0 ? (
                        <div className="text-center py-12">
                          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">No questions asked yet</p>
                          <p className="text-gray-400 text-sm mt-2">Start by typing a question above!</p>
                        </div>
                      ) : (
                        conversations.map((conv) => (
                          <div key={conv.id} className="border border-gray-200 rounded-xl p-6 space-y-4 bg-white/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                              <div className="flex items-center mb-2">
                                <div className="bg-blue-500 p-1 rounded-lg mr-2">
                                  <MessageSquare className="w-4 h-4 text-white" />
                                </div>
                                <p className="font-medium text-blue-800">Question:</p>
                              </div>
                              <p className="text-blue-700 ml-6">{conv.question}</p>
                            </div>
                            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                              <div className="flex items-center mb-2">
                                <div className="bg-green-500 p-1 rounded-lg mr-2">
                                  <Brain className="w-4 h-4 text-white" />
                                </div>
                                <p className="font-medium text-green-800">Answer:</p>
                              </div>
                              <p className="text-green-700 whitespace-pre-wrap ml-6">{conv.answer}</p>
                            </div>
                            <p className="text-xs text-gray-500 text-right">
                              {formatTime(conv.timestamp)}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;