# 🚀 GNDECB AIML Hub - Deployment Guide

This guide outlines the steps to deploy the GNDECB AIML Innovation Hub to production using Firebase Hosting.

## 1. Prerequisites
- [Node.js](https://nodejs.org/) installed.
- [Firebase CLI](https://firebase.google.com/docs/cli) installed (`npm install -g firebase-tools`).
- A Firebase Project created at [console.firebase.google.com](https://console.firebase.google.com/).

## 2. Setting Up Firebase Admin
1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Navigate to **Authentication** > **Sign-in method**.
3. Enable **Email/Password**.
4. Go to **Users** and click **Add user**.
5. Use the email: `admin@gndecb.ac.in` and set a strong password. **This password is your Neural Access Token.**

## 3. Firestore Setup
1. Navigate to **Cloud Firestore** > **Create database**.
2. Start in **Production mode**.
3. Choose a location (e.g., `asia-south1` for India).
4. Go to the **Rules** tab and paste the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to read data
    match /{document=**} {
      allow read: if true;
    }
    // Only authenticated admin can write data
    match /{document=**} {
      allow write: if request.auth != null && request.auth.token.email == 'admin@gndecb.ac.in';
    }
  }
}
```
5. Click **Publish**.

## 4. Local Verification
1. Open `js/firebase-config.js` and ensure the `apiKey` and other credentials match your Firebase Project (current values are already updated in the codebase).

## 5. Deployment
Run the following commands in your terminal:

```bash
# 1. Login to Firebase
firebase login

# 2. Select your project
firebase use aiml-portal-8862c

# 3. Deploy everything
firebase deploy
```

## 6. Accessing the Admin Panel
- **URL**: `https://<your-project-id>.web.app/admin.html`
- **Email**: `admin@gndecb.ac.in`
- **Password**: (The one you set in Step 2)

## 🎨 Design System (v5.0)
The website uses a high-end **Neural Deep Blue** theme with:
- **Glassmorphism**: `ultra-glass` classes.
- **Cinematic Reveal**: `ultra-reveal` classes.
- **AI Integration**: Powered by Gemini 1.5 Flash.

---
**Maintained by GNDECB AIML Core Team**
