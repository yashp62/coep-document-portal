# GitHub Repository Setup Commands

After creating your repository on GitHub, run these commands:

## Replace 'yourusername' with your actual GitHub username

# Add GitHub remote
git remote add origin https://github.com/yourusername/coep-document-portal.git

# Push to GitHub
git branch -M main
git push -u origin main

## Alternative: If you want to use SSH (if you have SSH keys set up)
# git remote add origin git@github.com:yourusername/coep-document-portal.git
# git push -u origin main

---

## After pushing to GitHub:

1. Go to render.com
2. Sign up/Login with your GitHub account
3. Click "New +" → "Blueprint"
4. Select your GitHub repository: coep-document-portal
5. Render will automatically detect render.yaml
6. Click "Apply" to deploy

## Expected Services:
- coep-backend (Node.js API)
- coep-frontend (React Static Site)  
- coep-database (PostgreSQL)

## Deployment URLs (after deployment):
- Frontend: https://coep-frontend.onrender.com
- Backend: https://coep-backend.onrender.com
- Health Check: https://coep-backend.onrender.com/health

## Demo Accounts:
- Super Admin: superadmin@coep.ac.in / admin123
- Admin: admin.examinations@coep.ac.in / admin123
- Sub-Admin: subadmin.exams@coep.ac.in / admin123