# Frontend Component Structure

## 📁 File Organization

### Components (`/src/components/`)
- **`Navbar.jsx`** - Navigation bar with logo, Add Funds button, and wallet connection
- **`Contests.jsx`** - Displays contest information and status
- **`Betting.jsx`** - Handles participant betting functionality
- **`Wallet.jsx`** - Manages wallet operations, balance display, and add funds modal

### Hooks (`/src/hooks/`)
- **`useWalletBalance.js`** - Custom hook for managing wallet balance state and API calls
- **`useParticipants.js`** - Custom hook for fetching and managing participants data

### Main Files
- **`App.jsx`** - Main application component with wallet providers and routing
- **`App.css`** - Global styles
- **`index.css`** - Base styles

## 🔧 Key Features Fixed

### Balance Management
- ✅ Fixed balance calculation to properly sum all transactions
- ✅ Balance updates automatically after adding funds
- ✅ Balance persists across wallet connections
- ✅ Real-time balance refresh after transactions

### Code Organization
- ✅ Separated concerns into focused components
- ✅ Created reusable custom hooks
- ✅ Improved code maintainability and readability
- ✅ Better separation of wallet, betting, and UI logic

## 🚀 How to Use

1. **Connect Wallet** - Click the wallet button to connect
2. **Add Funds** - Click "Add Funds" to open the modal and send SOL
3. **Place Bets** - Enter amounts and click "Place Bet" on participants
4. **View Balance** - Balance is displayed in the contests section

## 🔄 Data Flow

1. **Wallet Connection** → Saves wallet address to backend
2. **Add Funds** → Sends SOL transaction → Verifies with backend → Updates balance
3. **Place Bet** → Deducts from balance → Updates UI
4. **Balance Display** → Fetches from transaction history → Shows total

## 🛠️ Backend Integration

- `POST /user/saveWallet` - Save wallet address
- `POST /user/checkTransfer` - Verify and process transactions
- `GET /user/transactions/:walletAddress` - Fetch transaction history
- `POST /bet/bet` - Place bets
- `GET /user/data` - Fetch participants data
