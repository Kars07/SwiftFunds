# SwiftFund: Decentralized Peer-to-Peer Lending Platform

SwiftFund is a decentralized platform built on the Cardano blockchain that connects borrowers and lenders directly. By leveraging blockchain technology, SwiftFund ensures transparency, security, and trust in financial transactions. The platform includes a **frontend**, **backend**, and **smart contracts** that work seamlessly together to provide a robust and user-friendly experience.

---

## Key Features

1. **KYC Verification**  
   - Ensures compliance with regulations and builds trust between users.
   - Users must verify their identity before accessing the platform.

2. **Credit Score System**  
   - A decentralized reputation system based on user activity, such as timely repayments and successful loans.
   - Higher credit scores improve borrowing terms.

3. **Wallet Connection**  
   - Supports Cardano wallets like Nami and Eternl for secure transactions.
   - Users can connect their wallets to manage funds directly.

4. **Loan Management**  
   - Borrowers can request loans with specified terms (amount, interest, deadline).
   - Lenders can browse and fund loan requests.

5. **Blockchain Integration**  
   - Smart contracts handle loan requests, funding, and repayments securely.
   - All transactions are immutable and auditable on the Cardano blockchain.

6. **User Authentication**  
   - Secure registration, login, and email verification.
   - Password reset functionality for account recovery.

7. **Interactive Dashboard**  
   - Users can manage their profiles, view balances, and track loan activity.
   - Includes features like wallet balance display and loan statistics.

8. **Responsive Design**  
   - Optimized for both desktop and mobile devices.
   - Smooth animations and intuitive UI for an engaging user experience.

---

## Architecture Overview

### 1. **Frontend**
   - Built with **React**, **Vite**, and **TailwindCSS**.
   - Provides a user-friendly interface for borrowers and lenders.
   - Handles wallet connections, KYC verification, and loan management.
   - Communicates with the backend via REST APIs.

   **Key Components:**
   - **Authentication**: Registration, login, and email verification.
   - **Dashboard**: Profile management, wallet integration, and loan tracking.
   - **KYC Verification**: Allows users to upload documents for identity verification.

### 2. **Backend**
   - Developed using **Node.js** and **Express**.
   - Manages user authentication, KYC verification, and loan data.
   - Integrates with MongoDB for data storage.
   - Sends verification and password reset emails using **Nodemailer**.

   **Key Features:**
   - **User Management**: Registration, login, and profile updates.
   - **Loan Management**: Tracks loan requests, funding, and repayments.
   - **Security**: Implements session management and centralized error handling.

### 3. **Smart Contracts**
   - Written in **Plutus** and deployed on the Cardano blockchain.
   - Handles the core logic for loan requests, funding, and repayments.
   - Ensures transparency and security through immutable smart contracts.

   **Key Scripts:**
   - **Loan Request Validator**: Validates loan requests submitted by borrowers.
   - **Fund Request Validator**: Ensures proper funding of loans by lenders.
   - **Repay Request Validator**: Manages loan repayments and updates balances.

---

## How It Works

1. **User Registration and KYC Verification**  
   - Users sign up and verify their email.
   - KYC documents are uploaded and reviewed for identity verification.

2. **Wallet Connection**  
   - Users connect their Cardano wallets (e.g., Nami, Eternl) to the platform.

3. **Loan Request**  
   - Borrowers submit loan requests with details like amount, interest, and deadline.
   - The request is stored on the blockchain via a smart contract.

4. **Loan Funding**  
   - Lenders browse loan requests and choose which ones to fund.
   - Funds are locked in a smart contract until the loan is repaid.

5. **Repayment**  
   - Borrowers repay the loan with interest before the deadline.
   - Smart contracts release funds to the lender and update the borrower's credit score.

---

## Project Structure

README.md file that describes the project and its integration between the frontend, backend, and smart contracts:

SwiftFunds/ ├── swiftfund_frontend/ # Frontend codebase │ ├── src/ │ │ ├── components/ # Reusable React components │ │ ├── pages/ # Page-level components │ │ ├── api/ # Axios instance for API calls │ │ └── assets/ # Static assets (images, logos) │ ├── public/ # Public assets │ ├── package.json # Frontend dependencies │ └── README.md # Frontend documentation ├── swiftfund_backend/ # Backend codebase │ ├── models/ # Mongoose models │ ├── routes/ # API routes │ ├── controller/ # Business logic for routes │ ├── utils/ # Utility functions (e.g., email sending) │ ├── server.js # Entry point for the backend │ ├── package.json # Backend dependencies │ └── README.md # Backend documentation └── swiftfund-smartcontract/ # Smart contract codebase ├── lucid/ # Lucid scripts for blockchain interaction ├── validators/ # Plutus smart contracts ├── aiken.toml # Aiken configuration └── README.md # Smart contract documentation




---

## Installation and Setup

### Prerequisites
- **Node.js** and **npm** installed.
- **MongoDB** for backend database.
- **Cardano Wallet** (e.g., Nami, Eternl) for blockchain interaction.

### Steps

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd SwiftFunds


2. Setup Backend
    ```bash
    cd swiftfund_backend
    npm install
    cp .env.example .env


3. Configure environment variables in .env and then run the server.js file 
    ```bash
    node server.js 


4. The backend would be running on port 5000
   ```bash
   Server running on port 5000
   Connected to Mongo Atlas!


6. Setup Frontend
   ```bash
    cd swiftfund_frontend
    npm install
    npm run dev

8. Deploy smart Contracts

    Follow the instructions in swiftfund-smartcontract/README.md to deploy the Plutus scripts.


---

### frontend port for testing: http://localhost:5173

### Backend port for testing :  http://localhost:5000/

---

### Technologies Used
Frontend: React, Vite, TailwindCSS


Backend: Node.js, Express, MongoDB


Smart Contracts: Plutus, Lucid, Aiken


Blockchain: Cardano


Email Service: Nodemailer

---

### License


This project is licensed under the MIT License. ```
