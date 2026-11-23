import React, { useEffect, useState } from 'react';
import Navbar from '../shared/Navbar';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { USER_API_END_POINT } from '@/utils/constant';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading } from '@/redux/authSlice';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Signup = () => {
  const [input, setInput] = useState({
    fullname: '',
    email: '',
    phoneNumber: '',
    password: '',
    role: '',
  });

  const [profilePicture, setProfilePicture] = useState(null);

  const { loading, user } = useSelector((store) => store.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const profilePictureHandler = (e) => {
    setProfilePicture(e.target.files[0]);
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!input.fullname || !input.email || !input.phoneNumber || !input.password || !input.role) {
      return toast.error("All fields are required.");
    }

    try {
      dispatch(setLoading(true));
      const formData = new FormData();

      Object.keys(input).forEach((key) => {
        formData.append(key, input[key]);
      });

      if (profilePicture) {
        formData.append('file', profilePicture);
      }

      const res = await axios.post(`${USER_API_END_POINT}/signup`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      if (res.data.success) {
        toast.success(res.data.message);
        navigate('/login');
      }
    } catch (error) {
      console.error('Signup Error:', error);
      toast.error(error?.response?.data?.message || "Server Error");
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="bg-neu-base min-h-screen text-charcoal">
      <Navbar />
      <motion.div
        className="flex justify-center items-center min-h-[calc(100vh-4rem)] pt-20 px-4 pb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          className="w-full max-w-lg p-8 sm:p-10 bg-neu-base border border-white/30 shadow-neu-raised-lg rounded-neu-lg"
          initial={{ y: 25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-center mb-8">
            <h1 className="font-extrabold text-3xl text-charcoal tracking-tight">
              Create an Account
            </h1>
            <p className="text-sm text-charcoal-muted mt-1.5">
              Join HireHub to unlock smart job tracking and AI career tools
            </p>
          </div>

          <form onSubmit={submitHandler} className="space-y-4">
            {/* Full Name */}
            <div>
              <Label htmlFor="fullname" className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                Full Name <span className="text-burnt-orange">*</span>
              </Label>
              <Input
                id="fullname"
                type="text"
                name="fullname"
                placeholder="Alex Morgan"
                value={input.fullname}
                onChange={changeEventHandler}
                className="bg-gradient-to-br from-neu-base-dark to-neu-base-light shadow-neu-inset-sm border border-white/10"
              />
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                Email Address <span className="text-burnt-orange">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="alex.morgan@example.com"
                value={input.email}
                onChange={changeEventHandler}
                className="bg-gradient-to-br from-neu-base-dark to-neu-base-light shadow-neu-inset-sm border border-white/10"
              />
            </div>

            {/* Phone Number */}
            <div>
              <Label htmlFor="phoneNumber" className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                Phone Number <span className="text-burnt-orange">*</span>
              </Label>
              <Input
                id="phoneNumber"
                type="tel"
                name="phoneNumber"
                placeholder="+1 (555) 000-0000"
                value={input.phoneNumber}
                onChange={changeEventHandler}
                className="bg-gradient-to-br from-neu-base-dark to-neu-base-light shadow-neu-inset-sm border border-white/10"
              />
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                Password <span className="text-burnt-orange">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="••••••••"
                value={input.password}
                onChange={changeEventHandler}
                className="bg-gradient-to-br from-neu-base-dark to-neu-base-light shadow-neu-inset-sm border border-white/10"
              />
            </div>

            {/* Profile Picture */}
            <div>
              <Label htmlFor="profilePicture" className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                Profile Avatar (Optional)
              </Label>
              <Input
                id="profilePicture"
                type="file"
                accept="image/*"
                onChange={profilePictureHandler}
                className="bg-gradient-to-br from-neu-base-dark to-neu-base-light shadow-neu-inset-sm border border-white/10 cursor-pointer text-xs"
              />
            </div>

            {/* Role */}
            <div className="pt-2">
              <Label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-2.5">
                Register as: <span className="text-burnt-orange">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  htmlFor="student"
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition text-sm font-semibold select-none ${
                    input.role === 'student'
                      ? 'border-burnt-orange/30 bg-neu-base shadow-neu-inset-xs text-burnt-orange'
                      : 'border-white/20 bg-neu-base shadow-neu-flat text-charcoal-muted hover:text-charcoal'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    id="student"
                    checked={input.role === 'student'}
                    onChange={changeEventHandler}
                    className="accent-burnt-orange"
                  />
                  <span>Job Seeker</span>
                </label>

                <label
                  htmlFor="recruiter"
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition text-sm font-semibold select-none ${
                    input.role === 'recruiter'
                      ? 'border-burnt-orange/30 bg-neu-base shadow-neu-inset-xs text-burnt-orange'
                      : 'border-white/20 bg-neu-base shadow-neu-flat text-charcoal-muted hover:text-charcoal'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="recruiter"
                    id="recruiter"
                    checked={input.role === 'recruiter'}
                    onChange={changeEventHandler}
                  />
                  <span>Recruiter</span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              {loading ? (
                <Button disabled className="w-full py-3.5 bg-gradient-to-br from-burnt-orange-dim to-burnt-orange text-white font-bold rounded-neu shadow-neu-btn">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-br from-burnt-orange-dim to-burnt-orange hover:from-burnt-orange hover:to-burnt-orange-hover text-white font-bold rounded-neu shadow-neu-btn hover:shadow-glow-orange"
                >
                  Sign Up
                </Button>
              )}
            </div>

            <p className="pt-2 text-center text-sm text-charcoal-muted">
              Already have an account?{' '}
              <Link to="/login" className="text-burnt-orange hover:text-burnt-orange-hover font-bold hover:underline ml-1">
                Sign In
              </Link>
            </p>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Signup;
