# University Portal Frontend

React frontend for the University Curriculum & Document Portal built with Vite, Redux Toolkit, and Tailwind CSS.

## Features

- **Modern React**: Built with React 18 and modern hooks
- **State Management**: Redux Toolkit for predictable state management
- **Routing**: React Router v6 for client-side routing
- **UI Components**: Custom components with Tailwind CSS
- **Authentication**: JWT-based authentication with role-based access control
- **Responsive Design**: Mobile-first responsive design
- **File Upload**: Drag-and-drop file upload with progress
- **Search & Filter**: Advanced document search and filtering
- **Real-time Updates**: React Query for server state management

## Tech Stack

- **Framework**: React 18 with Vite
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Forms**: React Hook Form
- **Server State**: React Query
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Auth/           # Authentication components
│   ├── Layout/         # Layout components
│   └── UI/             # Basic UI components
├── hooks/              # Custom React hooks
├── pages/              # Page components
│   ├── Auth/           # Authentication pages
│   ├── Dashboard/      # Dashboard page
│   ├── Documents/      # Document management pages
│   ├── Categories/     # Category management pages
│   ├── Users/          # User management pages
│   └── Profile/        # User profile page
├── services/           # API service functions
├── store/              # Redux store and slices
├── utils/              # Utility functions
└── main.jsx           # Application entry point
```

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

## Environment Configuration

The frontend connects to the backend API through a proxy configured in `vite.config.js`. Make sure the backend is running on `http://localhost:5001`.

## Authentication

The application uses JWT tokens for authentication. Tokens are stored in localStorage and automatically included in API requests.

### User Roles

- **General User**: Can view and download documents
- **Admin**: Can upload, edit, and delete their own documents
- **Super Admin**: Can manage all users and documents

## Components

### UI Components

- `Button` - Customizable button component
- `Input` - Form input with validation
- `Card` - Card container with header, body, and footer
- `LoadingSpinner` - Loading indicator

### Layout Components

- `Layout` - Main application layout
- `Header` - Top navigation bar
- `Sidebar` - Side navigation menu

### Auth Components

- `ProtectedRoute` - Route protection based on authentication and roles

## State Management

The application uses Redux Toolkit for state management with the following slices:

- `authSlice` - Authentication state
- `documentSlice` - Document management state
- `categorySlice` - Category management state
- `userSlice` - User management state

## API Integration

API calls are handled through service functions in the `services/` directory:

- `authService` - Authentication API calls
- `documentService` - Document management API calls
- `categoryService` - Category management API calls
- `userService` - User management API calls

## Styling

The application uses Tailwind CSS for styling with custom utility classes defined in `src/index.css`.

### Custom Classes

- Button variants: `btn-primary`, `btn-secondary`, `btn-danger`, `btn-success`
- Input styles: `input`, `input-error`
- Card components: `card`, `card-header`, `card-body`, `card-footer`
- Badge styles: `badge-primary`, `badge-secondary`, `badge-success`, `badge-warning`, `badge-danger`

## Development

### Adding New Pages

1. Create a new component in the appropriate directory under `src/pages/`
2. Add the route to `src/App.jsx`
3. Add navigation link to `src/components/Layout/Sidebar.jsx` if needed

### Adding New API Endpoints

1. Add the API call to the appropriate service file in `src/services/`
2. Create or update Redux slice actions in `src/store/slices/`
3. Use the actions in your components

### Styling Guidelines

- Use Tailwind CSS utility classes
- Create custom components for reusable UI patterns
- Follow the existing color scheme and spacing patterns
- Use the `cn` utility function for conditional classes

## Build and Deployment

### Production Build

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Environment Variables

For production deployment, you may need to configure:

- `VITE_API_URL` - Backend API URL (if different from proxy)
- `VITE_APP_NAME` - Application name

## Contributing

1. Follow the existing code style and patterns
2. Add proper TypeScript types if using TypeScript
3. Write tests for new components and functions
4. Update documentation for new features
5. Ensure all linting rules pass

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
