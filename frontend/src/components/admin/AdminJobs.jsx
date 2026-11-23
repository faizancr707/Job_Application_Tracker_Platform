import React, { useEffect, useState } from 'react';
import Navbar from '../shared/Navbar';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import AdminJobsTable from './AdminJobsTable';
import useGetAllAdminJobs from '@/hooks/useGetAllAdminJobs';
import { setSearchJobByText } from '@/redux/jobSlice';
import { motion } from 'framer-motion';
import Footer from '../shared/Footer';
import { Plus, Search } from 'lucide-react';

const AdminJobs = () => {
  const [input, setInput] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useGetAllAdminJobs();

  useEffect(() => {
    dispatch(setSearchJobByText(input));
  }, [input, dispatch]);

  return (
    <div className="bg-neu-base min-h-screen text-charcoal flex flex-col justify-between">
      <motion.div
        className="flex-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Navbar />
        <div className='max-w-6xl mx-auto pt-24 pb-16 px-4 sm:px-6'>
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
              Job Postings Management
            </h1>
            <p className="text-sm text-charcoal-muted mt-1">
              Create, inspect applicants, update, and manage your open positions
            </p>
          </div>

          <motion.div
            className='flex flex-col sm:flex-row items-center justify-between gap-4 mb-6'
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-burnt-orange" />
              <Input
                className="w-full pl-10 bg-gradient-to-br from-neu-base-dark to-neu-base-light rounded-xl text-charcoal placeholder:text-charcoal-dim/60 shadow-neu-inset-sm border border-white/10"
                placeholder="Filter by title or company..."
                onChange={(e) => setInput(e.target.value)}
              />
            </div>
            <Button
              className='w-full sm:w-auto bg-gradient-to-br from-burnt-orange-dim to-burnt-orange text-white hover:from-burnt-orange hover:to-burnt-orange-hover rounded-neu shadow-neu-btn hover:shadow-glow-orange font-bold flex items-center gap-2'
              onClick={() => navigate("/admin/jobs/create")}
            >
              <Plus className="w-4 h-4" />
              <span>Post New Job</span>
            </Button>
          </motion.div>

          <AdminJobsTable />
        </div>
      </motion.div>
      <Footer />
    </div>
  );
};

export default AdminJobs;
