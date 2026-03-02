import { Link, useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100 flex items-center justify-center px-6">
      <style>{`
        @keyframes floatUpDown {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-14px); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.45; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.08); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .nf-float { animation: floatUpDown 6s ease-in-out infinite; }
        .nf-pulse { animation: pulseGlow 8s ease-in-out infinite; }
        .nf-enter { animation: fadeInUp 0.8s cubic-bezier(.22,1,.36,1) both; }
      `}</style>

      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-purple-700/20 blur-3xl nf-pulse" />
      <div className="pointer-events-none absolute -bottom-52 -right-36 h-[28rem] w-[28rem] rounded-full bg-violet-700/20 blur-3xl nf-pulse" />
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-purple-900/20 blur-3xl nf-float" />

      <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-8 md:p-12 shadow-2xl shadow-black/40 nf-enter">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800 text-xl font-bold shadow-lg shadow-purple-900/40 nf-float">
          !
        </div>

        <p className="text-purple-300 font-semibold tracking-[0.22em] text-sm text-center">ERROR 404</p>
        <h1 className="mt-3 text-center text-4xl md:text-6xl font-black leading-tight text-white">
          Lost In The Reel
        </h1>
        <p className="text-slate-300/90 mt-5 text-center max-w-xl mx-auto text-sm md:text-base">
          The page you are trying to open is not available. It may have been removed, renamed,
          or never existed in this timeline.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/dashboard"
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 transition-all duration-300 shadow-lg shadow-purple-900/30"
          >
            Back to Dashboard
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-xl border border-slate-600 hover:border-slate-400 hover:bg-slate-800/60 transition-all duration-300"
          >
            Go Back
          </button>
          <Link
            to="/login"
            className="px-5 py-2.5 rounded-xl border border-purple-600/50 hover:border-purple-400 hover:bg-purple-500/10 transition-all duration-300"
          >
            Open Login
          </Link>
        </div>
      </div>
    </div>
  )
}

