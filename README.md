# TamuPOS - Mobile Point of Sale System

TamuPOS is a modern, full-stack Point of Sale (POS) application designed for restaurants, cafes, and other businesses, with a focus on the Kenyan market. It features a responsive, mobile-first interface and a robust backend to manage orders, payments, and menu items.

```mermaid
graph TD
    A[TamuPOS] --> B{Frontend};
    A --> C{Backend};

    B --> D[React];
    B --> E[Vite];
    B --> F[TypeScript];
    B --> G[Tailwind CSS];
    B --> H[POSInterface];

    C --> I[Node.js];
    C --> J[Express.js];
    C --> K[Prisma];
    C --> L[RESTful API];

    L --> M["/api/categories"];
    L --> N["/api/items"];
    L --> O["/api/orders"];
    L --> P["/api/payments"];

    H -.-> L;

    subgraph "Order Modes"
        H --> Q[Tab Mode];
        H --> R[Table Mode];
        H --> S[Take-Away Mode];
    end
```

## Architecture Overview

TamuPOS is built on a client-server model:

*   **Frontend**: A responsive client application built with **React**, **Vite**, and **TypeScript**. It's styled with **Tailwind CSS** and provides a dynamic user interface for processing orders.
*   **Backend**: A **Node.js** server using **Express.js** and **Prisma** ORM to provide a RESTful API for handling business logic and data persistence.

This separation of concerns allows for modular development, independent scaling, and a clear API contract between the client and server.

## Features

*   **Authentication**: Secure user login and protected routes.
*   **Multiple Order Modes**: Supports "Tab", "Table", and "Take-Away" service styles.
*   **Kenyan Payment Integration**: Built-in support for M-Pesa payments.
*   **Dynamic POS Interface**: Easily add items to an order, calculate totals, and process payments.
*   **Menu Management**: API endpoints for creating, updating, and deleting categories and items.
*   **RESTful API**: A well-defined API for all core functionalities.

## Tech Stack

| Area      | Technology                                    |
| --------- | --------------------------------------------- |
| **Frontend**  | React, Vite, TypeScript, Tailwind CSS         |
| **Backend**   | Node.js, Express.js, Prisma, PostgreSQL       |
| **Deployment**| Docker, Render                                |

## Getting Started

### Prerequisites

*   Node.js (v18 or later)
*   npm
*   Docker (for containerized setup)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/TamuPOS.git
    cd TamuPOS
    ```

2.  **Setup Backend:**
    ```bash
    cd backend
    npm install

    # Create a .env file from the example
    cp .env.example .env 
    
    # Add your PostgreSQL database URL to .env
    # DATABASE_URL="postgresql://user:password@host:port/database"

    # Run database migrations
    npx prisma migrate dev
    ```

3.  **Setup Frontend:**
    ```bash
    cd ../frontend
    npm install
    ```

### Running the Application

1.  **Start the Backend Server:**
    ```bash
    cd ../backend
    npm run dev
    ```
    The backend will be running on `http://localhost:3001`.

2.  **Start the Frontend Development Server:**
    ```bash
    cd ../frontend
    npm run dev
    ```
    The frontend will be available at `http://localhost:5173`. 