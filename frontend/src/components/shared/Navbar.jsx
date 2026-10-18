import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Avatar, AvatarImage } from '../ui/avatar';
import { Menu, LogOut, User2, X, Sparkles } from 'lucide-react';
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
        <nav className="fixed top-0 left-0 right-0 z-50 bg-warm-ivory/90 backdrop-blur-xl border-b border-[--border-subtle] shadow-warm-sm transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Brand Logo */}
                    <div
                        className="text-2xl font-extrabold text-charcoal cursor-pointer flex items-center tracking-tight"
                        onClick={() => navigate('/')}
                    >
                        Hire<span className="text-burnt-orange">Hub</span>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="md:hidden flex items-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleMenu}
                            className="text-charcoal hover:text-burnt-orange hover:bg-warm-ivory-dark"
                        >
                            {menuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </Button>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex flex-1 justify-end items-center gap-5">
                        {user ? (
                            <>
                                <ul className="flex font-sans items-center space-x-6 text-charcoal-muted">
                                    {user && user.role === 'recruiter' ? (
                                        <>
                                            <Link to='/admin/companies'>
                                                <li className='cursor-pointer text-charcoal hover:text-burnt-orange font-semibold transition'>Companies</li>
                                            </Link>
                                            <Link to='/admin/jobs'>
                                                <li className='cursor-pointer text-charcoal hover:text-burnt-orange font-semibold transition'>Jobs</li>
                                            </Link>
                                        </>
                                    ) : (
                                        <>
                                            <Link to='/'>
                                                <li className='cursor-pointer text-charcoal hover:text-burnt-orange font-semibold transition'>Home</li>
                                            </Link>
                                            <Link to='/jobs'>
                                                <li className='cursor-pointer text-charcoal hover:text-burnt-orange font-semibold transition'>Jobs</li>
                                            </Link>
                                            <Link to='/browse'>
                                                <li className='cursor-pointer text-charcoal hover:text-burnt-orange font-semibold transition'>Browse</li>
                                            </Link>
                                            <Link to='/ai/copilot'>
                                                <li className='cursor-pointer text-burnt-orange font-bold flex items-center gap-1.5 px-3 py-1 rounded-full bg-burnt-orange-light border border-burnt-orange/20 hover:border-burnt-orange/40 transition'>
                                                    <Sparkles className="w-3.5 h-3.5 text-burnt-orange" />
                                                    Copilot
                                                </li>
                                            </Link>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <li className='cursor-pointer text-charcoal hover:text-burnt-orange font-semibold list-none flex items-center gap-1'>
                                                        AI Tools <span className="text-xs">▾</span>
                                                    </li>
                                                </PopoverTrigger>
                                                <PopoverContent className="p-2 bg-white border border-[--border-subtle] shadow-warm-lg rounded-xl w-52">
                                                    <div className="space-y-1">
                                                        <Link to="/ai/search" className="block px-3 py-2 text-sm text-charcoal hover:text-burnt-orange hover:bg-warm-ivory-dark rounded-md transition font-medium">🔍 AI Search</Link>
                                                        <Link to="/ai/resumes" className="block px-3 py-2 text-sm text-charcoal hover:text-burnt-orange hover:bg-warm-ivory-dark rounded-md transition font-medium">📄 Resume Analysis</Link>
                                                        <Link to="/ai/skill-gap" className="block px-3 py-2 text-sm text-charcoal hover:text-burnt-orange hover:bg-warm-ivory-dark rounded-md transition font-medium">📊 Skill Gap</Link>
                                                        <Link to="/ai/interviews" className="block px-3 py-2 text-sm text-charcoal hover:text-burnt-orange hover:bg-warm-ivory-dark rounded-md transition font-medium">🎯 Interview Prep</Link>
                                                        <Link to="/ai/dashboard" className="block px-3 py-2 text-sm text-charcoal hover:text-burnt-orange hover:bg-warm-ivory-dark rounded-md transition font-medium">📈 AI Dashboard</Link>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </>
                                    )}
                                </ul>

                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Avatar className="w-9 h-9 rounded-full overflow-hidden cursor-pointer border-2 border-burnt-orange/30 hover:border-burnt-orange transition">
                                            <AvatarImage
                                                src={user?.profile?.profilePhoto ? user?.profile?.profilePhoto : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSq8T0hZUoX8kuRi3EZpZbUDtZ_WqqN9Ll15Q&s'}
                                                alt="User Avatar"
                                                className="object-cover w-full h-full"
                                            />
                                        </Avatar>
                                    </PopoverTrigger>
                                    <PopoverContent className="p-4 bg-white border border-[--border-subtle] shadow-warm-lg rounded-xl w-80">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-12 h-12 rounded-full overflow-hidden border border-[--border-subtle]">
                                                <AvatarImage
                                                    src={user?.profile?.profilePhoto}
                                                    alt="User Avatar"
                                                    className="object-cover w-full h-full"
                                                />
                                            </Avatar>
                                            <div>
                                                <h1 className="font-bold text-deep-brown">{user?.fullname}</h1>
                                                <p className="text-xs text-muted-brown line-clamp-1">{user?.profile?.bio || 'Professional'}</p>
                                                <span className="inline-block mt-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-lime-green-light text-deep-green border border-lime-green/30">
                                                    {user?.role === 'recruiter' ? 'Recruiter' : 'Candidate'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-4 pt-3 border-t border-[--border-subtle] flex justify-between items-center gap-2">
                                            {user && user.role === 'student' && (
                                                <Link to="/profile">
                                                    <Button variant="ghost" size="sm" className="flex items-center gap-1.5 text-burnt-orange hover:bg-burnt-orange-light">
                                                        <User2 className="w-4 h-4" />
                                                        View Profile
                                                    </Button>
                                                </Link>
                                            )}
                                            <Button
                                                onClick={logoutHandler}
                                                variant="ghost"
                                                size="sm"
                                                className="flex items-center gap-1.5 text-terracotta hover:bg-red-50 hover:text-red-700"
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
                                <ul className="flex font-sans items-center space-x-6 text-charcoal-muted">
                                    <Link to="/">
                                        <li className="cursor-pointer text-charcoal hover:text-burnt-orange font-semibold transition">Home</li>
                                    </Link>
                                    <Link to="/jobs">
                                        <li className="cursor-pointer text-charcoal hover:text-burnt-orange font-semibold transition">Jobs</li>
                                    </Link>
                                    <Link to="/browse">
                                        <li className="cursor-pointer text-charcoal hover:text-burnt-orange font-semibold transition">Browse</li>
                                    </Link>
                                </ul>
                                <Link to="/login">
                                    <Button variant="outline" className="border-burnt-orange text-burnt-orange hover:bg-burnt-orange hover:text-white font-semibold">
                                        Login
                                    </Button>
                                </Link>
                                <Link to="/signup">
                                    <Button className="bg-burnt-orange hover:bg-burnt-orange-hover text-white font-semibold shadow-sm hover:shadow-glow-orange">
                                        Signup
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="absolute top-16 left-0 right-0 bg-warm-ivory border-b border-[--border-subtle] shadow-warm-lg p-5 md:hidden z-50">
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
                        <li className="cursor-pointer text-burnt-orange font-bold">
                            <Link to="/ai/copilot" onClick={() => setMenuOpen(false)}>🤖 Copilot</Link>
                        </li>
                        {!user && (
                            <div className="flex flex-col gap-2.5 pt-3 border-t border-[--border-subtle]">
                                <Link to="/login" onClick={() => setMenuOpen(false)}>
                                    <Button variant="outline" className="w-full border-burnt-orange text-burnt-orange hover:bg-burnt-orange hover:text-white">
                                        Login
                                    </Button>
                                </Link>
                                <Link to="/signup" onClick={() => setMenuOpen(false)}>
                                    <Button className="w-full bg-burnt-orange hover:bg-burnt-orange-hover text-white">
                                        Signup
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </ul>
                </div>
            )}
        </nav>
    );
};

export default Navbar;