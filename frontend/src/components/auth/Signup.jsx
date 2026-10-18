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
import { Loader2, Upload } from 'lucide-react';
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
    <div className="bg-warm-ivory min-h-screen text-charcoal">
      <Navbar />
      <motion.div
        className="flex justify-center items-center min-h-[calc(100vh-4rem)] pt-20 px-4 pb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          className="w-full max-w-lg p-8 sm:p-10 bg-white border border-[--border-subtle] shadow-warm-lg rounded-2xl"
          initial={{ y: 25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-center mb-8">
            <h1 className="font-extrabold text-3xl text-deep-brown tracking-tight">
              Create an Account
            </h1>
            <p className="text-sm text-warm-charcoal mt-1.5">
              Join HireHub to unlock smart job tracking and AI career tools
            </p>
          </div>

          <form onSubmit={submitHandler} className="space-y-4">
            {/* Full Name */}
            <div>
              <Label htmlFor="fullname" className="block text-sm font-semibold text-dark-charcoal mb-1">
                Full Name <span className="text-burnt-orange">*</span>
              </Label>
              <Input
                id="fullname"
                type="text"
                name="fullname"
                placeholder="Alex Morgan"
                value={input.fullname}
                onChange={changeEventHandler}
                className="p-3 bg-warm-ivory/50 border border-[--border-subtle] rounded-xl text-charcoal placeholder:text-charcoal-dim focus:border-burnt-orange focus:ring-burnt-orange"
              />
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="block text-sm font-semibold text-dark-charcoal mb-1">
                Email Address <span className="text-burnt-orange">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="alex.morgan@example.com"
                value={input.email}
                onChange={changeEventHandler}
                className="p-3 bg-warm-ivory/50 border border-[--border-subtle] rounded-xl text-charcoal placeholder:text-charcoal-dim focus:border-burnt-orange focus:ring-burnt-orange"
              />
            </div>

            {/* Phone Number */}
            <div>
              <Label htmlFor="phoneNumber" className="block text-sm font-semibold text-dark-charcoal mb-1">
                Phone Number <span className="text-burnt-orange">*</span>
              </Label>
              <Input
                id="phoneNumber"
                type="tel"
                name="phoneNumber"
                placeholder="+1 (555) 000-0000"
                value={input.phoneNumber}
                onChange={changeEventHandler}
                className="p-3 bg-warm-ivory/50 border border-[--border-subtle] rounded-xl text-charcoal placeholder:text-charcoal-dim focus:border-burnt-orange focus:ring-burnt-orange"
              />
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password" className="block text-sm font-semibold text-dark-charcoal mb-1">
                Password <span className="text-burnt-orange">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="••••••••"
                value={input.password}
                onChange={changeEventHandler}
                className="p-3 bg-warm-ivory/50 border border-[--border-subtle] rounded-xl text-charcoal placeholder:text-charcoal-dim focus:border-burnt-orange focus:ring-burnt-orange"
              />
            </div>

            {/* Profile Picture */}
            <div>
              <Label htmlFor="profilePicture" className="block text-sm font-semibold text-dark-charcoal mb-1">
                Profile Avatar (Optional)
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  id="profilePicture"
                  type="file"
                  accept="image/*"
                  onChange={profilePictureHandler}
                  className="bg-warm-ivory/50 border border-[--border-subtle] text-charcoal file:text-charcoal file:bg-white file:border file:border-[--border-subtle] file:rounded-lg file:px-3 file:py-1 cursor-pointer text-xs"
                />
              </div>
            </div>

            {/* Role */}
            <div className="pt-2">
              <Label className="block text-sm font-semibold text-dark-charcoal mb-2">
                Register as: <span className="text-burnt-orange">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  htmlFor="student"
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition text-sm font-medium ${
                    input.role === 'student'
                      ? 'border-burnt-orange bg-burnt-orange-light text-burnt-orange font-bold'
                      : 'border-[--border-subtle] bg-white text-muted-brown hover:bg-warm-ivory/50'
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
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition text-sm font-medium ${
                    input.role === 'recruiter'
                      ? 'border-burnt-orange bg-burnt-orange-light text-burnt-orange font-bold'
                      : 'border-[--border-subtle] bg-white text-muted-brown hover:bg-warm-ivory/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="recruiter"
                    id="recruiter"
                    checked={input.role === 'recruiter'}
                    onChange={changeEventHandler}
                    className="accent-burnt-orange"
                  />
                  <span>Recruiter</span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              {loading ? (
                <Button disabled className="w-full py-3 bg-burnt-orange text-white rounded-xl shadow-sm">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="w-full py-3 bg-burnt-orange hover:bg-burnt-orange-hover text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-glow-orange"
                >
                  Sign Up
                </Button>
              )}
            </div>

            <p className="pt-2 text-center text-sm text-warm-charcoal">
              Already have an account?{' '}
              <Link to="/login" className="text-burnt-orange-link hover:text-deep-brown font-semibold hover:underline ml-1">
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
