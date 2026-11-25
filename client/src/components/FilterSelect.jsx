// DESCRIPTION: Reusable custom dropdown filter for task lists

import { useState, useRef, useEffect } from "react";

export default function FilterSelect({ value, onChange, options, placeholder, ariaLabel }) {
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

    const active = value !== "all";
    const selected = options.find((opt) => opt.value === value);
    const allOptions = placeholder
        ? [{ value: "all", label: "Any" }, ...options]
        : options;

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                aria-label={ariaLabel || placeholder}
                aria-expanded={open}
                onClick={() => setOpen((prev) => !prev)}
                className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold shadow-sm transition-colors focus:ring-2 focus:ring-pink-200 focus:outline-none ${
                    active
                        ? "border-[#7a0f3d] bg-[#7a0f3d] text-white"
                        : "border-pink-200 bg-white text-[#4a1f33] hover:border-[#c2185b]"
                }`}
            >
                <span>{selected ? selected.label : placeholder || options[0]?.label}</span>
                <svg
                    className={`h-3.5 w-3.5 transition-transform ${
                        active ? "text-white" : "text-[#7a0f3d]"
                    } ${open ? "rotate-180" : ""}`}
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
                    {allOptions.map((opt) => {
                        const isSelected = opt.value === value;
                        return (
                            <li key={opt.value} role="option" aria-selected={isSelected}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        onChange(opt.value);
                                        setOpen(false);
                                    }}
                                    className={`flex w-full cursor-pointer items-center justify-between px-3.5 py-2 text-left text-xs font-semibold transition-colors ${
                                        isSelected
                                            ? "bg-pink-100 text-[#7a0f3d]"
                                            : "text-[#4a1f33] hover:bg-pink-50"
                                    }`}
                                >
                                    <span>{opt.label}</span>
                                    {isSelected && <span className="text-[#c2185b]">✓</span>}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}