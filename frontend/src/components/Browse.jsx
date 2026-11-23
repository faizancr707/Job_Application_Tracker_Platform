import React, { useEffect } from 'react';
import Navbar from './shared/Navbar';
import Job from './Job';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import useGetAllJobs from '@/hooks/useGetAllJobs';
import Footer from './shared/Footer';

const Browse = () => {
  useGetAllJobs();
  const { allJobs, searchedQuery } = useSelector((store) => store.job);
  const dispatch = useDispatch();

  useEffect(() => {
    return () => {
      dispatch(setSearchedQuery(''));
    };
  }, [dispatch]);

  return (
    <>
      <div className="bg-neu-base min-h-screen text-charcoal">
        <Navbar />
        <div className="max-w-7xl mx-auto pt-20 px-4 sm:px-6 pb-16">
          <div className="my-8 flex items-baseline justify-between border-b border-white/20 pb-4">
            <h1 className="font-extrabold text-2xl sm:text-3xl text-charcoal tracking-tight">
              Browse Openings
            </h1>
            <span className="text-sm font-bold px-3.5 py-1 rounded-full bg-neu-base shadow-neu-flat border border-burnt-orange/20 text-burnt-orange">
              {allJobs.length} {allJobs.length === 1 ? 'Job' : 'Jobs'} Available
            </span>
          </div>

          {searchedQuery === '' && allJobs.length === 0 ? (
            <div className="text-center py-20 bg-neu-base rounded-neu border border-white/25 shadow-neu-raised p-8">
              <p className="text-lg text-charcoal-muted mb-2 font-medium">No jobs found matching your criteria.</p>
              <p className="text-sm text-charcoal-dim">Try clearing your filters or search keywords.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allJobs.length > 0 ? (
                allJobs.map((job) => {
                  if (!job || !job.id) {
                    console.warn('⚠️ Skipping job due to missing id:', job);
                    return null;
                  }
                  return <Job key={job.id} job={job} />;
                })
              ) : (
                <div className="col-span-full text-center py-16 bg-neu-base rounded-neu border border-white/25 p-8 shadow-neu-raised">
                  <p className="text-charcoal-muted font-medium">No jobs found.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Browse;
