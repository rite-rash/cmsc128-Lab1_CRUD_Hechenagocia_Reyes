# CMSC128 Lab1 - Todo List (CRUD)
 
A todo list app with full CRUD functionality, built for CMSC128 Lab 1 by Trisha Mae Hechenagocia & Aleighia Keith Reyes.

User registers an account, logs in, and sees only their account.


## Features
### Task Management
 
- Create, read, update, and delete tasks
- Delete includes a 5-second "Undo" window before the task is permanently removed
- Mark tasks as done via checkbox (strikethrough + color change)
- Sort tasks by Date Added, Due Date, Priority, or Category
- Filter tasks by Category or Priority
- Data persistence via Firestore


### Authentication
 
- Register account with username, email, and password
- Live password requirement checklist on the register form
- Show/hide password toggle
- Confirm password before account creation
- Forgot password with reset sent via email
- Protected routes wherein todo is only accessible once logged in
- Only allow user to access their own data using firebase security rules and unique uid per user


## Tech Stack

**Frontend:** React (Vite) + Tailwind CSS
 
We chose Vite for fast dev-server startup and hot module reload during development, and React for its component model, which made it straightforward to split the app into reusable pieces that could be built and merged independently by both partners.
 
**Backend / Database:** Firebase (Firestore + Authentication)
 
Rather than building a separate Express/Node REST API, we used Firebase's client SDK to talk to Firestore directly from React. We chose this over a custom Express backend because:
- Firestore's `onSnapshot` listeners give us real-time updates for free — task changes reflect instantly across the UI without manual polling or refetching.
- No server to host or maintain, Firestore's security rules handle access control directly, which was a better fit for the timeline of this lab.

**Authentication:** Firebase Authentication (Email/Password)
We chise Firebase Authentication over building our own because:
- Passwords are hashed and store by Firebase so we don't need to handle them and it saves us time to 
focus on the logic 
- It provides session persistence, password-reset handling via emails, and secure token handling
- Direct integration with Firestore security rules so the database can enfore per-use access



## Running the App Locally
 
### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or later recommended)
- npm (comes with Node.js)
- A Firebase project with Firestore and Anonymous Authentication enabled
### Setup
 
1. **Clone the repo**
```bash
   git clone https://github.com/rite-rash/cmsc128-Lab1_CRUD_Hechenagocia_Reyes.git
   cd cmsc128-Lab1_CRUD_Hechenagocia_Reyes/client
```
 
2. **Install dependencies**
```bash
   npm install
```
 
3. **Set up Firebase config**
   Create a `firebaseConfig.js` file inside `src/` (if not already present) with your own Firebase project credentials:
```js
   import { initializeApp } from "firebase/app";
   import { getAuth } from "firebase/auth";
   import { getFirestore } from "firebase/firestore";
 
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT.appspot.com",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID",
   };
 
   const app = initializeApp(firebaseConfig);
   export const auth = getAuth(app);
   export const db = getFirestore(app);
```
 
4. **Enable Firebase Services** in the Firebase Console [Firebase Console](https://console.firebase.google.com/): 
   - Enable **Firestore Database**
   - Enable **Authentication → Sign-in method → Email/Password**
   - Publish the Firestore security rules listed in Database Setup
5. **Run the dev server**
```bash
   npm run dev
```
   The app will be available at `http://localhost:5173` by default.
 
6. **Build for production** (optional)
```bash
   npm run build
```

## Database Setup

No migrations or seed data are needed. Firestore creates a collection the first time a document is written to it, so the collections below appear automatically as users register and add tasks.

### Collections

| Collection | Document ID | Purpose |
|---|---|---|
| `users` | the user's `uid` | Profile record created at registration (`uid`, `userName`, `email`, `createdAt`) |
| `usernames` | the username | Lookup used to keep usernames unique (stores the owner's `uid`) |
| `tasks` | auto-generated | A user's tasks, each tagged with the owner's `userId` |

### Firestore security rules

Go to **Firestore Database → Rules** and publish:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tasks/{taskId} {
      // Allow users to read, update, or delete only their own tasks
      allow read, update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
      
      // Allow authenticated users to create a task as long as they tag it with their UID
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }

    match /users/{userId} {
      // Each user can read and write only their own profile document
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /usernames/{name} {
      // Any logged-in user can check if a name is taken
      allow read: if request.auth != null;

      // Claim a name only if it is new, well-formed, and tagged with your own UID
      allow create: if request.auth != null
        && name.matches('[a-z0-9_]{3,20}')
        && request.resource.data.uid == request.auth.uid;

      // Only the owner can release their name
      allow delete: if request.auth != null && resource.data.uid == request.auth.uid;

      // No allow update line, so a taken name can never be overwritten
    }
  }
}
```

## Authentication Operations

Auth functions are wrapped in `AuthContext.jsx` and exposed to every page through the `useAuth()` hook. All of them call the Firebase Authentication SDK directly

### Register: create an account and profile
```js
const userCredential = await createUserWithEmailAndPassword(auth, email, password);
const newUser = userCredential.user;

await updateProfile(newUser, { userName });

await setDoc(doc(db, "users", newUser.uid), {
  uid: newUser.uid,
  userName,
  email: newUser.email,
  createdAt: new Date(),
});
```

### Log in
```js
await signInWithEmailAndPassword(auth, email, password);
```

### Log out
```js
await signOut(auth);
```

### Forgot password: send a reset email
```js
await sendPasswordResetEmail(auth, email);
```

### Error handling
Firebase error codes are mapped to friendly messages on each form, for example:

| Firebase error code | Message shown |
|---|---|
| `auth/invalid-credential` | Wrong email or password. |
| `auth/email-already-in-use` | The email you entered already exists. |
| `auth/invalid-email` | Please enter a valid email. |
| `auth/too-many-requests` | Too many attempts. Try again later. |

## Session Handling

- **Persistence:** Firebase Authentication keeps the user's session in the browser, so refreshing the page or closing and reopening the tab does not log the user out. The session lasts until the user logs out.
- **Session state:** `AuthProvider` subscribes to `onAuthStateChanged(auth, ...)` and stores the current `user` in React context. Any component can read it with `useAuth()`.
- **Route protection:** The todo page (`/`) is wrapped in a `ProtectedRoute` component. If there is no logged-in user, it redirects to `/login`. In the other direction, `/login` and `/register` redirect logged-in users back to `/`.
- **Logout:** Calling `signOut(auth)` clears the session, `user` becomes `null`, and `ProtectedRoute` sends the user back to `/login`.
- **Data access:** Every task stores the owner's `uid` in `userId`. The app queries only that user's tasks, and Firestore security rules enforce the same restriction on the server side.

```js
const q = query(collection(db, "tasks"), where("userId", "==", user.uid));

onSnapshot(q, (snapshot) => {
  const tasks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
});
```

## Password Recovery

1. On the login page, the user clicks **Forgot password?**, which opens `/forgot-password`.
2. The user enters their account email and submits the form.
3. The app calls `sendPasswordResetEmail(auth, email)`, and Firebase emails a password-reset link.
4. The user opens the link, sets a new password on the Firebase-hosted reset page, and use that in next log in.

Firebase handles sending the reset email and hosting the reset page, so no email server or custom backend is needed on our side.

## Data Operations (Firestore CRUD)
 
Since there's no REST API layer, all CRUD operations happen via the Firestore SDK directly in `Todo.jsx`. Here's what each operation looks like:
 
### Create — Add a new task
```js
await addDoc(collection(db, "tasks"), {
  taskName: "Finish lab report",
  dueDate: "2026-09-15",
  dueTime: "23:59",
  status: "not started",
  priority: "high",
  category: "school",
  userId: user.uid,
  createdAt: serverTimestamp(),
});
```
 
### Read — Listen for a user's tasks in real time
```js
const q = query(collection(db, "tasks"), where("userId", "==", user.uid));
 
onSnapshot(q, (snapshot) => {
  const tasks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  // tasks state updates automatically whenever Firestore data changes
});
```

 
### Update — Edit a task or toggle its status
```js
const taskRef = doc(db, "tasks", taskId);
await updateDoc(taskRef, { status: "done" });
```
 
### Delete — Remove a task
```js
const taskRef = doc(db, "tasks", taskId);
await deleteDoc(taskRef);
```
 
## Screenshots
![alt text](image.png)
![alt text](image-1.png)
![alt text](image-2.png)
![alt text](image-3.png)
![alt text](image-4.png)
![alt text](image-5.png)
![alt text](image-6.png)
![alt text](image-7.png)
![alt text](image-8.png)
![alt text](image-9.png)
![alt text](image-10.png)
![alt text](image-11.png)
![alt text](image-12.png)
![alt text](image-13.png)
![alt text](image-14.png)
![alt text](image-15.png)
![alt text](image-16.png)
![alt text](image-17.png)
![alt text](image-20.png)
![alt text](image-19.png)