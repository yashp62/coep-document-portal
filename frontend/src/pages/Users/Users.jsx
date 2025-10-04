import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { userService } from '../../services/userService';

const Users = () => {
  const { user } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    designation: '',
    phone: '',
    role: 'director'
  });

  const isSuperAdmin = user?.role === 'super_admin';

  useEffect(() => {
    if (isSuperAdmin) {
      fetchUsers();
    }
  }, [isSuperAdmin]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await userService.getUsers();
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = { ...formData };
      
      // For updates, remove password if it's empty
      if (editingUser && !submitData.password) {
        delete submitData.password;
      }
      
      if (editingUser) {
        await userService.updateUser(editingUser.id, submitData);
      } else {
        await userService.createUser(submitData);
      }
      
      setFormData({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        designation: '',
        phone: '',
        role: 'director'
      });
      setShowCreateForm(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  };

  const handleEdit = (userToEdit) => {
    setEditingUser(userToEdit);
    setFormData({
      email: userToEdit.email,
      password: '', // Don't populate password for editing
      first_name: userToEdit.first_name || '',
      last_name: userToEdit.last_name || '',
      designation: userToEdit.designation || '',
      phone: userToEdit.phone || '',
      role: userToEdit.role
    });
    setShowCreateForm(true);
  };

  const handleToggleActive = async (userId, isActive) => {
    try {
      await userService.toggleUserStatus(userId);
      fetchUsers();
    } catch (error) {
      console.error('Failed to toggle user status:', error);
    }
  };

  const handleDelete = async (userId, userEmail) => {
    if (userId === user.id) {
      alert("You cannot delete your own account.");
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete user "${userEmail}"? This action cannot be undone.`)) {
      try {
        await userService.deleteUser(userId);
        fetchUsers();
      } catch (error) {
        console.error('Failed to delete user:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      designation: '',
      phone: '',
      role: 'director'
    });
    setShowCreateForm(false);
    setEditingUser(null);
  };

  if (!isSuperAdmin) {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="text-red-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-500">You don't have permission to manage users.</p>
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage system users and permissions</p>
        </div>
        {!showCreateForm && (
          <Button onClick={() => setShowCreateForm(true)}>
            Create User
          </Button>
        )}
      </div>

      {showCreateForm && (
        <Card className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {editingUser ? 'Edit User' : 'Create New User'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required={!editingUser}
                placeholder={editingUser ? 'Leave blank to keep current password' : 'Enter password'}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="director">Director</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <Input
                label="First Name"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
              />
              <Input
                label="Last Name"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
              />
              <Input
                label="Designation"
                name="designation"
                value={formData.designation}
                onChange={handleInputChange}
              />
              <Input
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit">
                {editingUser ? 'Update User' : 'Create User'}
              </Button>
              <Button type="button" variant="secondary" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {users.map((userItem) => (
          <Card key={userItem.id}>
            <div className="flex justify-between items-start p-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-medium text-gray-900">
                    {userItem.first_name && userItem.last_name 
                      ? `${userItem.first_name} ${userItem.last_name}`
                      : userItem.email
                    }
                  </h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    userItem.role === 'super_admin' 
                      ? 'bg-red-100 text-red-800'
                      : userItem.role === 'board_director'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {userItem.role.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    userItem.is_active 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {userItem.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Email:</span> {userItem.email}
                  </div>
                  {userItem.designation && (
                    <div>
                      <span className="font-medium">Designation:</span> {userItem.designation}
                    </div>
                  )}
                  {userItem.phone && (
                    <div>
                      <span className="font-medium">Phone:</span> {userItem.phone}
                    </div>
                  )}
                  {userItem.last_login && (
                    <div>
                      <span className="font-medium">Last Login:</span> {new Date(userItem.last_login).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => handleEdit(userItem)}
                >
                  Edit
                </Button>
                <Button 
                  variant={userItem.is_active ? "danger" : "success"}
                  size="sm"
                  onClick={() => handleToggleActive(userItem.id, userItem.is_active)}
                  disabled={userItem.id === user.id} // Can't deactivate self
                >
                  {userItem.is_active ? 'Deactivate' : 'Activate'}
                </Button>
                <Button 
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(userItem.id, userItem.email)}
                  disabled={userItem.id === user.id} // Can't delete self
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <Card>
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-500 mb-4">Create the first user to get started.</p>
            <Button onClick={() => setShowCreateForm(true)}>
              Create First User
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Users;