# Firebase Setup Instructions

## Prerequisites

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Authentication with Email/Password sign-in method

## Configuration Steps

### 1. Get Your Firebase Config

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. Click on the **Web app** icon `</>`
4. Register your app with a nickname (e.g., "CakeViews")
5. Copy the `firebaseConfig` object values

### 2. Add Environment Variables

Add these variables to your Vercel project or create a `.env.local` file:

\`\`\`env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
\`\`\`

### 3. Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click **Get Started**
3. Go to **Sign-in method** tab
4. Enable **Email/Password** provider
5. Click **Save**

### 4. Configure Firestore Database (for user data storage)

1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Start in **production mode**
4. Choose a Cloud Firestore location
5. Update security rules:

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // CakeViews videos - users can only access their own
    match /cakeviews_videos/{videoId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.user_id;
      allow create: if request.auth != null;
    }
    
    // CakeViews characters - users can only access their own
    match /cakeviews_characters/{characterId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.user_id;
      allow create: if request.auth != null;
    }
  }
}
\`\`\`

### 5. Restart Your Development Server

After adding environment variables, restart your Next.js development server:

\`\`\`bash
# Stop the server (Ctrl+C)
# Start it again
npm run dev
\`\`\`

## Testing

1. Navigate to `/auth/register` to create a new account
2. Sign up with email and password
3. You should be redirected to the home page
4. Access protected features like OodaGrabber and CakeViews Gallery

## Troubleshooting

**Error: "Firebase not configured"**
- Make sure all environment variables are set correctly
- Restart your development server after adding variables
- In Vercel, redeploy after adding environment variables

**Error: "auth/invalid-api-key"**
- Check that `NEXT_PUBLIC_FIREBASE_API_KEY` is correct
- Ensure there are no extra spaces in the environment variable

**Error: "auth/email-already-in-use"**
- This email is already registered
- Try logging in instead of signing up

**Error: "auth/weak-password"**
- Password must be at least 6 characters long

## Next Steps

Once Firebase is configured:
- All video saves from OodaGrabber will be stored per user
- CakeViews gallery will sync across devices
- Character assignments will be persisted
