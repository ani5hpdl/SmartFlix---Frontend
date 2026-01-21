export function Button({
    children,
    type = "button",
    onClick,
    variant = 'primary',
    className = '',
    disabled = false
}) {
    const base = 'w-full font-semibold py-3 rounded-lg transition-all focus:outline-none';

    const variants = {
        primary: 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50',
        secondary: 'bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-white',
        ghost: 'text-purple-400 hover:text-purple-300',
    };

    const disabledStyles = 'cursor-not-allowed opacity-50 hover:from-purple-600 hover:to-purple-700 hover:shadow-purple-500/30';

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${base} ${variants[variant]} ${disabled ? disabledStyles : 'cursor-pointer'} ${className}`}
        >
            {children}
        </button>
    );
}

export function Divider({ text }) {
    return (
        <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-900/50 text-gray-500 uppercase text-xs">
                    {text}
                </span>
            </div>
        </div>
    );
}

export function Input({
    type = "text",
    name,
    value,
    onChange,
    placeholder,
    icon: Icon,
    className = '',
    label,
    rightElement
}) {
    return (
        <div>
            {label && (
                <label className="block text-gray-300 text-sm mb-2">{label}</label>
            )}
            <div className="relative">
                {Icon && (
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                )}
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`w-full bg-slate-800/50 border border-slate-700 rounded-lg ${Icon ? 'pl-11' : 'pl-4'} ${rightElement ? 'pr-11' : 'pr-4'} py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all ${className}`}
                />
                {rightElement && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {rightElement}
                    </div>
                )}
            </div>
        </div>
    );
}

export function Checkbox({
    id,
    name,
    checked,
    onChange,
    label,
    className = ''
}) {
    return (
        <div className={`flex items-start gap-3 ${className}`}>
            <input
                type="checkbox"
                id={id}
                name={name}
                checked={checked}
                onChange={onChange}
                className="mt-1 w-4 h-4 rounded border-slate-600 bg-slate-800/50 text-purple-600 focus:ring-2 focus:ring-purple-500/20 focus:ring-offset-0 cursor-pointer"
            />
            {label && (
                <label htmlFor={id} className="text-sm text-gray-400 leading-tight cursor-pointer">
                    {label}
                </label>
            )}
        </div>
    );
}

export function SocialButton({
    provider,
    onClick,
    icon: IconSVG
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex items-center justify-center gap-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-white py-3 rounded-lg transition-all"
        >
            {IconSVG}
            <span className="text-sm font-medium">{provider}</span>
        </button>
    );
}

export function PasswordStrength({ password }) {
    const calculateStrength = (pass) => {
        if (!pass) return 0;
        let strength = 0;
        if (pass.length >= 8) strength += 25;
        if (pass.match(/[a-z]+/)) strength += 25;
        if (pass.match(/[A-Z]+/)) strength += 25;
        if (pass.match(/[0-9]+/)) strength += 25;
        return strength;
    };

    const strength = calculateStrength(password);

    const getLabel = () => {
        if (strength === 0) return '';
        if (strength <= 25) return 'Weak';
        if (strength <= 50) return 'Fair';
        if (strength <= 75) return 'Good';
        return 'Strong';
    };

    const getColor = () => {
        if (strength <= 25) return 'bg-red-500';
        if (strength <= 50) return 'bg-yellow-500';
        if (strength <= 75) return 'bg-orange-500';
        return 'bg-green-500';
    };

    const getTextColor = () => {
        if (strength <= 25) return 'text-red-500';
        if (strength <= 50) return 'text-yellow-500';
        if (strength <= 75) return 'text-orange-500';
        return 'text-green-500';
    };

    if (!password) return null;

    return (
        <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400 uppercase">Strength</span>
                <span className={`text-xs font-medium ${getTextColor()}`}>
                    {getLabel()}
                </span>
            </div>
            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-300 ${getColor()}`}
                    style={{ width: `${strength}%` }}
                ></div>
            </div>
        </div>
    );
}

export function Header({ onHelpClick }) {
    return (
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-6">
            <Logo />
            <button
                onClick={onHelpClick}
                className="text-gray-400 hover:text-white transition-colors text-sm"
            >
                Need help?
            </button>
        </div>
    );
}

export function Logo() {
    return (
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white fill-white" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                </svg>
            </div>
            <span className="text-white text-xl font-bold">SmartFlix</span>
        </div>
    );
}

export function Footer() {
    return (
        <div className="absolute bottom-6 left-0 right-0 text-center">
            <p className="text-gray-500 text-xs">© 2024 SmartFlix. All rights reserved.</p>
        </div>
    );
}

export function AuthCard({ title, subtitle, children }) {
    return (
        <div className="w-full max-w-lg bg-slate-900 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-purple-500 relative z-10">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
                <p className="text-gray-400 text-sm">{subtitle}</p>
            </div>
            {children}
        </div>
    );
}

export function BackgroundPattern() {
    return (
        <>
            <div
                className="absolute inset-0 bg-[url(./assets/background.jpg)] bg-cover bg-center opacity-50"
                aria-hidden="true"
            />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
        </>
    );
}

export const GoogleIcon = (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
    </svg>
);

export const AppleIcon = (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
);