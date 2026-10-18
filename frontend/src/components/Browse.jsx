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
      <div className="bg-warm-ivory min-h-screen text-charcoal">
        <Navbar />
        <div className="max-w-7xl mx-auto pt-20 px-4 sm:px-6 pb-16">
          <div className="my-8 flex items-baseline justify-between border-b border-[--border-subtle] pb-4">
            <h1 className="font-extrabold text-2xl sm:text-3xl text-charcoal">
              Browse Openings
            </h1>
            <span className="text-sm font-semibold px-3 py-1 rounded-full bg-burnt-orange-light text-burnt-orange border border-burnt-orange/20">
              {allJobs.length} {allJobs.length === 1 ? 'Job' : 'Jobs'} Available
            </span>
          </div>

          {searchedQuery === '' && allJobs.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-[--border-subtle] shadow-warm-sm p-8">
              <p className="text-lg text-charcoal-muted mb-2">No jobs found matching your criteria.</p>
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
                <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-[--border-subtle] p-8">
                  <p className="text-charcoal-muted">No jobs found.</p>
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
