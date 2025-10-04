# Admin Upload Fix Guide

## Issue Diagnosed
The 500 error is likely caused by admin users not having `university_body_id` set in the database.

## Quick Database Fix

### Option 1: Using MySQL Command Line
```sql
-- Connect to your database
mysql -u root -p

-- Use your database
USE your_database_name;

-- Check current admin users
SELECT id, email, role, university_body_id FROM users WHERE role = 'admin';

-- Check available university bodies
SELECT id, name, type FROM university_bodies;

-- Assign university body to admin users (replace with actual IDs)
UPDATE users SET university_body_id = 1 WHERE role = 'admin' AND university_body_id IS NULL;

-- Verify the fix
SELECT u.id, u.email, u.role, u.university_body_id, ub.name as university_body_name 
FROM users u 
LEFT JOIN university_bodies ub ON u.university_body_id = ub.id 
WHERE u.role = 'admin';
```

### Option 2: Create University Body if None Exist
```sql
-- If no university bodies exist, create one
INSERT INTO university_bodies (name, type, created_at, updated_at) 
VALUES ('Default University', 'university', NOW(), NOW());

-- Then assign to admin
UPDATE users SET university_body_id = LAST_INSERT_ID() WHERE role = 'admin';
```

## Backend Code Changes Made

✅ **Fixed admin upload route in `/backend/src/routes/adminDocuments.js`:**

1. **Added university body lookup:**
   ```javascript
   const adminUser = await User.findByPk(req.user.id, {
     include: [{
       model: UniversityBody,
       as: 'universityBody',
       attributes: ['id', 'name', 'type']
     }]
   });
   ```

2. **Added validation:**
   ```javascript
   if (!adminUser || !adminUser.universityBody) {
     return res.status(400).json({
       success: false,
       message: 'Admin must be associated with a university body to upload documents'
     });
   }
   ```

3. **Fixed document creation:**
   ```javascript
   const document = await Document.create({
     // ... other fields
     file_data: req.file.buffer,           // ✅ Added missing file data
     file_name: req.file.originalname,     // ✅ Fixed file name source
     university_body_id: university_body_id || adminUser.universityBody.id, // ✅ Auto-assign
     // ... other fields
   });
   ```

## Test Steps

1. **Fix database associations** using the SQL commands above
2. **Restart your backend server**
3. **Try admin document upload again**
4. **Check server logs** if still getting errors

## Expected Behavior After Fix

- ✅ Admin can upload documents successfully
- ✅ Documents are assigned to admin's university body
- ✅ Documents have `approval_status: 'pending'`
- ✅ File data and metadata are properly stored

## If Still Having Issues

Check:
1. Admin user exists in database
2. Admin has `university_body_id` set
3. University body exists and admin is associated
4. Backend server is running without errors
5. Database connection is working