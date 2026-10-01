//DESCRIPTION: register an account in firestore with customized pw requirements
import { useState } from 'react';
import { Link, Navigate, useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { useAuth } from "./AuthContext";
import Layout from "./components/Layout";
import {updateProfile} from "firebase/auth";

import PasswordInput from "./PasswordInput";


export function Register() {
    const { user, signup } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");  
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [userName, setuserName] = useState("");

    //custom messages
    const messages = {
        "auth/invalid-argument": "Please fill all required fields.",
        "auth/invalid-email": "Please enter a valid email address",
        "auth/email-already-in-use": "The email you entered already exists. Please choose another one.",
        "auth/weak-password": "Password should adhere the following requirements: 8 minimum characters, at least 1 uppercase, at least 1 lowercase, at least 1 number or special character",
    };

    //for password min requirements
    const requirements = [
        {text: "Must be at least 8 characters long", check: (pw) => pw.length>=8},
        {text:"Must contain at least 1 uppercase character", check: (pw) => /[A-Z]/.test(pw)},
        {text: "Must contain at least 1 lowercase character", check: (pw) => /[a-z]/.test(pw)},
        {text: "Must contain at least 1 special character", check: (pw) => /[@\)!%*?&]/.test(pw) },
        {text:"Must contain at least 1 number",check: (pw) => /[0-9]/.test(pw) }
    ];



    if(user) return <Navigate to="/" replace />; //red if alr logged in

    const handleSubmit = async(e)=> {
        e.preventDefault();
        setError("");

        //check if password meets the custom req
        const isPasswordValid= requirements.every((req)=> req.check(password)); 
        if(!isPasswordValid) return setError("Password requirements not met. Please create a new one.");


        //check if pw is same w confirmation pw
        if(password!== confirmPassword) return setError("Passwords do not match."); 
        setSubmitting(true); // what does this do

        //create user in the firestore
        try {
            const userCredential = await signup(email, password);
            const newUser = userCredential.user;


            await updateProfile(newUser, {userName: userName.trim()})

            //persist user doc to firestore
            await setDoc(doc(db, "users", newUser.uid), {
                uid: newUser.uid,
                userName: userName.trim(),
                email: newUser.email,
                createdAt: new Date(),
            });
            navigate("/", { replace: true }); // go back to home



        } catch (err) {
            setError(messages[err.code] || "Failed to create an account. Please try again.");
        } finally {
            setSubmitting(false);
        }

    };

    return (
        <Layout>
            <form
                onSubmit={handleSubmit}
                className="my-auto w-full max-w-sm bg-[#bc688c] p-8 rounded-3xl shadow-2xl flex flex-col gap-4"
            >
                <h1 className="text-2xl font-extrabold text-white">Create an account</h1>
                <input
                    type="text"
                    required
                    placeholder="Enter username"
                    value={userName}
                    onChange={(e) => setuserName(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-pink-50 text-gray-900 outline-none"
                />


                <input
                    type="email"
                    required
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-pink-50 text-gray-900 outline-none"
                />

                <PasswordInput
                    placeholder="Create password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <div className="flex flex-col gap-2">
                    <PasswordInput
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />

                    <ul className="text-xs flex flex-col gap-1">
                        {requirements.map((req) => {
                            const met = req.check(password);
                            return (
                                <li
                                    key={req.text}
                                    className={met ? "text-green-200 font-semibold" : "text-pink-100/70"}
                                >
                                    {met ? "✓" : "○"} {req.text}
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {error && <p className="text-sm text-pink-100 font-semibold">{error}</p>}

                <button
                    disabled={submitting}
                    className="py-2 rounded-lg bg-pink-500 hover:bg-pink-600 text-white font-semibold disabled:opacity-60"
                >
                    {submitting?"Loading. Please wait..." : "Register"}
                </button>

                <p className="text-sm text-pink-100 text-center">
                    Already have an account?{" "}
                    <Link to="/login" className="font-semibold text-white hover:underline">
                        Log in
                    </Link>
                </p>
            </form>
        </Layout>
    );
}


export default Register;