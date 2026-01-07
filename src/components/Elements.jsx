export function Button({
    children,
    type = "Button",
    onClick,
    variant = 'primary',
    className = ' '
}){
    const base =
    'w-full font-semibold py-3 rounded-lg transition-all focus:outline-none';

  const variants = {
        primary:
        'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50',
        secondary:
        'bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-white',
        ghost:
        'text-purple-400 hover:text-purple-300',
    };
    return (
        <button
            type={type}
            onClick={onClick}
            className= {`${base} ${variants[variant]} ${className}`}
          >
            {children}
          </button>
    );
}

export function Divider({
    text
}){
    return(
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