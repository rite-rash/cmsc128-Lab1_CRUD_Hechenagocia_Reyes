import { useState } from "react";
import {
    LockIcon,
    EyeIcon,
    EyeOffIcon,
    fieldClass,
    inputClass,
    labelClass,
} from "./AuthParts";

// Same props as a normal <input>, plus `label`.
function PasswordInput({ id, label, ...inputProps }) {
    const [visible, setVisible] = useState(false);

    return (
        <div>
            <label htmlFor={id} className={labelClass}>
                {label}
            </label>
            <div className={fieldClass}>
                <LockIcon />
                <input
                    id={id}
                    type={visible ? "text" : "password"}
                    required
                    className={inputClass}
                    {...inputProps}
                />
                <button
                    type="button"
                    onClick={() => setVisible((v) => !v)}
                    aria-label={visible ? "Hide password" : "Show password"}
                    aria-pressed={visible}
                    className="rounded-md text-[#7a3f5a] hover:text-[#c2185b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2185b]"
                >
                    {visible ? <EyeOffIcon /> : <EyeIcon />}
                </button>
            </div>
        </div>
    );
}

export default PasswordInput;