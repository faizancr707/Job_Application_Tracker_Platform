import React, { useState } from 'react';
import { Button } from './ui/button';
import { Search, ArrowRight, Sparkles } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Input } from './ui/input';

const HeroSection = () => {
    const [query, setQuery] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const searchJobHandler = (e) => {
        e.preventDefault();
        dispatch(setSearchedQuery(query));
        navigate('/browse');
    };

    return (
        <div className="relative overflow-hidden pt-20 pb-24 bg-gradient-to-b from-warm-ivory via-warm-ivory-light to-warm-ivory min-h-[85vh] text-charcoal px-6 flex flex-col items-center justify-center">
            {/* Subtle warm ambient glow blobs */}
            <div className="absolute top-12 left-1/4 w-96 h-96 bg-burnt-orange/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
            <div className="absolute top-24 right-1/4 w-80 h-80 bg-lime-green/15 rounded-full blur-3xl pointer-events-none"></div>

            {/* Pill Badge */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-burnt-orange-light border border-burnt-orange/30 text-burnt-orange text-xs font-bold tracking-wide uppercase mb-6 shadow-sm"
            >
                <Sparkles className="w-3.5 h-3.5 text-burnt-orange" />
                <span>Next-Gen Intelligent Job Tracking</span>
            </motion.div>

            <motion.h1
                className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 text-center tracking-tight text-deep-brown max-w-4xl"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
            >
                Find Your Dream Job With{' '}
                <span className="text-burnt-orange underline decoration-lime-green decoration-wavy decoration-2">
                    HireHub
                </span>
            </motion.h1>

            <motion.p
                className="text-lg sm:text-xl text-warm-charcoal mb-10 max-w-2xl mx-auto leading-relaxed text-center font-normal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
            >
                Connect with forward-thinking employers, track your applications in real-time, and supercharge your search with our intelligent AI Copilot.
            </motion.p>

            <div className="flex justify-center gap-4 mb-10">
                <Button
                    size="lg"
                    className="bg-burnt-orange hover:bg-burnt-orange-hover text-white font-semibold px-8 py-6 rounded-full flex items-center text-base cursor-pointer shadow-warm-md hover:shadow-glow-orange transition"
                    onClick={() => navigate('/jobs')}
                >
                    Explore Jobs
                    <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                    size="lg"
                    variant="outline"
                    className="border-burnt-orange/40 text-charcoal hover:text-burnt-orange bg-white font-semibold px-8 py-6 rounded-full text-base transition shadow-warm-sm"
                    onClick={() => navigate('/ai/copilot')}
                >
                    Try AI Copilot 🤖
                </Button>
            </div>

            <motion.form
                onSubmit={searchJobHandler}
                className="flex w-full sm:w-[75%] lg:w-[55%] shadow-warm-lg border border-[--border-subtle] p-2 rounded-full items-center gap-2 bg-white"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
            >
                <div className="flex items-center pl-4 text-charcoal-dim flex-1">
                    <Search className="h-5 w-5 mr-3 text-burnt-orange" />
                    <Input
                        type="text"
                        value={query}
                        placeholder="Search by job title, company, or skills..."
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full p-2 outline-none border-none bg-transparent text-charcoal placeholder:text-charcoal-dim text-sm sm:text-base focus-visible:ring-0"
                    />
                </div>

                <Button
                    type="submit"
                    className="rounded-full bg-burnt-orange hover:bg-burnt-orange-hover text-white font-semibold px-7 py-3 flex items-center shadow-sm"
                >
                    Search
                </Button>
            </motion.form>
        </div>
    );
};

export default HeroSection;