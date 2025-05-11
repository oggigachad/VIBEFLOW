# VibeFlow - Modern Music Streaming App

A sleek, responsive music streaming application built with Next.js and Firebase.

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/vibeflow.git

# Navigate to the project directory
cd vibeflow

# Install dependencies
npm install
```

## Firebase Configuration (Important!)

The app requires Firebase for authentication. Follow these steps to set it up:

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication in your Firebase project
3. Create a `.env.local` file in the root of your project with the following variables:

```
# Firebase Configuration 
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

4. Replace the values with your actual Firebase config values from Project Settings > General

> **Important**: Make sure to use the correct format for Firebase configuration values. For example:
> - authDomain should be `project-id.firebaseapp.com` (not `http://project-id.firebaseapp.com`)
> - storageBucket should be `project-id.appspot.com` (not `http://project-id.firebasestorage.app`)

## Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- Authentication system with Firebase
- Music streaming and playback
- Personalized recommendations
- Library management
- Audio visualization
- Responsive design across all devices
- Theme customization

## Technologies Used

- Next.js 13+ (App Router)
- TypeScript
- Tailwind CSS
- Shadcn UI
- Firebase Auth
- Framer Motion
- Web Audio API

## Troubleshooting

- If you see a Firebase API error in the console, make sure you've set up the correct environment variables in your `.env.local` file.
- If you encounter "Blocked autofocusing on a <input> element in a cross-origin subframe" error, check that your Firebase authDomain is correctly formatted without http:// prefix.
- If images show warnings about "fill" property, ensure the parent component has `position: relative` set.
- For LCP image warnings, add the `priority` prop to the main images above the fold.

## License

MIT 