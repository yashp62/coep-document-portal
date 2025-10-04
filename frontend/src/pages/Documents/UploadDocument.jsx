import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { documentService } from '../../services/documentService';
import universityBodyService from '../../services/universityBodyService';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import toast from 'react-hot-toast';

const UploadDocument = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file: null,
    university_body_id: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [universityBodies, setUniversityBodies] = useState([]);
  const [loadingBodies, setLoadingBodies] = useState(true);
  const [userUniversityBody, setUserUniversityBody] = useState(null);

  const isDirector = user?.role === 'director';
  const isSuperAdmin = user?.role === 'super_admin';

  useEffect(() => {
    const fetchUniversityBodies = async () => {
      try {
        setLoadingBodies(true);
        const response = await universityBodyService.getAllUniversityBodies({ limit: 1000 });
        const bodies = response.data?.universityBodies || [];
        setUniversityBodies(bodies);
        
        // If user is a director, find their associated university body
        if (isDirector && user?.id) {
          const userBody = bodies.find(body => body.director_id === user.id);
          if (userBody) {
            setUserUniversityBody(userBody);
            setFormData(prev => ({
              ...prev,
              university_body_id: userBody.id.toString()
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching university bodies:', error);
        toast.error('Failed to load university bodies');
      } finally {
        setLoadingBodies(false);
      }
    };

    fetchUniversityBodies();
  }, [isDirector, user?.id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      file: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validate required fields
      if (!formData.title || !formData.file) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Create FormData for file upload
      const uploadData = new FormData();
      uploadData.append('title', formData.title);
      uploadData.append('description', formData.description);
      uploadData.append('file', formData.file);
      uploadData.append('is_public', true); // Default to public
      
      if (formData.university_body_id) {
        uploadData.append('university_body_id', formData.university_body_id);
      }

      // Upload document
      await documentService.uploadDocument(uploadData);
      
      toast.success('Document uploaded successfully!');
      navigate('/admin/documents');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(error.response?.data?.message || 'Failed to upload document');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Upload Document</h1>
        <p className="text-gray-600">Upload a new document to the system</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* University Body Selection - Only for Super Admin */}
          {isSuperAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                University Body <span className="text-gray-400">(Optional)</span>
              </label>
              <select
                name="university_body_id"
                value={formData.university_body_id}
                onChange={handleInputChange}
                disabled={loadingBodies}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="">
                  {loadingBodies ? 'Loading university bodies...' : 'Select University Body'}
                </option>
                {universityBodies.map((body) => (
                  <option key={body.id} value={body.id}>
                    {body.name} ({body.type})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Display assigned university body for Directors */}
          {isDirector && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                University Body
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
                {userUniversityBody ? (
                  `${userUniversityBody.name} (${userUniversityBody.type})`
                ) : (
                  'No university body assigned'
                )}
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Documents will be automatically assigned to your university body.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Uploading...' : 'Upload Document'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/admin/documents')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default UploadDocument;