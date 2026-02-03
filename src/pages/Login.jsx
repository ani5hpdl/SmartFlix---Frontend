import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { login } from '../services/api';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import {
    Button,
    Input,
    Checkbox,
    Divider,
    SocialButton,
    Header,
    Footer,
    AuthCard,
    BackgroundPattern,
    GoogleIcon,
    AppleIcon
} from '../components/Elements';

export default function Login() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
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

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }

    const validate = () => {
        if (!formData.email) {
            toast.error("Email is Required!!");
            return false;
        }

        if (!formData.password) {
            toast.error("Password is Required!!")
            return false;
        }

        return true;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const dataToSubmit = {
            email: formData.email,
            password: formData.password,
            rememberMe: rememberMe
        }

        try {
            const response = await login(dataToSubmit);
            if (response?.data?.success == false) {
                return toast.error(response?.data?.message)
            }

            if (rememberMe) {
                Cookies.set('token', response?.data?.token, { expires: 7 });
                localStorage.setItem("token", response?.data?.token)
            } else {
                localStorage.setItem("token", response?.data?.token)
            }

            toast.success(response?.data?.message)

            let decoded;
            try {
                decoded = jwtDecode(response?.data?.token);
            } catch (error) {
                return toast.error("Invalid token")
            }

            navigate(decoded.role === 'admin' ? '/admindash' : '/userdash');
        } catch (error) {
            if (error.response) {
                if (error.response.data?.message) {
                    toast.error(error.response.data.message);
                } else {
                    toast.error(`Error: ${error.response.status}`);
                }
            } else if (error.request) {
                toast.error('No response from server. Please try again later.');
            } else {
                toast.error('Something went wrong!');
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            <BackgroundPattern />
            <Header onHelpClick={() => toast.info('Help is on the way!')} />

            <AuthCard
                title="Welcome back"
                subtitle="Enter your details to access your watchlist."
            >
                <div className="space-y-5">
                    {/* Email Input */}
                    <Input
                        type="text"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="name@example.com"
                        icon={Mail}
                        label="Email or Username"
                    />

                    {/* Password Input */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-gray-300 text-sm">Password</label>
                        </div>
                        <Input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            icon={Lock}
                            rightElement={
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            }
                        />
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between">
                        <Checkbox
                            id="rememberMe"
                            name="rememberMe"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            label="Remember me"
                        />

                        <button
                            type="button"
                            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                        >
                            Forgot password?
                        </button>
                    </div>

                    {/* Sign In Button */}
                    <Button onClick={handleSubmit}>
                        Sign In
                    </Button>

                    <Divider text="Or Continue with" />

                    {/* Social Login Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        <SocialButton
                            provider="Google"
                            onClick={() => toast.error("On Development Phase!!")}
                            icon={GoogleIcon}
                        />
                        <SocialButton
                            provider="Apple"
                            onClick={() => toast.error("On Development Phase!!")}
                            icon={AppleIcon}
                        />
                    </div>
                </div>

                {/* Sign Up Link */}
                <p className="text-center text-gray-400 text-sm mt-6">
                    Don't have an account?{' '}
                    <button
                        onClick={() => navigate('/signup')}
                        className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                    >
                        Sign Up
                    </button>
                </p>
            </AuthCard>

            <Footer />
        </div>
    );
}