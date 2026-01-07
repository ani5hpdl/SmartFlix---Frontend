import { Mail, Lock, Eye,EyeOff, Play } from 'lucide-react';
import { useState,useEffect } from 'react';
import { Button, Divider } from '../components/Elements';
import toast from 'react-hot-toast';
import { login } from '../services/api';
import {jwtDecode} from 'jwt-decode'
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

export default function Login() {

    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [formData,setFormData] = useState({
        email : '',
        password : ''
    });


    useEffect(() => {
        const token = Cookies.get('token');
        if (!token) return;

        try {
            const decoded = jwtDecode(token);
            if (decoded.role === 'admin') {
                navigate('/admindash');
            } else {
                navigate('/userdash');
            }
        } catch (err) {
            console.error('Invalid token');
        }
    }, [navigate]);


    const handleChange = (e) =>{
        setFormData({
            ...formData,
            [e.target.name] : e.target.value
        });
    }

    const validate = () => {
        if(!formData.email){
            toast.error("Email is Required!!");
            return false;
        }

        if(!formData.password){
            toast.error("Password is Required!!")
            return false;
        }

        return true;
    }

  const handleSubmit = async(e) => {
    e.preventDefault();
    if(!validate()) return;
    const dataToSubmit = {
        email : formData.email,
        password : formData.password,
        rememberMe : rememberMe
    }
    try{
        const response = await login(dataToSubmit);
        if(response?.data?.success == false){
            console.log(response)
            return toast.error(response?.data?.message)
        }
        if(rememberMe){
            Cookies.set('token', response?.data?.token, {expires: 7 });
        }else{
            localStorage.setItem("token", response?.data?.token)
        }
        console.log(response)

        toast.success(response?.data?.message)
        let decoded;
        try{
            decoded = jwtDecode(response?.data?.token);
        }catch(error){
            return toast.error("Invalid token")
        }

        navigate(decoded.role === 'admin' ? '/admindash' : '/userdash');
    }catch(error){
        // If using Axios
            if (error.response) {
                // The request was made and the server responded with a status code outside 2xx
                if (error.response.data?.message) {
                    toast.error(error.response.data.message);
                }else {
                    toast.error(`Error: ${error.response.status}`);
                }
            } else if (error.request) {
                // The request was made but no response was received
                toast.error('No response from server. Please try again later.');
            } else {
                // Something happened in setting up the request
                toast.error('Something went wrong!');
            }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative blurred circles in background */}
       <div
            className="absolute inset-0 bg-[url(./assets/background.jpg)] bg-cover bg-center opacity-50"
            aria-hidden="true"
        />

        {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>

      
      {/* Header */}
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

      {/* Login Card */}
      <div className="w-full max-w-[30rem] bg-slate-900 opacity-100 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-purple-500 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-gray-400 text-sm">Enter your details to access your watchlist.</p>
        </div>

        <div className="space-y-5">
          {/* Email Input */}
          <div>
            <label className="block text-gray-300 text-sm mb-2">Email or Username</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                name='email'
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-gray-300 text-sm">Password</label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type={showPassword ? "text" : "password"}
                name='password'
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-11 pr-11 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
              <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
            </div>
          </div>

          {/* Remember Me */}
            <div className="flex items-center justify-between">
            <label className="flex items-center gap-3 text-sm text-gray-400 cursor-pointer">
                <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 bg-slate-800/50 text-purple-600 focus:ring-2 focus:ring-purple-500/20 focus:ring-offset-0 cursor-pointer"
                />
                Remember me
            </label>

            <button
                type="button"
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
                Forgot password?
            </button>
            </div>


          {/* Sign In Button */}

          <Button  children={"Sign In"} onClick={handleSubmit}/>

          {/* Divider */}
          <Divider text={"Or Continue with"} />

          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => toast.error("On Development Phase!!")}
              className="flex items-center justify-center gap-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-white py-3 rounded-lg transition-all"
            >
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
              <span className="text-sm font-medium">Google</span>
            </button>
            <button
              type="button"
              onClick={() => toast.error("On Development Phase!!")}
              className="flex items-center justify-center gap-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-white py-3 rounded-lg transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              <span className="text-sm font-medium">Apple</span>
            </button>
          </div>
        </div>

        {/* Sign Up Link */}
        <p className="text-center text-gray-400 text-sm mt-6">
          Don't have an account?{' '}
          <button onClick={()=> navigate('/signup')} className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
            Sign Up
          </button>
        </p>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 left-0 right-0 text-center">
        <p className="text-gray-500 text-xs">© 2024 SmartFlix. All rights reserved.</p>
      </div>
    </div>
  );
}