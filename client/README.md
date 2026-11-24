# CMSC128 Todo List (CRUD)

A todo list app with full CRUD functionality, built for CMSC128 by Trisha Mae Hechenagocia & Aleighia Keith Reyes.

**Live app:** https://cmsc128-todo.web.app

## Features

- Create, read, update, and delete tasks
- Delete includes a 5-second "Undo" window before the task is permanently removed
- Mark tasks as done via checkbox (strikethrough + color change)
- Sort tasks by Date Added, Due Date, Priority, or Category
- Filter tasks by Category or Priority
- Collaborative to-do lists (create a list, add members by username)
- Data persistence via Firestore

## Tech Stack

**Frontend:** React (Vite) + Tailwind CSS

We chose Vite for fast dev-server startup and hot module reload, and React for its component model, which let both partners build and merge separate pieces independently.

**Backend:** Firebase (Cloud Functions + Authentication)

**Database:** Cloud Firestore

**Hosting:** Firebase Hosting

We chose Firebase over a custom Express server because:
- Firestore's `onSnapshot` listeners give real-time updates without manual polling or refetching.
- There is no server to host or maintain, and Firestore security rules handle access control directly.
- Hosting, functions, database, and auth are all in one place, which made deployment simple.

## Refactoring and Optimization

The project already had a clear architecture and separated responsibilities from the start, so most of the refactoring went into the frontend to follow UI/UX standards.

- **Branding.** We added a logo and a consistent look and feel across all screens. This meant recoloring components, changing fonts, resizing elements, and applying the same styling everywhere so the app feels like one product.
- **Better file separation.** We added new files to keep code organized, such as `AuthParts.jsx` in `src/`.
- **Breadcrumbs.** Added to the pages so users always know where they are and can go back easily.
- **Logout confirmation dialog.** Logging out now asks the user to confirm. Before, it logged out right away, which made accidental logouts easy.
- **Undo countdown.** After deleting a task, the Undo window now shows a countdown, as suggested by the instructor, so users can see how much time they have left.
- **Improved contrast.** Text and background colors were adjusted so everything is easier to read.

## Accessing the Deployed App

The app is hosted on Firebase Hosting:

**https://cmsc128-todo.web.app**

No setup is needed on the instructor's end. Open the link in any browser and use the app right away.

## Running the App Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or later recommended)
- npm (comes with Node.js)
- [Firebase CLI](https://firebase.google.com/docs/cli) (`npm install -g firebase-tools`), only needed to deploy or run the emulators
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

3. **Set up the Firebase config**
   Create `src/firebaseConfig.js` with your own Firebase project credentials:
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

   In the [Firebase Console](https://console.firebase.google.com/):
   - Enable **Firestore Database**
   - Enable **Authentication → Sign-in method → Anonymous**

4. **Run the dev server**
```bash
npm run dev
```
   The app will be available at `http://localhost:5173`.

5. **Build for production** (optional)
```bash
npm run build
```

### Deploying (optional)

```bash
firebase login
firebase deploy
```

If the project has a `functions/` folder, run `npm install` inside it first.

## API / Database Operations (Firestore)

The app talks to Firestore through the Firebase SDK, mainly in `App.jsx`. These are the operations used for the CRUD endpoints of the app.

### Create: add a new task
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

### Read: listen for a user's tasks in real time
```js
const q = query(collection(db, "tasks"), where("userId", "==", user.uid));

onSnapshot(q, (snapshot) => {
  const tasks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  // tasks state updates automatically whenever Firestore data changes
});
```

### Update: edit a task or toggle its status
```js
const taskRef = doc(db, "tasks", taskId);
await updateDoc(taskRef, { status: "done" });
```

### Delete: remove a task
```js
const taskRef = doc(db, "tasks", taskId);
await deleteDoc(taskRef);
```