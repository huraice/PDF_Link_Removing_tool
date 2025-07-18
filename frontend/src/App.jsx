import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [pdfFile, setPdfFile] = useState(null);
  const [cleanedPdfUrl, setCleanedPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);

  // Check backend connection on mount
useEffect(() => {
  axios.get('http://localhost:5000/ping')
    .then((res) => {
      console.log("Backend Response:", res);
      if (res.status === 200 && res.data.message) {
        setConnectionStatus("✅ " + res.data.message);
      } else {
        setConnectionStatus("❌ Unexpected response from backend");
      }
    })
    .catch((err) => {
      console.error("Connection Error:", err);
      setConnectionStatus("❌ Failed to connect to backend");
    });
}, []);

  const handleFileChange = (e) => {
    setPdfFile(e.target.files[0]);
    setCleanedPdfUrl(null);
  };

  const handleUpload = async () => {
    if (!pdfFile) {
      alert("Please upload a PDF file.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', pdfFile);

    try {
      const response = await axios.post('http://localhost:5000/clean-pdf', formData, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      setCleanedPdfUrl(url);
    } catch (error) {
      console.error("Error cleaning PDF:", error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 flex flex-col items-center justify-center p-6">
    <h1 className="text-4xl font-extrabold text-blue-700 mb-4">
      PDF External Link Remover
    </h1>

    {connectionStatus && (
      <div
        className={`mb-6 text-lg font-semibold ${
          connectionStatus.startsWith("✅") ? "text-green-600" : "text-red-500"
        }`}
      >
        {connectionStatus}
      </div>
    )}

    <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-md flex flex-col items-center">
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="mb-4 w-full text-gray-700"
      />

      {pdfFile && (
        <p className="mb-4 text-gray-800">
          Selected: <strong>{pdfFile.name}</strong>
        </p>
      )}

      <button
        onClick={handleUpload}
        disabled={!pdfFile || loading}
        className={`w-full px-6 py-2 rounded-lg text-white transition-all duration-300 ${
          loading || !pdfFile
            ? "bg-blue-300 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? 'Cleaning PDF...' : 'Remove External Links'}
      </button>

      {cleanedPdfUrl && (
        <a
          href={cleanedPdfUrl}
          download={`cleaned_${pdfFile.name}`}
          className="mt-6 w-full text-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-300"
        >
          Download Cleaned PDF
        </a>
      )}
    </div>
  </div>
);

}

export default App;
