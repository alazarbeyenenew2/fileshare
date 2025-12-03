# Secure Report App - Configuration

## Environment Variables

The app uses environment variables for configuration. Create a `.env.local` file in the root directory:

```bash
# Base URL for QR code generation
# Change this to your production domain when deploying
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### For Production Deployment

When deploying to production, update the `NEXT_PUBLIC_BASE_URL` to your actual domain:

```bash
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

This ensures that QR codes generated for folders will point to your production URL instead of localhost.

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file with your base URL

3. Run development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

5. Login with:
   - Username: `admin`
   - Password: `password`

## Features

- 📁 Create password-protected main folders
- 📂 Add unlimited subfolders (no password needed)
- 📊 Upload Excel files to any folder
- 📱 Generate QR codes for easy folder sharing
- 🎨 Modern UI with gradients and animations

## Deployment

When deploying to platforms like Vercel, Netlify, or similar:

1. Set the `NEXT_PUBLIC_BASE_URL` environment variable in your deployment platform
2. Use your production domain (e.g., `https://reports.yourdomain.com`)
3. Deploy the app

The QR codes will automatically use the production URL.
# fileshare
