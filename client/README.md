# Vehicle Maintenance App

A full-stack vehicle management application built to help users organize vehicle information, maintenance activity, and fuel records in one centralized application.

The project demonstrates full-stack software development using React and TypeScript on the frontend, a Node.js/Express REST API on the backend, and PostgreSQL with Prisma for persistent data storage.

## Features

- Manage vehicle information
- Track vehicle maintenance and service activity
- Record fuel purchases
- Track mileage at each fuel stop
- Record gallons purchased
- Track price per gallon and total fuel cost
- Record gas station information
- Add notes to fuel records
- Maintain vehicle-related data in PostgreSQL
- Responsive React-based user interface

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- CSS

### Backend

- Node.js
- Express
- TypeScript
- REST API
- CORS
- dotenv

### Database

- PostgreSQL
- Prisma ORM

### Development Tools

- Git
- GitHub
- Visual Studio Code
- npm

## Architecture

The application uses a client/server architecture:

```text
vehicle-maintenance-app/
├── client/          # React + TypeScript frontend
└── server/          # Node.js + Express API
    └── prisma/      # Prisma schema and database configuration
```

The React client communicates with the Express backend, which handles application logic and database operations.

Prisma provides the data-access layer between the Node.js server and PostgreSQL database.

## Fuel Tracking

Fuel records can store information including:

- Date
- Vehicle mileage
- Gallons purchased
- Price per gallon
- Total cost
- Gas station
- Notes
- Associated vehicle

Each fuel record is associated with a vehicle, allowing fuel history to remain organized by vehicle.

## Getting Started

### Prerequisites

Before running the project locally, install:

- Node.js
- npm
- PostgreSQL
- Git

## Clone the Repository

Using SSH:

```bash
git clone git@github.com:KevinJ3259/vehicle-maintenance-app.git
```

Move into the project:

```bash
cd vehicle-maintenance-app
```

## Backend Setup

Navigate to the server:

```bash
cd server
```

Install the server dependencies:

```bash
npm install
```

Create the required environment configuration for your PostgreSQL database.

For example:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/DATABASE_NAME"
```

Run the Prisma database setup required by the project.

Depending on the existing migrations, this may include:

```bash
npx prisma migrate dev
```

Generate the Prisma client if necessary:

```bash
npx prisma generate
```

Start the backend development server using the development script configured in `server/package.json`.

## Frontend Setup

Open another terminal and navigate to the client:

```bash
cd client
```

Install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

Vite will display the local application URL in the terminal.

## Screenshots

### Vehicle Dashboard

_Add a screenshot of the main vehicle dashboard here._

### Maintenance Tracking

_Add a screenshot of the maintenance interface here._

### Fuel Tracking

_Add a screenshot of the fuel tracking interface here._

## Live Demo

Add the deployed application URL here.

## What This Project Demonstrates

This project demonstrates experience with:

- Full-stack application development
- React component-based UI development
- TypeScript
- REST API development
- Node.js and Express
- Relational database design
- PostgreSQL
- Prisma ORM
- Client/server architecture
- CRUD operations
- Git and GitHub version control
- Responsive web development

## Future Improvements

Potential future enhancements include:

- User authentication and individual accounts
- Automated maintenance reminders
- Mileage-based service notifications
- Fuel economy calculations
- Fuel cost analytics
- Maintenance cost reporting
- Charts and vehicle expense dashboards
- Improved mobile experience
- Cloud deployment improvements
- Automated testing

## Author

**Kevin Jordan**

Software Engineer | Full-Stack Developer

GitHub: [KevinJ3259](https://github.com/KevinJ3259)

```

```
