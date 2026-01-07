import { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, Play } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { createUserApi } from '../services/api';
import { useNavigate } from "react-router-dom";

export default function Signup() {
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: "",
        password: "",
        confirmPassword: ""
    });

    const calculatePasswordStrength = (pass) => {
        if (!pass) return 0;
        let strength = 0;
        if (pass.length >= 8) strength += 25;
        if (pass.match(/[a-z]+/)) strength += 25;
        if (pass.match(/[A-Z]+/)) strength += 25;
        if (pass.match(/[0-9]+/)) strength += 25;
        return strength;
    };

    const strength = calculatePasswordStrength(formData.password);

    const getStrengthLabel = () => {
        if (strength === 0) return '';
        if (strength <= 25) return 'Weak';
        if (strength <= 50) return 'Fair';
        if (strength <= 75) return 'Good';
        return 'Strong';
    };

    const getStrengthColor = () => {
        if (strength <= 25) return 'bg-red-500';
        if (strength <= 50) return 'bg-yellow-500';
        if (strength <= 75) return 'bg-orange-500';
        return 'bg-green-500';
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }

    const validate = () => {
        if (!formData.name) {
            toast.error('Name is Required');
            return false;
        }

        if (!formData.email) {
            toast.error('Email is Required');
            return false;
        }

        if (!formData.password) {
            toast.error('Password is Required');
            return false;
        }

        if (!formData.confirmPassword) {
            toast.error('Confirm Password is Required');
            return false;
        }

        if (formData.password < 6) {
            toast.error('Password Must be 6 Letters');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            console.log(formData.password);
            console.log(formData.confirmPassword);
            toast.error('Password and Confirm Password Doesnot Match!');
            return false;
        }

        return true;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        const dataToSubmit = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            agreeToTerms: agreeToTerms
        }
        console.log(dataToSubmit);
        try {
            const response = await createUserApi(dataToSubmit);
            if (response.data.sucess) {
                toast.success(response?.data?.message);
                setFormData({
                    name: '',
                    email: '',
                    password: '',
                    confirmPassword: ''
                });
                setAgreeToTerms(false);
                navigate('/login');
            } else {
                toast.error(response.data.message || "Failed to create account!")
            }
        } catch (error) {
            // If using Axios
            if (error.response) {
                // The request was made and the server responded with a status code outside 2xx
                if (error.response.status === 409) {
                    toast.error('User with this email already exists!');
                } else if (error.response.data?.message) {
                    toast.error(error.response.data.message);
                } else {
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
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">

            {/* Decorative blurred circles with better positioning */}
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

            {/* Signup Card */}
            <div className="w-full max-w-lg bg-slate-900 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-purple-500 relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Start Your Watchlist</h1>
                    <p className="text-gray-400 text-sm">Get personalized movie recommendations today.</p>
                </div>

                <div className="space-y-5">
                    {/* Full Name Input */}
                    {/* Full Name & Email Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-300 text-sm mb-2">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    name='name'
                                    onChange={handleChange}
                                    value={formData.name}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-300 text-sm mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="email"
                                    name='email'
                                    onChange={handleChange}
                                    value={formData.email}
                                    placeholder="Email Address"
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                />
                            </div>
                        </div>
                    </div>


                    {/* Password Input */}
                    <div>
                        {/* Password & Confirm Password Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-300 text-sm mb-2">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name='password'
                                        placeholder="Password"
                                        value={formData.password}
                                        onChange={handleChange}
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

                            <div>
                                <label className="block text-gray-300 text-sm mb-2">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        type="password"
                                        name='confirmPassword'
                                        placeholder="Confirm Password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                    />
                                </div>
                            </div>
                        </div>


                        {/* Password Strength Indicator */}
                        {formData.password && (
                            <div className="mt-2">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-gray-400 uppercase">Strength</span>
                                    <span className={`text-xs font-medium ${strength <= 25 ? 'text-red-500' :
                                            strength <= 50 ? 'text-yellow-500' :
                                                strength <= 75 ? 'text-orange-500' :
                                                    'text-green-500'
                                        }`}>
                                        {getStrengthLabel()}
                                    </span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                                        style={{ width: `${strength}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>



                    {/* Terms Checkbox */}
                    <div className="flex items-start gap-3">
                        <input
                            type="checkbox"
                            id="terms"
                            name='agreeToTerms'
                            checked={agreeToTerms}
                            onChange={(e) => setAgreeToTerms(e.target.checked)}
                            className="mt-1 w-4 h-4 rounded border-slate-600 bg-slate-800/50 text-purple-600 focus:ring-2 focus:ring-purple-500/20 focus:ring-offset-0 cursor-pointer"
                        />
                        <label htmlFor="terms" className="text-sm text-gray-400 leading-tight cursor-pointer">
                            I agree to the{' '}
                            <button className="text-purple-400 hover:text-purple-300 transition-colors">
                                Terms of Service
                            </button>
                            {' '}and{' '}
                            <button className="text-purple-400 hover:text-purple-300 transition-colors">
                                Privacy Policy
                            </button>
                            .
                        </label>
                    </div>

                    {/* Create Account Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={!agreeToTerms}
                        className={`w-full bg-gradient-to-r from-purple-600 to-purple-700 
                            hover:from-purple-500 hover:to-purple-600 text-white font-semibold 
                            py-3 rounded-lg transition-all shadow-lg shadow-purple-500/30 
                            hover:shadow-purple-500/50
                            ${!agreeToTerms ? 'cursor-not-allowed opacity-50 hover:from-purple-600 hover:to-purple-700 hover:shadow-purple-500/30' : 'cursor-pointer'}`}
                    >
                        Create Account
                    </button>


                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-slate-900/50 text-gray-500 uppercase text-xs">
                                or continue with
                            </span>
                        </div>
                    </div>

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

                {/* Sign In Link */}
                <p className="text-center text-gray-400 text-sm mt-6">
                    Already a member?{' '}
                    <button className="text-purple-400 hover:text-purple-300 font-medium transition-colors" onClick={() => navigate('/login')}>
                        Sign In
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