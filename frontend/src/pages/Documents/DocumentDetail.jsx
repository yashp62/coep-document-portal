import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import ErrorMessage from '../../components/UI/ErrorMessage';

const DocumentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchDocument();
  }, [id]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/documents/${id}`);
      setDocument(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch document');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const response = await api.get(`/documents/${id}/download`, {
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', document.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to download document');
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await api.delete(`/documents/${id}`);
      navigate('/documents');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete document');
    }
  };

  const canEdit = user && (
    user.role === 'super_admin' || 
    user.role === 'board_director' || 
    user.role === 'committee_director' ||
    document?.uploadedBy === user.id
  );

  const canDelete = user && (
    user.role === 'super_admin' || 
    document?.uploadedBy === user.id
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!document) return <ErrorMessage message="Document not found" />;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {document.title}
            </h1>
            <p className="text-gray-600">{document.description}</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => navigate('/documents')}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Back to Documents
            </button>
          </div>
        </div>

        {/* Document Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Document Information</h3>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Category:</span>
                <span className="ml-2">{document.Category?.name || 'Uncategorized'}</span>
              </div>
              <div>
                <span className="font-medium">File Type:</span>
                <span className="ml-2">{document.mimeType}</span>
              </div>
              <div>
                <span className="font-medium">File Size:</span>
                <span className="ml-2">{(document.fileSize / 1024 / 1024).toFixed(2)} MB</span>
              </div>
              <div>
                <span className="font-medium">Uploaded:</span>
                <span className="ml-2">{new Date(document.createdAt).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="font-medium">Uploaded by:</span>
                <span className="ml-2">{document.User?.name || 'Unknown'}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Access Information</h3>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Visibility:</span>
                <span className="ml-2 capitalize">{document.visibility}</span>
              </div>
              {document.Board && (
                <div>
                  <span className="font-medium">Board:</span>
                  <span className="ml-2">{document.Board.name}</span>
                </div>
              )}
              {document.Committee && (
                <div>
                  <span className="font-medium">Committee:</span>
                  <span className="ml-2">{document.Committee.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tags */}
        {document.tags && document.tags.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {document.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-4 pt-6 border-t">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {downloading ? 'Downloading...' : 'Download'}
          </button>

          {canEdit && (
            <button
              onClick={() => navigate(`/documents/${id}/edit`)}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Edit
            </button>
          )}

          {canDelete && (
            <button
              onClick={handleDelete}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentDetail;
