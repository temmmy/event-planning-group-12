# Nikiplan - Event Planning Application

An event planning application built with the MERN stack (MongoDB, Express.js, React, Node.js) with TypeScript, allowing users to create, manage, and participate in events.

Link to Github Repository - https://github.com/temmmy/event-planning-group-12
Link to Youtube Presentation -

## Contribution Score

- Nguyen Chi Nghia s3979170 - 7
- Nguyen Bao Hoang s3978685 - 7
- Minh Tran Quang s4020220 - 3
- Hieu Nguyen Minh s3914580 - 3

## Features

### User Management

- Three user roles: Admin, Organizer, and Attendee
- Authentication with sessions and proper authorization
- User profile settings and preferences

### Event Management

- Create public and private events
- Customize events with images, colors, and details
- Invite users to events via email
- View event details, attendees, and RSVP status
- Edit and delete events with proper permissions

### Notification System

- Automatic event reminders for attendees
- Configurable notifications for event updates
- Email invitations for non-registered users
- Real-time notification indicators in the UI
- Organizers can schedule various types of notifications:
  - Upcoming event reminders
  - Attendance confirmation requests
  - Reminders for pending RSVPs

### Administration

- Admin dashboard with user management
- Event statistics and monitoring
- System settings and configuration

## Project Structure

The project is divided into two main parts:

### Frontend (`/front-end`)

- React with TypeScript
- Redux Toolkit for state management
- Tailwind CSS for styling with Nord color scheme
- Responsive design for all device sizes

### Backend (`/back-end`)

- Node.js with Express and TypeScript
- MongoDB with Mongoose ORM
- Session-based authentication
- REST API endpoints
- File upload handling
- Scheduled tasks for notifications

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4 or higher)
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone https://github.com/temmmy/event-planning-group-12
cd event-planning-group-12
```

2. Install backend dependencies

```bash
cd back-end
npm install
cp .env.example .env
# Update .env with your configuration
```

3. Install frontend dependencies

```bash
cd ../front-end
npm install
```

4. Start the development servers

Backend:

```bash
cd back-end
npm run dev
```

Frontend:

```bash
cd front-end
npm run dev
```

5. Create an admin user

```bash
cd back-end
npm run create-admin
```

## Environment Variables

### Backend (`.env`)

- `PORT` - Server port (default: 5001)
- `MONGODB_URI` - MongoDB connection string
- `SESSION_SECRET` - Secret for session encryption
- `CORS_ORIGIN` - Frontend URL for CORS
- `INTERNAL_API_KEY` - Key for internal API access (used by notification scheduler)
- `UPLOAD_PATH` - Path for file uploads

## How to Use the Notification System

### As an Organizer

1. Create an event
2. Navigate to the event details page
3. Scroll down to the "Event Notifications" section
4. Configure automatic reminders for your event:
   - Upcoming event reminders before the event date
   - Attendance confirmation requests
   - Reminders for users who haven't responded to invitations
5. Set the date and time for each reminder

### As an Attendee

1. View your notifications by clicking the bell icon in the navbar
2. Notifications will show for:
   - Event reminders
   - Updates to events you're attending
   - Requests to confirm attendance
   - New event invitations
3. Click on a notification to navigate to the relevant event

## Contributing

Feel free to submit issues and pull requests for new features or bug fixes.
