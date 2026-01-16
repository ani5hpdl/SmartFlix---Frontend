import { Check,Play } from "lucide-react";

export default function Test() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#0b0614] via-[#120a24] to-[#05020a] text-white">
      {/* Logo */}
      <div className="absolute top-6 left-6 flex items-center gap-2 text-sm font-semibold text-white/90">
        <div className="w-3 h-3 rounded-sm bg-purple-600" />
        StreamFlow
      </div>

      
        <Card className="w-[380px] rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
          <CardContent className="p-8 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-full bg-purple-600/20 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
            </div>

            <h1 className="text-xl font-semibold">You’re All Set!</h1>

            <p className="text-sm text-white/70 leading-relaxed">
              Your email has been successfully verified. Your account is now
              active and you are ready to start your cinematic journey.
            </p>

            <Button className="mt-4 w-full rounded-lg bg-purple-600 hover:bg-purple-500 transition">
              Go to Sign In →
            </Button>

            <div className="mt-2 text-xs text-white/40">
              Redirecting to login in 5 seconds...
            </div>
          </CardContent>
        </Card>
      {/* Footer */}
      <div className="absolute bottom-6 text-xs text-white/40 flex gap-6">
        <span className="hover:text-white cursor-pointer">Help Center</span>
        <span className="hover:text-white cursor-pointer">Contact Support</span>
        <span className="hover:text-white cursor-pointer">Privacy Policy</span>
      </div>

      <div className="absolute bottom-2 text-[10px] text-white/30">
        © 2024 StreamFlow Inc. All rights reserved.
      </div>
    </div>
  );
}