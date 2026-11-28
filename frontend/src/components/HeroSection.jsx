import React, { useState } from 'react';
import { Button } from './ui/button';
import { Search, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Input } from './ui/input';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.12,
            delayChildren: 0.08,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

const POPULAR_TAGS = ['Full Stack', 'Frontend', 'React', 'AI Engineer', 'Remote', 'Product Designer'];

const HeroSection = () => {
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const searchJobHandler = (e) => {
        if (e) e.preventDefault();
        dispatch(setSearchedQuery(query));
        navigate('/browse');
    };

    const handleTagClick = (tag) => {
        setQuery(tag);
        dispatch(setSearchedQuery(tag));
        navigate('/browse');
    };

    return (
        <div className="relative overflow-hidden pt-20 pb-24 bg-gradient-to-b from-neu-base via-neu-base-light to-neu-base min-h-[85vh] text-charcoal px-6 flex flex-col items-center justify-center">
            {/* ── Multi-Layered Floating Animated Gradient Backgrounds ── */}
            <motion.div
                className="absolute top-10 left-[15%] w-96 h-96 bg-gradient-to-tr from-burnt-orange/20 to-amber-500/10 rounded-full blur-3xl pointer-events-none transform-gpu"
                animate={{
                    x: [0, 35, -25, 0],
                    y: [0, -40, 20, 0],
                    scale: [1, 1.12, 0.94, 1],
                }}
                transition={{
                    duration: 14,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut',
                }}
            />
            <motion.div
                className="absolute top-32 right-[18%] w-80 h-80 bg-gradient-to-bl from-lime-green/20 via-emerald-400/15 to-transparent rounded-full blur-3xl pointer-events-none transform-gpu"
                animate={{
                    x: [0, -30, 30, 0],
                    y: [0, 35, -30, 0],
                    scale: [1, 1.15, 0.9, 1],
                }}
                transition={{
                    duration: 16,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut',
                }}
            />
            <motion.div
                className="absolute -bottom-10 left-1/3 w-[30rem] h-[18rem] bg-gradient-to-r from-burnt-orange/10 via-electric/10 to-transparent rounded-full blur-3xl pointer-events-none transform-gpu"
                animate={{
                    x: [0, 20, -20, 0],
                    opacity: [0.4, 0.7, 0.4],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut',
                }}
            />

            {/* ── Staggered Content Container ── */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto w-full"
            >
                {/* Neumorphic Pill Badge */}
                <motion.div
                    variants={itemVariants}
                    whileHover={{ scale: 1.04, y: -2 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neu-base shadow-neu-flat border border-white/30 text-burnt-orange text-xs font-bold tracking-wide uppercase mb-6 cursor-default"
                >
                    <motion.div
                        animate={{ rotate: [0, 15, -15, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <Sparkles className="w-3.5 h-3.5 text-burnt-orange" />
                    </motion.div>
                    <span>Intelligent Career Platform &bull; Soft UI</span>
                </motion.div>

                {/* Staggered Heading */}
                <motion.h1
                    variants={itemVariants}
                    className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight text-charcoal max-w-4xl leading-[1.1]"
                >
                    Find Your Dream Job With{' '}
                    <span className="relative inline-block text-burnt-orange">
                        <span className="underline decoration-lime-green decoration-wavy decoration-2">HireHub</span>
                    </span>
                </motion.h1>

                {/* Staggered Subtitle */}
                <motion.p
                    variants={itemVariants}
                    className="text-lg sm:text-xl text-charcoal-muted mb-10 max-w-2xl mx-auto leading-relaxed font-normal"
                >
                    Connect with forward-thinking employers, track your applications in real-time, and supercharge your search with our intelligent AI Copilot.
                </motion.p>

                {/* Staggered CTA Buttons */}
                <motion.div
                    variants={itemVariants}
                    className="flex flex-wrap justify-center gap-4 mb-10"
                >
                    <Button
                        size="lg"
                        className="bg-gradient-to-br from-burnt-orange-dim to-burnt-orange hover:from-burnt-orange hover:to-burnt-orange-hover text-white font-semibold px-8 py-6 rounded-neu flex items-center text-base cursor-pointer shadow-neu-btn hover:shadow-glow-orange transition"
                        onClick={() => navigate('/jobs')}
                        whileHover={{ scale: 1.04, y: -2 }}
                        whileTap={{ scale: 0.96 }}
                    >
                        Explore Jobs
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        className="border-white/30 text-charcoal hover:text-burnt-orange bg-neu-base font-semibold px-8 py-6 rounded-neu text-base transition shadow-neu-btn hover:shadow-neu-raised-sm"
                        onClick={() => navigate('/ai/copilot')}
                        whileHover={{ scale: 1.04, y: -2 }}
                        whileTap={{ scale: 0.96 }}
                    >
                        Try AI Copilot 🤖
                    </Button>
                </motion.div>

                {/* Inset Neumorphic Search Bar with Smooth Interactive Focus Transitions */}
                <motion.form
                    variants={itemVariants}
                    onSubmit={searchJobHandler}
                    animate={{
                        scale: isFocused ? 1.015 : 1,
                        boxShadow: isFocused
                            ? '0 0 25px rgba(224, 90, 43, 0.22), inset 3px 3px 6px #cbced1, inset -3px -3px 6px #ffffff'
                            : undefined,
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="flex w-full sm:w-[85%] lg:w-[75%] shadow-neu-inset p-2 rounded-neu-lg items-center gap-2 bg-gradient-to-br from-neu-base-dark to-neu-base-light border border-white/20 transition-all"
                >
                    <div className="flex items-center pl-4 text-charcoal-dim flex-1">
                        <motion.div
                            animate={{ scale: isFocused ? 1.2 : 1, rotate: isFocused ? 90 : 0 }}
                            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                        >
                            <Search className="h-5 w-5 mr-3 text-burnt-orange shrink-0" />
                        </motion.div>
                        <Input
                            type="text"
                            value={query}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder="Search by job title, company, or skills..."
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full p-2 outline-none border-none bg-transparent text-charcoal placeholder:text-charcoal-dim/60 text-sm sm:text-base focus-visible:ring-0 shadow-none h-auto font-medium"
                        />
                    </div>

                    <Button
                        type="submit"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="rounded-xl bg-gradient-to-br from-burnt-orange-dim to-burnt-orange hover:from-burnt-orange hover:to-burnt-orange-hover text-white font-semibold px-7 py-3 flex items-center shadow-neu-btn hover:shadow-glow-orange shrink-0"
                    >
                        Search
                    </Button>
                </motion.form>

                {/* Popular Search Tags with Staggered Entrance & Hover Micro-Interactions */}
                <motion.div
                    variants={itemVariants}
                    className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-charcoal-muted"
                >
                    <span className="flex items-center gap-1 font-semibold text-charcoal-dim mr-1">
                        <TrendingUp className="w-3.5 h-3.5 text-burnt-orange" />
                        Trending:
                    </span>
                    {POPULAR_TAGS.map((tag) => (
                        <motion.button
                            key={tag}
                            type="button"
                            onClick={() => handleTagClick(tag)}
                            whileHover={{ scale: 1.08, y: -2 }}
                            whileTap={{ scale: 0.94 }}
                            className="px-3 py-1 rounded-full bg-neu-base border border-white/30 text-charcoal hover:text-burnt-orange shadow-neu-flat hover:shadow-neu-raised-xs transition font-medium cursor-pointer"
                        >
                            {tag}
                        </motion.button>
                    ))}
                </motion.div>
            </motion.div>
        </div>
    );
};

export default HeroSection;
