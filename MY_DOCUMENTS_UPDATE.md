# My Documents Page - Updated Behavior

## Role-Based Document Display

### 🔴 Super Admin - "My Documents"
- **Shows**: Only documents uploaded by the super admin user
- **Filter**: `only_mine: 'true'`
- **Rationale**: Super admins work across all university bodies, so "my documents" means their personal uploads
- **Description**: "Documents you have uploaded"

### 🟡 Admin - "My Documents"  
- **Shows**: All documents from the admin's university body (regardless of who uploaded them)
- **Filter**: `only_university_body: 'true'`
- **Rationale**: Admins manage their entire university body's documents
- **Description**: "Documents in your university body"
- **Includes**: 
  - Documents uploaded by the admin
  - Documents uploaded by sub-admins in the same university body
  - All documents associated with their university body

### 🟢 Sub-Admin - "My Documents"
- **Shows**: All documents from the sub-admin's university body (regardless of who uploaded them)  
- **Filter**: `only_university_body: 'true'`
- **Rationale**: Sub-admins work within their university body context
- **Description**: "Documents in your university body"
- **Includes**:
  - Documents uploaded by the sub-admin
  - Documents uploaded by admin in the same university body
  - All documents associated with their university body

## Backend Changes

### Admin Documents Route (`/api/admin/documents`)
```javascript
// Added only_university_body parameter
const { only_university_body } = req.query;

if (only_university_body === 'true') {
  // For "My Documents" - only university body documents
  whereClause = {
    university_body_id: adminUser.universityBody?.id
  };
} else {
  // For "All Documents" - university body + public documents
  whereClause = {
    [Op.or]: [
      { university_body_id: adminUser.universityBody?.id },
      { is_public: true, approval_status: 'approved' }
    ]
  };
}
```

### Sub-Admin Documents Route (`/api/sub-admin/documents`)
```javascript
// Same logic as admin route
if (only_university_body === 'true') {
  whereClause = {
    university_body_id: subAdminUser.universityBody?.id
  };
}
```

## Frontend Changes

### MyDocuments.jsx Component
```javascript
// Role-based parameter selection
let params = {};
if (user?.role === 'super_admin') {
  params.only_mine = 'true';
} else if (user?.role === 'admin' || user?.role === 'sub_admin') {
  params.only_university_body = 'true';
}

const res = await documentService.getMyDocuments(params);
```

### Dynamic Description
- Super Admin: "Documents you have uploaded (X total)"
- Admin/Sub-Admin: "Documents in your university body (X total)"

## Document Visibility Summary

| Role | My Documents Shows | All Documents Shows |
|------|-------------------|-------------------|
| **Super Admin** | Own uploads only | All public approved documents |
| **Admin** | University body documents | University body + other public documents |
| **Sub-Admin** | University body documents | University body + other public documents |

## Benefits

1. **University Body Management**: Admins and sub-admins can see all documents they're responsible for
2. **Clear Ownership**: Super admins see personal uploads vs institutional management
3. **Collaborative Workflow**: Admin and sub-admin can see each other's work within their body
4. **Logical Grouping**: Documents are grouped by institutional responsibility

## Use Cases

### Admin Use Case
- Admin logs in and goes to "My Documents"
- Sees all documents for "Engineering Department"
- Includes documents uploaded by sub-admin faculty members
- Can manage, approve, or organize all department documents

### Sub-Admin Use Case  
- Sub-admin logs in and goes to "My Documents"
- Sees all documents for their "Engineering Department"
- Can see what admin has uploaded and their own uploads
- Understands full context of department's document library

### Super Admin Use Case
- Super admin logs in and goes to "My Documents" 
- Sees only documents they personally uploaded
- Focused on their own administrative uploads
- Separate from university body management