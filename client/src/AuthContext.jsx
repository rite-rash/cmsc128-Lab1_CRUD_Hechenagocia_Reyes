import { createContext, useContext, useEffect, useState } from "react";




import {
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail, 
    updateProfile,
    verifyBeforeUpdateEmail,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
} from "firebase/auth";

import { doc, getDoc, writeBatch } from "firebase/firestore";

import { auth, db } from "./firebaseConfig";

// ---------- Constants ----------

// Usernames: lowercase letters, numbers, underscore, 3-20 characters
// (we lowercase the name before testing, so capitals are still allowed in the display name)
const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

const AuthContext = createContext(null);

// ---------- Helpers ----------

// Creates an Error with a `code`, so it can be looked up in the ERROR_MESSAGES maps
// the same way Firebase errors are
function makeError(code) {
    const err = new Error(code);
    err.code = code;
    return err;
}

// Changes the user's display name while keeping usernames unique:
//   1. validate the new name
//   2. check nobody else owns it
//   3. claim the new name and free the old one in a single batch
//   4. save the display name on the Firebase auth profile
async function updateUsername(name) {
    const trimmed = name.trim();
    const key = trimmed.toLowerCase(); // "usernames" docs are stored lowercase

    // 1. Validate format
    if (!USERNAME_PATTERN.test(key)) {
        throw makeError("username/invalid");
    }

    // 2. Check availability
    const uid = auth.currentUser.uid;
    const newRef = doc(db, "usernames", key);
    const newSnap = await getDoc(newRef);

    // Someone else already owns it
    if (newSnap.exists() && newSnap.data().uid !== uid) {
        throw makeError("username/taken");
    }

    // 3. Claim new name / free old name (all-or-nothing)
    const batch = writeBatch(db);

    // Claim the new name (skip if it's already ours, e.g. only the capital letters changed)
    if (!newSnap.exists()) {
        batch.set(newRef, { uid });
    }

    // Free the old name, but only if it exists in the list and belongs to us
    const oldKey = (auth.currentUser.displayName || "").toLowerCase();
    if (oldKey && oldKey !== key) {
        const oldRef = doc(db, "usernames", oldKey);
        const oldSnap = await getDoc(oldRef);
        if (oldSnap.exists() && oldSnap.data().uid === uid) {
            batch.delete(oldRef);
        }
    }

    await batch.commit();

    // 4. Save the display name (keeps the user's original capitalization)
    await updateProfile(auth.currentUser, { displayName: trimmed });
}

// ---------- Auth actions (thin wrappers around Firebase) ----------

const signup = (email, pw) => createUserWithEmailAndPassword(auth, email, pw);

const login = (email, pw) => signInWithEmailAndPassword(auth, email, pw);

const logout = () => signOut(auth);

// Firebase requires a recent login before sensitive changes (email/password),
// so call this first with the user's current password
const reauth = (currentPassword) => {
    const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword
    );
    return reauthenticateWithCredential(auth.currentUser, credential);
};

// Sends a verification link to the new address; the email only changes after it's clicked
const changeEmail = (newEmail) => verifyBeforeUpdateEmail(auth.currentUser, newEmail);

const changePassword = (newPassword) => updatePassword(auth.currentUser, newPassword);

// ---------- Provider ----------

function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true); // true until Firebase reports the initial state

    // Subscribe to login/logout changes; unsubscribe on unmount
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setAuthLoading(false);
        });
        return unsub;
    }, []);

    // Everything components can access through useAuth()
    const value = {
        user,
        authLoading,
        signup: (email, pw) => createUserWithEmailAndPassword(auth, email, pw),
        login: (email, pw) => signInWithEmailAndPassword(auth, email, pw),
        logout: () => signOut(auth),
        resetPassword:(email)=> sendPasswordResetEmail(auth, email),
//         signup,
//         login,
//         logout,
        updateName: updateUsername,
        reauth,
        changeEmail,
        changePassword,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

// ---------- Hook ----------

const useAuth = () => useContext(AuthContext);

export { AuthProvider, useAuth };