# Quantplay

A full-stack application with separate frontend and backend components.

## Project Structure
```
quantplay/
├── frontend/    # Next.js frontend application
└── backend/     # Node.js backend application
```

## Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (v4.4 or higher)

## Environment Variables Setup

### Frontend (.env)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=ws://localhost:5001
```

### Backend (.env)
```
NODE_ENV=development
PORT=5000
WS_PORT=5001
MONGODB_URI=mongodb://localhost:27017/quantplay
UNDERLYING_BASE_VALUE=22500
STRIKE_GAP=100
STRIKE_DEPTH=75
UPDATE_INTERVAL=200
```

## Installation & Setup

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create .env file with the configuration shown above

4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create .env file with the configuration shown above

4. Start the development server:
   ```bash
   npm run dev
   ```

## Development

- Frontend runs on: http://localhost:3000
- Backend runs on: http://localhost:5000

## Production Build

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm start
```

## Common Issues & Troubleshooting

1. **Port Already in Use**
   - Change the port in respective .env files
   - Kill the process using the port: `npx kill-port 3000` or `npx kill-port 5000`

2. **MongoDB Connection Issues**
   - Ensure MongoDB is running locally
   - Check if connection string is correct in .env
   - Verify network connectivity

3. **CORS Issues**
   - Verify CORS_ORIGIN in backend .env matches frontend URL
   - Check for proper protocol (http/https)

## Security Notes

- Never commit .env files to version control
- Regularly update dependencies for security patches
- Enable proper CORS settings for production
