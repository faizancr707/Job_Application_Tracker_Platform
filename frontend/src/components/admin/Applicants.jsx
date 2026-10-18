import React, { useEffect } from 'react';
import Navbar from '../shared/Navbar';
import ApplicantsTable from './ApplicantsTable';
import axios from 'axios';
import { APPLICATION_API_END_POINT } from '@/utils/constant';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setAllApplicants } from '@/redux/applicationSlice';
import { motion } from 'framer-motion';
import Footer from '../shared/Footer';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';

const Applicants = () => {
  const params = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { applicants } = useSelector((store) => store.application);

  useEffect(() => {
    const fetchAllApplicants = async () => {
      try {
        const res = await axios.get(
          `${APPLICATION_API_END_POINT}/${params.id}/applicants`,
          { withCredentials: true }
        );
        dispatch(setAllApplicants(res.data.job));
      } catch (error) {
        console.error("Failed to fetch applicants:", error);
      }
    };

    if (params.id) {
      fetchAllApplicants();
    }
  }, [params.id, dispatch]);

  return (
    <div className="bg-warm-ivory min-h-screen text-charcoal flex flex-col justify-between">
      <Navbar />
      <motion.div
        className="max-w-7xl mx-auto w-full pt-24 pb-16 px-4 sm:px-6 flex-1"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/jobs')}
              className="text-burnt-orange hover:text-burnt-orange-hover hover:bg-burnt-orange-light mb-2 -ml-2 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Jobs</span>
            </Button>
            <h1 className="font-extrabold text-2xl sm:text-3xl text-charcoal tracking-tight">
              Job Applicants{' '}
              <span className="text-burnt-orange font-normal text-xl">
                ({applicants?.applications?.length || 0})
              </span>
            </h1>
          </div>
        </div>

        <ApplicantsTable />
      </motion.div>
      <Footer />
    </div>
  );
};

export default Applicants;
