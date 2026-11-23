import React from 'react';
import LatestJobCards from './LatestJobCards';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';

const LatestJobs = () => {
  const { allJobs } = useSelector((store) => store.job);

  const jobsList = Array.isArray(allJobs) ? allJobs : [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="max-w-7xl mx-auto my-20 px-4">
      <motion.h1
        className="text-4xl font-extrabold text-center mb-10 text-charcoal tracking-tight"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        aria-label="Latest and Top Job Openings"
      >
        <span className="text-burnt-orange">Latest & Top</span> Job Openings
      </motion.h1>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {jobsList.length === 0 ? (
          <motion.div
            key="no-jobs-message"
            className="p-12 text-center text-lg text-charcoal-dim col-span-full neu-card mx-auto max-w-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            No Jobs Available At The Moment
          </motion.div>
        ) : (
          jobsList.slice(0, 6).map((job, index) => (
            <motion.div
              key={job.id ?? index}
              variants={cardVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <LatestJobCards job={job} />
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
};

export default LatestJobs;
