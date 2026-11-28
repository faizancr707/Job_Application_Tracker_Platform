import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Avatar, AvatarImage } from '../ui/avatar';
import { Menu, LogOut, User2, X, Sparkles, ChevronDown, LayoutGrid } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { USER_API_END_POINT } from '@/utils/constant';
import { toast } from 'sonner';

const Navbar = () => {
    const { user } = useSelector((store) => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const logoutHandler = async () => {
        try {
            const res = await axios.get(`${USER_API_END_POINT}/logout`, { withCredentials: true });
            if (res.data.success) {
                dispatch({ type: 'LOGOUT' });
                navigate('/');
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'An error occurred');
        }
    };

    return (
        <motion.nav
            initial={{ y: -24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 left-0 right-0 z-50 bg-neu-base/95 backdrop-blur-xl border-b border-white/25 shadow-neu-flat transition-all"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Brand Logo with Soft Embossed Badge */}
                    <motion.div
                        className="text-2xl font-extrabold text-charcoal cursor-pointer flex items-center tracking-tight gap-1 select-none"
                        onClick={() => navigate('/')}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                        <span className="px-2.5 py-0.5 rounded-xl bg-neu-base shadow-neu-flat border border-white/30 text-charcoal">
                            Hire<span className="text-burnt-orange font-black">Hub</span>
                        </span>
                    </motion.div>

                    {/* Mobile Menu Toggle */}
                    <div className="md:hidden flex items-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleMenu}
                            className="text-charcoal hover:text-burnt-orange rounded-xl shadow-neu-flat hover:shadow-neu-raised-xs border border-white/20"
                        >
                            {menuOpen ? (
                                <X className="h-5 w-5" />
                            ) : (
                                <Menu className="h-5 w-5" />
                            )}
                        </Button>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex flex-1 justify-end items-center gap-5">
                        {user ? (
                            <>
                                <ul className="flex font-sans items-center space-x-5 text-charcoal-muted">
                                    {user && user.role === 'recruiter' ? (
                                        <>
                                            <Link to='/admin/companies'>
                                                <motion.li whileHover={{ y: -2 }} className='cursor-pointer px-3.5 py-1.5 rounded-xl text-charcoal hover:text-burnt-orange font-semibold transition hover:shadow-neu-flat'>
                                                    Companies
                                                </motion.li>
                                            </Link>
                                            <Link to='/admin/jobs'>
                                                <motion.li whileHover={{ y: -2 }} className='cursor-pointer px-3.5 py-1.5 rounded-xl text-charcoal hover:text-burnt-orange font-semibold transition hover:shadow-neu-flat'>
                                                    Jobs
                                                </motion.li>
                                            </Link>
                                        </>
                                    ) : (
                                        <>
                                            <Link to='/'>
                                                <motion.li whileHover={{ y: -2 }} className='cursor-pointer px-3 py-1.5 rounded-xl text-charcoal hover:text-burnt-orange font-semibold transition hover:shadow-neu-flat'>
                                                    Home
                                                </motion.li>
                                            </Link>
                                            <Link to='/jobs'>
                                                <motion.li whileHover={{ y: -2 }} className='cursor-pointer px-3 py-1.5 rounded-xl text-charcoal hover:text-burnt-orange font-semibold transition hover:shadow-neu-flat'>
                                                    Jobs
                                                </motion.li>
                                            </Link>
                                            <Link to='/browse'>
                                                <motion.li whileHover={{ y: -2 }} className='cursor-pointer px-3 py-1.5 rounded-xl text-charcoal hover:text-burnt-orange font-semibold transition hover:shadow-neu-flat'>
                                                    Browse
                                                </motion.li>
                                            </Link>
                                            <Link to='/tracker'>
                                                <motion.li whileHover={{ y: -2 }} className='cursor-pointer px-3 py-1.5 rounded-xl text-charcoal hover:text-emerald-700 font-semibold transition hover:shadow-neu-flat flex items-center gap-1.5'>
                                                    <LayoutGrid className="w-3.5 h-3.5 text-emerald-700" />
                                                    Tracker
                                                </motion.li>
                                            </Link>
                                            <Link to='/ai/copilot'>
                                                <motion.li
                                                    whileHover={{ scale: 1.04, y: -2 }}
                                                    whileTap={{ scale: 0.96 }}
                                                    className='cursor-pointer text-burnt-orange font-bold flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-neu-base shadow-neu-flat border border-burnt-orange/20 hover:shadow-neu-raised-xs transition'
                                                >
                                                    <Sparkles className="w-3.5 h-3.5 text-burnt-orange animate-pulse" />
                                                    Copilot
                                                </motion.li>
                                            </Link>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <li className='cursor-pointer text-charcoal hover:text-burnt-orange font-semibold list-none flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:shadow-neu-flat transition'>
                                                        AI Tools <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                                                    </li>
                                                </PopoverTrigger>
                                                <PopoverContent className="p-2.5 bg-neu-base border border-white/25 shadow-neu-raised-md rounded-neu w-52 space-y-1">
                                                    <Link to="/ai/search" className="block px-3 py-2 text-sm text-charcoal hover:text-burnt-orange hover:bg-neu-base-dark/50 rounded-xl transition font-medium hover:shadow-neu-flat">
                                                        🔍 AI Search
                                                    </Link>
                                                    <Link to="/ai/resumes" className="block px-3 py-2 text-sm text-charcoal hover:text-burnt-orange hover:bg-neu-base-dark/50 rounded-xl transition font-medium hover:shadow-neu-flat">
                                                        📄 Resume Analysis
                                                    </Link>
                                                    <Link to="/ai/skill-gap" className="block px-3 py-2 text-sm text-charcoal hover:text-burnt-orange hover:bg-neu-base-dark/50 rounded-xl transition font-medium hover:shadow-neu-flat">
                                                        📊 Skill Gap
                                                    </Link>
                                                    <Link to="/ai/interviews" className="block px-3 py-2 text-sm text-charcoal hover:text-burnt-orange hover:bg-neu-base-dark/50 rounded-xl transition font-medium hover:shadow-neu-flat">
                                                        🎯 Interview Prep
                                                    </Link>
                                                    <Link to="/ai/dashboard" className="block px-3 py-2 text-sm text-charcoal hover:text-burnt-orange hover:bg-neu-base-dark/50 rounded-xl transition font-medium hover:shadow-neu-flat">
                                                        📈 AI Dashboard
                                                    </Link>
                                                </PopoverContent>
                                            </Popover>
                                        </>
                                    )}
                                </ul>

                                <Popover>
                                    <PopoverTrigger asChild>
                                        <motion.div
                                            whileHover={{ scale: 1.08 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="cursor-pointer"
                                        >
                                            <Avatar className="w-10 h-10 rounded-full overflow-hidden shadow-neu-raised-xs border-2 border-white/40 hover:shadow-neu-raised transition">
                                                <AvatarImage
                                                    src={user?.profile?.profilePhoto ? user?.profile?.profilePhoto : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSq8T0hZUoX8kuRi3EZpZbUDtZ_WqqN9Ll15Q&s'}
                                                    alt="User Avatar"
                                                    className="object-cover w-full h-full"
                                                />
                                            </Avatar>
                                        </motion.div>
                                    </PopoverTrigger>
                                    <PopoverContent className="p-4 bg-neu-base border border-white/25 shadow-neu-raised-lg rounded-neu w-80">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-12 h-12 rounded-full overflow-hidden shadow-neu-raised-xs border border-white/30">
                                                <AvatarImage
                                                    src={user?.profile?.profilePhoto}
                                                    alt="User Avatar"
                                                    className="object-cover w-full h-full"
                                                />
                                            </Avatar>
                                            <div>
                                                <h1 className="font-bold text-charcoal text-base">{user?.fullname}</h1>
                                                <p className="text-xs text-charcoal-dim line-clamp-1">{user?.profile?.bio || 'Professional'}</p>
                                                <span className="inline-block mt-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-neu-base shadow-neu-flat text-deep-green border border-white/20">
                                                    {user?.role === 'recruiter' ? 'Recruiter' : 'Candidate'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-4 pt-3 border-t border-white/20 flex justify-between items-center gap-2">
                                            {user && user.role === 'student' && (
                                                <Link to="/profile">
                                                    <Button variant="outline" size="sm" className="flex items-center gap-1.5 text-burnt-orange shadow-neu-btn hover:shadow-neu-raised-xs">
                                                        <User2 className="w-4 h-4" />
                                                        Profile
                                                    </Button>
                                                </Link>
                                            )}
                                            <Button
                                                onClick={logoutHandler}
                                                variant="outline"
                                                size="sm"
                                                className="flex items-center gap-1.5 text-terracotta hover:text-red-700 shadow-neu-btn hover:shadow-neu-raised-xs"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Logout
                                            </Button>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </>
                        ) : (
                            <>
                                <ul className="flex font-sans items-center space-x-5 text-charcoal-muted">
                                    <Link to="/">
                                        <motion.li whileHover={{ y: -2 }} className="cursor-pointer px-3 py-1.5 rounded-xl text-charcoal hover:text-burnt-orange font-semibold transition hover:shadow-neu-flat">
                                            Home
                                        </motion.li>
                                    </Link>
                                    <Link to="/jobs">
                                        <motion.li whileHover={{ y: -2 }} className="cursor-pointer px-3 py-1.5 rounded-xl text-charcoal hover:text-burnt-orange font-semibold transition hover:shadow-neu-flat">
                                            Jobs
                                        </motion.li>
                                    </Link>
                                    <Link to="/browse">
                                        <motion.li whileHover={{ y: -2 }} className="cursor-pointer px-3 py-1.5 rounded-xl text-charcoal hover:text-burnt-orange font-semibold transition hover:shadow-neu-flat">
                                            Browse
                                        </motion.li>
                                    </Link>
                                </ul>
                                <Link to="/login">
                                    <Button variant="outline" className="border-white/25 text-burnt-orange font-semibold shadow-neu-btn hover:shadow-neu-raised-xs">
                                        Login
                                    </Button>
                                </Link>
                                <Link to="/signup">
                                    <Button className="bg-gradient-to-br from-burnt-orange-dim to-burnt-orange text-white font-semibold shadow-neu-btn hover:shadow-glow-orange">
                                        Signup
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Menu with Smooth Animated Drawer */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden absolute top-16 left-0 right-0 bg-neu-base border-b border-white/25 shadow-neu-raised-lg p-5 md:hidden z-50"
                    >
                        <ul className="space-y-3 text-charcoal font-medium">
                            <li className="cursor-pointer hover:text-burnt-orange">
                                <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
                            </li>
                            <li className="cursor-pointer hover:text-burnt-orange">
                                <Link to="/jobs" onClick={() => setMenuOpen(false)}>Jobs</Link>
                            </li>
                            <li className="cursor-pointer hover:text-burnt-orange">
                                <Link to="/browse" onClick={() => setMenuOpen(false)}>Browse</Link>
                            </li>
                            <li className="cursor-pointer hover:text-emerald-700 font-bold">
                                <Link to="/tracker" onClick={() => setMenuOpen(false)}>📊 Application Tracker</Link>
                            </li>
                            <li className="cursor-pointer text-burnt-orange font-bold">
                                <Link to="/ai/copilot" onClick={() => setMenuOpen(false)}>🤖 Copilot</Link>
                            </li>
                            {!user && (
                                <div className="flex flex-col gap-2.5 pt-3 border-t border-white/20">
                                    <Link to="/login" onClick={() => setMenuOpen(false)}>
                                        <Button variant="outline" className="w-full text-burnt-orange shadow-neu-btn">
                                            Login
                                        </Button>
                                    </Link>
                                    <Link to="/signup" onClick={() => setMenuOpen(false)}>
                                        <Button className="w-full bg-gradient-to-br from-burnt-orange-dim to-burnt-orange text-white shadow-neu-btn">
                                            Signup
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default Navbar;
