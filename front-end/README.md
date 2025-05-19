# Event Planning Application Front-End

This README provides a detailed explanation of the front-end architecture for the Event Planning Application. The front-end is built using React with TypeScript, Redux for state management, and follows a modern component-based architecture.

## Project Structure

The `src` directory contains the following files and folders, each with a specific purpose:

### `/src/main.tsx`

The entry point of the React application that:

- Renders the root React component
- Wraps the application with Redux Provider
- Sets up React strict mode for development quality checks

### `/src/App.tsx`

The main application component that:

- Defines the routing structure using React Router
- Implements protected routes based on authentication status
- Manages loading screens and authentication state
- Provides the layout structure (Navbar/Footer)

### `/src/assets/`

Contains static assets used throughout the application:

- Images
- Icons
- Fonts
- Other media files

### `/src/components/`

Reusable UI components organized by feature or function:

- **`/Auth/`**: Components related to authentication (login/registration forms)
- **`/Common/`**: Shared UI components used across multiple pages (buttons, modals, loaders)
- **`/Dashboard/`**: Components for user dashboard views
- **`/Debug/`**: Development-only components for debugging and testing
- **`/Discussion/`**: Components for event discussions and comments
- **`/Events/`**: Event-related components (cards, forms, filters)
- **`/Layout/`**: Page layout components (Navbar, Footer, Sidebar)
- **`/Notifications/`**: User notification components and indicators

Each component is designed to be reusable, maintainable, and follows React best practices with proper TypeScript typing.

### `/src/config.ts`

Application configuration including:

- API base URLs
- Environment-specific settings
- Feature flags
- Global constants

### `/src/features/`

Redux Toolkit feature slices that implement domain-specific state management:

- **`/auth/`**: Authentication state management (login, logout, registration)
- **`/discussions/`**: Event discussions and comments state
- **`/events/`**: Event creation, listing, and management state
- **`/settings/`**: User and application settings state

Each feature slice follows the Redux Toolkit pattern with:

- Slice definition with initial state
- Action creators and reducers
- Thunks for asynchronous operations
- Selectors for accessing state

### `/src/pages/`

Page-level components that represent complete views in the application:

- **`AdminEventStatisticsPage.tsx`**: Analytics dashboard for administrators
- **`AdminSettingsPage.tsx`**: Administrative settings and user management
- **`CreateEventPage.tsx`**: Form to create new events
- **`EditEventPage.tsx`**: Form to modify existing events
- **`EventDetailPage.tsx`**: Detailed view of a single event
- **`EventsPage.tsx`**: List of events with filtering and sorting
- **`LoginPage.tsx`**: User login view
- **`NotificationsPage.tsx`**: User notifications center
- **`RegisterPage.tsx`**: User registration view
- **`RegistrationPage.tsx`**: Extended registration process

Pages compose components together to create complete user experiences for specific routes.

### `/src/services/`

API service modules that handle communication with the backend:

- **`authService.ts`**: Authentication API calls (login, register, session management)
- **`settingsService.ts`**: Settings and preferences API calls

These services abstract API interaction logic, providing a clean interface for Redux thunks.

### `/src/store/`

Redux store configuration:

- **`index.ts`**: Configures the Redux store with all feature reducers
- **`hooks.ts`**: Custom React hooks for typed Redux usage (useAppDispatch, useAppSelector)

### `/src/types/`

TypeScript type definitions:

- **`vite-env.d.ts`**: Vite-specific TypeScript declarations

### `/src/utils/`

Utility functions and helpers:

- Date formatting
- String manipulation
- Form validation
- Other reusable logic

## Application Architecture

The application follows a modern React architecture with Redux for state management:

### Component Hierarchy

1. **Pages**: High-level components representing entire screens
2. **Feature Components**: Domain-specific components with business logic
3. **UI Components**: Reusable, presentational components

### State Management

- **Redux Toolkit**: For global application state
- **React State**: For component-local state
- **React Context**: For intermediate state when appropriate

### Data Flow

1. User interactions trigger component events
2. Events dispatch Redux actions or thunks
3. Redux middleware handles side effects (API calls)
4. Reducers update state based on action results
5. Components re-render with new state

## Key Technologies

- **React 18+**: UI library
- **TypeScript**: Static typing
- **Redux Toolkit**: State management
- **React Router**: Navigation and routing
- **Axios**: API communication
- **CSS**: Styling (with possible extensions like SCSS/CSS modules)

## Development Workflow

1. Components are developed in isolation using proper typing
2. Features are built by combining components with state management
3. Pages integrate features into complete user experiences
4. The app integrates with the backend API via service modules

## Best Practices Implemented

- TypeScript for type safety and developer experience
- Component composition for reusability
- Redux for predictable state management
- Code organization by feature and function
- Protected routes for authentication security
- Responsive design principles
