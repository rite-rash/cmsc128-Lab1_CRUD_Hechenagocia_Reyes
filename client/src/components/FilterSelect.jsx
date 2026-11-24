//DESCRIPTION: Reusable custom dropdown filter for task lists

import { useState, useRef, useEffect } from "react";

export default function FilterSelect({ value, onChange, options, ariaLabel }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selected = options.find((opt) => opt.value === value) || options[0];

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                aria-label={ariaLabel}
                aria-expanded={open}
                onClick={() => setOpen((prev) => !prev)}
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-pink-200 bg-white px-3.5 py-2 text-xs font-semibold text-[#4a1f33] shadow-sm transition-colors hover:border-[#c2185b] focus:border-[#c2185b] focus:ring-2 focus:ring-pink-200 focus:outline-none"
            >
                <span>{selected?.label}</span>
                <svg
                    className={`h-3.5 w-3.5 text-[#7a0f3d] transition-transform ${open ? "rotate-180" : ""}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                >
                    <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>

            {open && (
                <ul
                    role="listbox"
                    className="absolute right-0 z-20 mt-1.5 min-w-[150px] overflow-hidden rounded-xl border border-pink-100 bg-white py-1 shadow-lg"
                >
                    {options.map((opt) => {
                        const active = opt.value === value;
                        return (
                            <li key={opt.value} role="option" aria-selected={active}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        onChange(opt.value);
                                        setOpen(false);
                                    }}
                                    className={`flex w-full cursor-pointer items-center justify-between px-3.5 py-2 text-left text-xs font-semibold transition-colors ${
                                        active
                                            ? "bg-pink-100 text-[#7a0f3d]"
                                            : "text-[#4a1f33] hover:bg-pink-50"
                                    }`}
                                >
                                    <span>{opt.label}</span>
                                    {active && <span className="text-[#c2185b]">✓</span>}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}