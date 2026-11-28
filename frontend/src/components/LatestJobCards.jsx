import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from './ui/badge';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from './ui/button';
import { BookmarkPlus, ArrowUpRight } from 'lucide-react';

const LatestJobCards = ({ job }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      onClick={() => navigate(`/description/${job.id}`)}
      className="bg-neu-base border border-white/25 hover:border-burnt-orange/50 rounded-neu overflow-hidden shadow-neu-raised hover:shadow-neu-raised-md transition-all duration-300 cursor-pointer group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.015 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
    >
      <div className="p-6">
        {/* Header with Company Logo */}
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <img
              src={job?.company?.logo || 'https://via.placeholder.com/50'}
              alt={job?.company?.name || 'Company Logo'}
              className="w-12 h-12 rounded-xl object-cover shadow-neu-flat border border-white/30 group-hover:scale-105 transition-transform duration-300"
            />
            <div className="ml-4">
              <h3 className="text-lg font-bold text-charcoal group-hover:text-burnt-orange transition-colors">
                {job?.title || 'Job Title'}
              </h3>
              <p className="text-sm text-charcoal-muted font-medium">{job?.company?.name || 'Company Name'}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.85 }}
            className="text-charcoal-dim hover:text-burnt-orange shadow-neu-flat hover:shadow-neu-raised-xs rounded-xl border border-white/20 transition-all"
          >
            <BookmarkPlus className="h-4 w-4" />
          </Button>
        </div>

        {/* Job Details */}
        <div className="mt-5">
          <div className="flex items-center flex-wrap gap-2 mb-3">
            <Badge variant="secondary" className="shadow-neu-flat border border-white/20 font-medium hover:scale-105 transition-transform">
              {job?.jobType || 'Full-time'}
            </Badge>
            <span className="text-xs font-semibold text-charcoal-muted px-3 py-1 rounded-full bg-neu-base shadow-neu-flat border border-white/20 hover:scale-105 transition-transform">
              📍 {job?.location || 'Remote'}
            </span>
          </div>

          <p className="text-burnt-orange font-extrabold text-base">
            {job?.salary ? `${job.salary} LPA` : 'Competitive'}
          </p>

          {/* Footer with Openings and Details Button */}
          <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-lime-green-light text-deep-green border border-lime-green/30 shadow-neu-flat">
              {job?.position || 1} Openings
            </span>
            <Link to={`/description/${job.id}`}>
              <Button
                variant="ghost"
                size="sm"
                whileHover={{ scale: 1.05, x: 2 }}
                whileTap={{ scale: 0.95 }}
                className="text-burnt-orange hover:text-burnt-orange-hover shadow-neu-btn hover:shadow-neu-raised-xs font-semibold group/btn"
              >
                Details
                <ArrowUpRight className="ml-1 h-4 w-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LatestJobCards;
