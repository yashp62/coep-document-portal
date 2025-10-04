import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import SkeletonLoader from '../../components/UI/SkeletonLoader';
import EmptyState from '../../components/UI/EmptyState';
import { documentService } from '../../services/documentService';
import { Search, Filter, FileText, Calendar, Download, Eye, Upload } from 'lucide-react';
import { formatDate, formatFileSize, truncateText } from '../../utils/format';

const MyDocuments = () => {
  const { user } = useSelector((state) => state.auth);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMyDocuments();
  }, []);

  const fetchMyDocuments = async () => {
    setIsLoading(true);
    try {
      let params = {};
      
      // Different behavior based on user role
      if (user?.role === 'super_admin') {
        // Super admin sees only their own uploaded documents
        params.only_mine = 'true';
      } else if (user?.role === 'admin' || user?.role === 'sub_admin') {
        // Admin and sub-admin see all documents from their university body
        params.only_university_body = 'true';
      }
      
      const res = await documentService.getMyDocuments(params);
      setDocuments(res.data.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = (documentId) => {
    window.open(`/api/documents/${documentId}/preview`, '_blank');
  };

  const handleDownload = async (documentId) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'document';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card><Card.Body><SkeletonLoader.DocumentGrid count={3} /></Card.Body></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Documents</h1>
          <p className="text-gray-600">
            {user?.role === 'super_admin' 
              ? `Documents you have uploaded (${documents.length} total)`
              : `Documents in your university body (${documents.length} total)`
            }
          </p>
        </div>
        <Button as={Link} to="/admin/documents/upload">
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      <Card className="shadow-sm">
        <Card.Header>
          <h3 className="text-lg font-medium">Your Documents</h3>
        </Card.Header>
        <Card.Body className="p-0">
          {documents.length === 0 ? (
            <div className="p-6">
              <EmptyState.NoMyDocuments onUpload={() => window.location.href = '/admin/documents/upload'} />
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {documents.map((document) => (
                <div key={document.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start gap-4">
                    <FileText className="h-8 w-8 text-blue-600 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">{document.title}</h4>
                        <button
                          onClick={() => handlePreview(document.id)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="h-4 w-4 inline mr-1" />Preview
                        </button>
                      </div>
                      {document.description && (
                        <p className="text-sm text-gray-600 mb-3">{truncateText(document.description, 150)}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span><Calendar className="h-3 w-3 inline mr-1" />{formatDate(document.created_at)}</span>
                        <span>{formatFileSize(document.file_size)}</span>
                        <span><Download className="h-3 w-3 inline mr-1" />{document.download_count || 0} downloads</span>
                      </div>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => handleDownload(document.id)}>
                      <Download className="h-4 w-4 mr-2" />Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default MyDocuments;