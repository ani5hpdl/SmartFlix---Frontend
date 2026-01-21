import { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { createUserApi } from '../services/api';
import { useNavigate } from "react-router-dom";
import {
    Button,
    Input,
    Checkbox,
    Divider,
    SocialButton,
    PasswordStrength,
    Header,
    Footer,
    AuthCard,
    BackgroundPattern,
    GoogleIcon,
    AppleIcon
} from '../components/Elements';

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

        if (formData.password.length < 6) {
            toast.error('Password Must be at least 6 characters');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error('Password and Confirm Password do not match!');
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

        try {
            const response = await createUserApi(dataToSubmit);
            if (response.data.success) {
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
            if (error.response) {
                if (error.response.status === 409) {
                    toast.error('User with this email already exists!');
                } else if (error.response.data?.message) {
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
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            <BackgroundPattern />
            <Header onHelpClick={() => toast.info('Help is on the way!')} />

            <AuthCard
                title="Start Your Watchlist"
                subtitle="Get personalized movie recommendations today."
            >
                <div className="space-y-5">
                    {/* Full Name & Email Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Full Name"
                            icon={User}
                            label="Full Name"
                        />

                        <Input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Email Address"
                            icon={Mail}
                            label="Email Address"
                        />
                    </div>

                    {/* Password & Confirm Password Row */}
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Password"
                                icon={Lock}
                                label="Password"
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

                            <Input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm Password"
                                icon={Lock}
                                label="Confirm Password"
                            />
                        </div>

                        <PasswordStrength password={formData.password} />
                    </div>

                    {/* Terms Checkbox */}
                    <Checkbox
                        id="terms"
                        name="agreeToTerms"
                        checked={agreeToTerms}
                        onChange={(e) => setAgreeToTerms(e.target.checked)}
                        label={
                            <>
                                I agree to the{' '}
                                <button className="text-purple-400 hover:text-purple-300 transition-colors">
                                    Terms of Service
                                </button>
                                {' '}and{' '}
                                <button className="text-purple-400 hover:text-purple-300 transition-colors">
                                    Privacy Policy
                                </button>
                                .
                            </>
                        }
                    />

                    {/* Create Account Button */}
                    <Button
                        onClick={handleSubmit}
                        disabled={!agreeToTerms}
                    >
                        Create Account
                    </Button>

                    <Divider text="or continue with" />

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

                {/* Sign In Link */}
                <p className="text-center text-gray-400 text-sm mt-6">
                    Already a member?{' '}
                    <button
                        className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                        onClick={() => navigate('/login')}
                    >
                        Sign In
                    </button>
                </p>
            </AuthCard>

            <Footer />
        </div>
    );
}