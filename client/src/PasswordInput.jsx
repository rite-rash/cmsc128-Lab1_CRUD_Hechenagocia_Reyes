//DESCRIPTION: for hiding and showing password
import { useState } from "react";

export default function PasswordInput({ value, onChange, placeholder }) {
    const [show, setShow] = useState(false);
    return(
        <div className="relative">
            <input
                type={show ? "text" : "password"}
                required
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="w-full px-3 py-2 pr-10 rounded-lg bg-pink-50 text-gray-900 outline-none"
            />
            <button
                type="button"
                onClick={() => setShow(!show)}
                aria-label={show ? "Hide password":"Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    {show ? (
                        <>
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                        </>
                    ) : (
                        <>
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                        </>
                    )}
                </svg>
            </button>
        </div>
    );
}