// Shared building blocks for Login / Register / (forgot password later)

import logo from "./assets/logo.png";

export const fieldClass =
    "flex items-center gap-3 rounded-xl border border-[#e8bfd0] bg-[#fff7fa] px-3.5 py-2.5 " +
    "text-[#7a3f5a] transition focus-within:border-[#c2185b] focus-within:ring-2 focus-within:ring-[#c2185b]/20";

export const inputClass =
    "w-full bg-transparent text-[15px] text-[#3d0a20] placeholder:text-[#7a3f5a]/80 outline-none";

export const labelClass = "mb-1.5 block text-sm font-semibold text-[#3d0a20]";

export const buttonClass =
    "w-full rounded-xl bg-[#c2185b] px-4 py-3 text-[15px] font-semibold text-white " +
    "shadow-[0_10px_24px_-8px_rgba(194,24,91,0.55)] transition hover:bg-[#a8144d] " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2185b] focus-visible:ring-offset-2 " +
    "disabled:cursor-not-allowed disabled:bg-[#ecc4d6] disabled:text-[#6b1d45] disabled:shadow-none";

export const linkClass =
    "font-semibold text-[#b0124f] underline underline-offset-4 hover:text-[#8a1148] " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2185b] rounded-sm";

export const errorClass = "text-sm font-semibold text-[#b3123f]";
export const hintClass = "text-sm text-[#7a3f5a]";

/* ---------- Icons (stroke icons, inherit text color) ---------- */
const iconProps = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
    className: "shrink-0",
};

export const MailIcon = () => (
    <svg {...iconProps}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
    </svg>
);

export const UserIcon = () => (
    <svg {...iconProps}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" />
    </svg>
);

export const LockIcon = () => (
    <svg {...iconProps}>
        <rect x="5" y="11" width="14" height="9" rx="2" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
);

export const EyeIcon = () => (
    <svg {...iconProps}>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

export const EyeOffIcon = () => (
    <svg {...iconProps}>
        <path d="M3 3l18 18" />
        <path d="M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.5 6.6A17 17 0 0 0 2 12s3.5 7 10 7c1.7 0 3.2-.4 4.5-1" />
        <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
);

/* ---------- Brand ---------- */
function Logo() {
    return (
        <div className="flex items-center justify-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center">
                <img src={logo} alt="" className="h-13 w-13 rounded-lg object-cover" />
            </span>
            <span className="font-['Fraunces',serif] text-[1.7rem] font-bold tracking-[0.2em] text-[#a8144d]">
                HIBI
            </span>
        </div>
    );
}

/* ---------- Layout wrapper ---------- */
// `footer` renders under the card (e.g. "No account? Register").
// The fixed blush layer makes the page one solid color regardless of what
// Layout paints behind it. Once Layout's own background is solid #fff0f5,
// this layer can go.
export function AuthCard({ title, onSubmit, children, footer }) {
    return (
        <>
            <div aria-hidden="true" className="fixed inset-0 z-0 bg-[#fff0f5]" />
            <div className="relative z-10 my-auto w-full max-w-[26rem] px-4 py-8">
                <Logo />

                <h1 className="mt-5 text-center font-['Fraunces',serif] text-3xl font-bold text-[#8a1148]">
                    {title}
                </h1>

                <form
                    onSubmit={onSubmit}
                    className="mt-5 flex flex-col gap-4 rounded-3xl border border-[#f3cfdd] bg-white p-6 shadow-[0_20px_50px_-24px_rgba(194,24,91,0.3)]"
                >
                    {children}
                </form>

                {footer && <p className="mt-5 text-center text-sm text-[#7a3f5a]">{footer}</p>}
            </div>
        </>
    );
}

/* ---------- Text field (label above, icon inside) ---------- */
export function TextField({ id, label, icon, ...inputProps }) {
    return (
        <div>
            <label htmlFor={id} className={labelClass}>
                {label}
            </label>
            <div className={fieldClass}>
                {icon}
                <input id={id} className={inputClass} {...inputProps} />
            </div>
        </div>
    );
}