***

# Agri Rental App - Backend

The core API and business logic for the hyperlocal P2P Agriculture Equipment Rental Marketplace. This backend handles geospatial equipment discovery, a robust booking engine, secure payments, and an AI-powered farming assistant.

## Tech Stack

* **Runtime:** Node.js
* **Database:** MongoDB
* **Payments:** Razorpay Integration
* **AI Integration:** Custom RAG architecture

##  Key Features

* **Geospatial Search:** Utilizes MongoDB GeoJSON to instantly query and serve equipment listings within a 20km radius of the farmer.
* **Bulletproof Booking Engine:** Custom validation logic that strictly prevents double-booking through date-overlap checks and prevents owners from renting their own equipment (self-booking guard).
* **AI RAG Chat Assistant:** An intelligent endpoint that processes user queries, retrieves relevant context, and suggests available machinery alongside practical farming advice.
* **Payment Processing:** Secure and seamless transaction handling via Razorpay.


## Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/agri-rental-backend.git
    cd agri-rental-backend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure environment variables:
    Create a `.env` file in the root directory and add the following:
    ```env
    PORT=5000
    MONGODB_URI=your_mongodb_connection_string
    RAZORPAY_KEY_ID=your_razorpay_key
    RAZORPAY_KEY_SECRET=your_razorpay_secret
    AI_API_KEY=your_ai_service_key
    ```

4.  Start the development server:
    ```bash
    npm run dev
    ```

## Core Data Models

* **User:** Manages farmer profiles, authentication, and roles (owner/renter).
* **Equipment:** Stores machinery details, pricing, and precise `Point` location data for GeoJSON queries.
* **Booking:** Tracks rental periods, payment status, and references the specific User and Equipment to enforce overlap logic.