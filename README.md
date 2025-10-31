# 🎯 HackArena - Solana Betting Platform

A decentralized betting platform built on Solana blockchain where users can bet on competitive programming contests and hackathons.

## ✨ Features

- 🔗 **Wallet Integration**: Connect with Phantom, MetaMask, and Backpack wallets
- 💰 **Add Funds**: Send SOL to the platform and track your balance
- 🎲 **Place Bets**: Bet on participants in competitive programming contests
- 📊 **Real-time Data**: Live contest data from VJudge platform
- 🏆 **Odds System**: Dynamic odds based on participant rankings
- 💾 **Persistent Storage**: PostgreSQL database with Prisma ORM

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **Solana Web3.js** for blockchain interactions
- **@solana/wallet-adapter** for wallet connectivity
- **Axios** for API calls
- **CSS3** for styling

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database
- **Prisma** ORM
- **JWT** authentication
- **Zod** input validation

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ritz-Bansal/Bettx
   cd Bettx
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   

   # Create .env file
   PORT = 3000
   JWT_SECRET = "yoursecert" 
   SOLANA_DEVNET_URL = https://api.devnet.solana.com
   WALLET_ADDRESS = wallet Address to whom the funds will be transferred
   DATABASE_URL= your postgres database URL 
   
   # Set up database
   npx prisma generate
   
   # Start backend
   npm run start
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install

   # Create .env file
   VITE_BACKEND_URL = http://localhost:3000

   # Start frontend  
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## 📁 Project Structure

```
HackArena/
├── backend/
│   ├── src/
│   │  ├── controllers/        # API route handlers
│   │  ├── database/           # Database configuration
│   │  ├── middlewares/        # Express middlewares
│   │  ├── routes/             # API routes
│   │  └── zod/                # Input validation schemas
│   ├── prisma/                # Database schema and migrations

├── frontend/
│       ├── src/
│       │   ├── components/  # React components
│       │   ├── hooks/       # Custom React hooks
│       │   └── ...
│       └── ...
```

## 🔧 API Endpoints

### User Routes
- `POST /user/checkTransfer` - Verify SOL transaction
- `GET /user/checkBalance/:walletAddress` - Get user transactions
- `GET /user/data` - Get contest participants

### Betting Routes
- `POST /bet/bet` - Place a bet on a participant
- `GET /bet/payment` - Endpoint for the host to know how much SOL to send

## 💡 Usage

1. **Connect Wallet**: Click the wallet button to connect your Solana wallet
2. **Add Funds**: Click "Add Funds" to send SOL to the platform
3. **View Participants**: See the list of contest participants with their odds
4. **Place Bets**: Enter bet amount and click "Place Bet" on any participant
5. **Track Balance**: Monitor your balance in real-time

## 🔒 Security Features

- Wallet-based authentication
- Transaction signature verification
- Input validation with Zod schemas
- CORS protection

## 🚀 Deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Solana Foundation for the blockchain infrastructure
- VJudge for contest data
- The open-source community for amazing tools and libraries

## 📞 Support

If you have any questions or need help, please open an issue on GitHub.

---

**Happy Betting! 🎯**
