import React, { useEffect, useState } from 'react';
import Navbar from './shared/Navbar';
import FilterCard from './FilterCard';
import Job from './Job';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import useGetAllJobs from '@/hooks/useGetAllJobs';
import Footer from './shared/Footer';

const Jobs = () => {
    useGetAllJobs();
    const { allJobs, searchedQuery } = useSelector(store => store.job);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        if (searchedQuery) {
            const queryWords = searchedQuery.toLowerCase().split(" ");
            const filtered = allJobs.filter(job => {
                const searchFields = [
                    job.title,
                    job.description,
                    job.requirements?.join(" "),
                    job.location
                ];
                return queryWords.some(word =>
                    searchFields.some(field => field?.toLowerCase().includes(word))
                );
            });
            setFilteredJobs(filtered);
        } else {
            setFilteredJobs(allJobs);
        }
    }, [allJobs, searchedQuery]);

    return (
        <div className="bg-neu-base min-h-screen text-charcoal">
            <Navbar />
            <div className="max-w-7xl mx-auto pt-20 min-h-[calc(100vh-5rem)]">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 px-4 sm:px-6 py-8">
                    <div className="lg:hidden w-full">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="w-full bg-gradient-to-br from-burnt-orange-dim to-burnt-orange hover:from-burnt-orange hover:to-burnt-orange-hover text-white py-3 px-4 rounded-neu mb-4 font-bold shadow-neu-btn active:shadow-neu-btn-active"
                        >
                            {showFilters ? 'Hide Filters' : 'Filter Openings'}
                        </button>
                    </div>

                    {/* Filter Sidebar */}
                    <div className={`lg:block ${showFilters ? 'block' : 'hidden'} lg:col-span-1`}>
                        <FilterCard />
                    </div>

                    {/* Main Job List Section */}
                    <div className="lg:col-span-3">
                        <motion.div
                            className="grid grid-cols-1 gap-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.4 }}
                        >
                            {filteredJobs.length > 0 ? (
                                filteredJobs.map((job) => (
                                    <motion.div
                                        key={job?.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Job job={job} />
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center py-16 bg-neu-base rounded-neu border border-white/25 p-8 shadow-neu-raised">
                                    <p className="text-burnt-orange font-bold text-lg mb-1">No matching jobs found</p>
                                    <p className="text-sm text-charcoal-muted">Try adjusting your filter options or search terms.</p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Jobs;
