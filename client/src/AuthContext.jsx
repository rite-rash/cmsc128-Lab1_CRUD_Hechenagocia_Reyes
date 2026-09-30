import { createContext, useContext, useEffect, useState } from "react";

import {
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";

import { auth } from "./firebaseConfig";

const AuthContext = createContext(null);

function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setAuthLoading(false);
        });
        return unsub;
    }, []);

    const value = {
        user,
        authLoading,
        signup: (email, pw) => createUserWithEmailAndPassword(auth, email, pw),
        login: (email, pw) => signInWithEmailAndPassword(auth, email, pw),
        logout: () => signOut(auth),
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

const useAuth = () => useContext(AuthContext);

export { AuthProvider, useAuth };