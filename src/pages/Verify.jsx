import { Check,Play } from "lucide-react";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { verify } from "../services/api";

export default function Verify() {
    
    const navigate = useNavigate();
    const {token} = useParams();
    let msg;
    let title;

    const verifyMe = async() => {
        try{
            const response = await verify(token);
            if (response?.data?.success) {
                title = "You’re All Set!";
                msg = "Your email has been successfully verified. Your account is now active and you are ready to start your cinematic journey."
                return toast.success(response?.data?.message);
            }else if(response?.data?.message == "Verification Token Expired Try Login Again!!"){
                title = "Verification Link Expired!"
                msg = "The link you clicked has expired. For your security. verification links are only verified for 1 hours."
                return toast.success("Token Expired! Try Logging In!!");
            }else {
                return toast.error(response?.data?.message);
            }
        }catch(error){
            toast.error("Error While Verifying!!");
        }finally {
            setTimeout(() => {
                navigate('/login');
            }, 4000); // delay in milliseconds 
        }

    }

    useEffect(() => {
        if (token) {
            verifyMe(); // ✅ Added () to actually call the function
        }
    }, [token]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#0b0614] via-[#120a24] to-[#05020a] text-white">
      {/* Logo */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
                  <Play className="w-5 h-5 text-white fill-white" />
                </div>
                <span className="text-white text-xl font-bold">SmartFlix</span>
              </div>
              <button className="text-gray-400 hover:text-white transition-colors text-sm">
                Need help?
              </button>
            </div>

      <div>
        <div className="w-[400px] rounded-2xl bg-white/5 backdrop-blur-xl border border-purple-500 shadow-2xl">
          <div className="p-8 flex flex-col items-center text-center gap-4">
            {/* icon */}
            <div className="w-14 h-14 rounded-full bg-purple-600/20 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
            </div>

            <h1 className="text-xl font-semibold">{title}</h1>

            <p className="text-sm text-white/70 leading-relaxed">
              {msg}
            </p>

            <button className="mt-4 w-full rounded-lg bg-purple-600 hover:bg-purple-500 transition py-2.5 text-sm font-medium"
                onClick={()=> navigate('/login')}
            >
              Go to Login In →
            </button>

            <div className="mt-2 text-xs text-white/40">
              Redirecting to login in few seconds...
            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="absolute bottom-6 text-xs text-white/40 flex gap-6">
        <span className="hover:text-white cursor-pointer">Help Center</span>
        <span className="hover:text-white cursor-pointer">Contact Support</span>
        <span className="hover:text-white cursor-pointer">Privacy Policy</span>
      </div>

      <div className="absolute bottom-2 text-[10px] text-white/30">
        © 2024 SmartFlix. All rights reserved.
      </div>
    </div>
  );
}