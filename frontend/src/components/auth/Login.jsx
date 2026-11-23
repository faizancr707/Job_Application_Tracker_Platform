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
import { setLoading, setUser } from '@/redux/authSlice';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const [input, setInput] = useState({
    email: '',
    password: '',
    role: '',
  });

  const { loading, user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!input.email || !input.password || !input.role) {
      return toast.error('All fields are required.');
    }

    try {
      dispatch(setLoading(true));
      axios.defaults.withCredentials = true;

      const res = await axios.post(
        `${USER_API_END_POINT}/login`,
        {
          ...input,
          role: input.role.trim().toLowerCase(),
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        dispatch(setUser(res.data.user));
        toast.success(res.data.message);
        navigate('/');
      }
    } catch (error) {
      const msg = error?.response?.data?.message || 'Login failed';
      toast.error(msg);
      console.error('❌ Login Error:', msg);
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  return (
    <div className="bg-neu-base min-h-screen text-charcoal">
      <Navbar />
      <motion.div
        className="flex justify-center items-center min-h-[calc(100vh-4rem)] pt-20 px-4 pb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          className="w-full max-w-md p-8 sm:p-10 bg-neu-base border border-white/30 shadow-neu-raised-lg rounded-neu-lg"
          initial={{ y: 25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-center mb-8">
            <h1 className="font-extrabold text-3xl text-charcoal tracking-tight">
              Welcome Back
            </h1>
            <p className="text-sm text-charcoal-muted mt-1.5">
              Sign in to manage applications and access your AI Career Copilot
            </p>
          </div>

          <form onSubmit={submitHandler} className="space-y-5">
            {/* Email */}
            <div>
              <Label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-2">
                Email Address <span className="text-burnt-orange">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@domain.com"
                className="bg-gradient-to-br from-neu-base-dark to-neu-base-light shadow-neu-inset-sm border border-white/10 w-full"
                value={input.email}
                onChange={changeEventHandler}
              />
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-2">
                Password <span className="text-burnt-orange">*</span>
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                className="bg-gradient-to-br from-neu-base-dark to-neu-base-light shadow-neu-inset-sm border border-white/10 w-full"
                value={input.password}
                onChange={changeEventHandler}
              />
            </div>

            {/* Role Selection */}
            <div>
              <Label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-2.5">
                Signing in as: <span className="text-burnt-orange">*</span>
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
                    className="accent-burnt-orange"
                    checked={input.role === 'student'}
                    onChange={changeEventHandler}
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
                    className="accent-burnt-orange"
                    checked={input.role === 'recruiter'}
                    onChange={changeEventHandler}
                  />
                  <span>Recruiter</span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            {loading ? (
              <Button disabled className="w-full py-3.5 bg-gradient-to-br from-burnt-orange-dim to-burnt-orange text-white font-bold rounded-neu shadow-neu-btn">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </Button>
            ) : (
              <Button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-br from-burnt-orange-dim to-burnt-orange hover:from-burnt-orange hover:to-burnt-orange-hover text-white font-bold rounded-neu shadow-neu-btn hover:shadow-glow-orange"
              >
                Sign In
              </Button>
            )}

            {/* Link to Signup */}
            <p className="pt-2 text-center text-sm text-charcoal-muted">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-burnt-orange hover:text-burnt-orange-hover font-bold hover:underline ml-1"
              >
                Create one here
              </Link>
            </p>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
