# Event Planning Application Backend

This README provides a detailed explanation of the backend architecture for the Event Planning Application. The backend is built using Node.js with Express and TypeScript, providing a robust API for event management, user authentication, notifications, and more.

## Project Structure

The `src` directory contains the following folders, each with a specific purpose:

### `/src/server.ts`

The main entry point for the backend application. It:

- Configures Express server settings
- Establishes MongoDB connection
- Sets up middleware (CORS, session management, body parsing)
- Initializes routes
- Starts the server and scheduler services
- Provides centralized error handling

### `/src/config`

Contains configuration files for various parts of the application.

- **`db.ts`**: Database connection configuration using Mongoose to connect to MongoDB.

### `/src/controllers`

Houses the business logic for handling HTTP requests. Controllers separate route handling from business logic implementation.

- **`authController.ts`**: Handles user authentication (login, registration, password reset)
- **`eventController.ts`**: Manages event CRUD operations, invitations, and statistics
- **`notificationController.ts`**: Controls user notification functionality
- **`settingsController.ts`**: Manages user and application settings
- **`discussionController.ts`**: Handles event discussions and comments

Each controller contains methods that:

1. Receive requests from routes
2. Process data and interact with models
3. Return appropriate responses with status codes

### `/src/middleware`

Contains Express middleware functions that process requests before they reach route handlers.

- **`authMiddleware.ts`**: Validates user authentication status and session data
- **`roleMiddleware.ts`**: Enforces role-based access control (admin, organizer, attendee)
- **`uploadMiddleware.ts`**: Manages file uploads for event images and other assets

These middleware components ensure security, validate requests, and handle cross-cutting concerns across the application.

### `/src/models`

Defines MongoDB schema and models using Mongoose for data storage and validation.

- **`user.ts`**: User account information and authentication data
- **`event.ts`**: Event details, including title, description, date, location, etc.
- **`notification.ts`**: User notification schema for system messages
- **`settings.ts`**: User preferences and application settings
- **`invitation.ts`**: Event invitation tracking
- **`discussion.ts`**: Comments and discussions for events
- **`statistics.ts`**: Event attendance and engagement metrics
- **`export.ts`**: Data export functionality

Each model defines the database structure, field validations, and relationships between entities.

### `/src/routes`

Defines API endpoints using Express router, connecting HTTP requests to controller methods.

- **`authRoutes.ts`**: User authentication endpoints (register, login, logout)
- **`eventRoutes.ts`**: Event management endpoints (CRUD, invitations, statistics)
- **`notificationRoutes.ts`**: User notification endpoints
- **`settingsRoutes.ts`**: User and application settings endpoints
- **`discussionRoutes.ts`**: Event discussion and comment management

Each route file maps specific HTTP methods and paths to the appropriate controller functions.

### `/src/scripts`

Contains utility scripts for database seeding, maintenance, and administrative tasks.

- **`createAdmin.ts`**: Script to create administrative users
- **`createUsers.ts`**: Bulk user creation utility
- **`createOrganizer.ts`**: Script to create event organizer accounts
- **`createAttendee.ts`**: Script to create attendee accounts

These scripts facilitate development, testing, and production deployment by automating common tasks.

### `/src/services`

Contains reusable service modules that encapsulate complex business logic and utilities.

- **`reminderService.ts`**: Scheduled reminder functionality for upcoming events

Services handle cross-cutting functionality that may be used by multiple controllers or system processes.

### `/src/types`

Contains TypeScript type definitions and interface declarations.

- **`express-session.d.ts`**: Type declarations for Express session handling

These files provide type safety and ensure consistent data structures throughout the application.

## Database Architecture

The application uses MongoDB as its database, with Mongoose for object modeling. Key collections include:

- **Users**: Store user accounts, credentials, and profile information
- **Events**: Store event details, including attendees and event status
- **Notifications**: Track system messages and alerts for users
- **Settings**: Maintain user preferences and application configuration

## API Overview

The API follows RESTful design principles with endpoints organized by resource:

- **/api/auth**: User authentication and management
- **/api/events**: Event creation, management, and interaction
- **/api/notifications**: User notification management
- **/api/settings**: User and application settings

## Security Features

- Session-based authentication with secure cookies
- Password hashing and security measures
- Role-based access control for different user types
- Input validation and sanitization
- CORS configuration for secure client-server communication

## Deployment

The application is configured to run in development environment, with appropriate settings managed through environment variables.
