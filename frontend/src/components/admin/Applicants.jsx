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
import { ArrowLeft, Users, Briefcase } from 'lucide-react';
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
        console.error('Failed to fetch applicants:', error);
      }
    };

    if (params.id) {
      fetchAllApplicants();
    }
  }, [params.id, dispatch]);

  const applicantCount = applicants?.applications?.length || 0;
  const jobTitle = applicants?.title || 'Job Opening';

  return (
    <div className="bg-[#FAF8F5] min-h-screen text-slate-800 flex flex-col justify-between font-sans">
      <Navbar />

      {/* Forest Green Header */}
      <section className="bg-gradient-to-b from-[#143D2B] via-[#1B4332] to-[#245740] text-white pt-28 pb-12 px-4 sm:px-6 relative overflow-hidden border-b border-[#2D6A4F]/40 shadow-inner">
        <div className="max-w-7xl mx-auto relative z-10 space-y-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/jobs')}
            className="bg-white/10 hover:bg-white/20 border-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 backdrop-blur-md"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-300" />
            <span>Back to Jobs</span>
          </Button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold mb-2">
                <Briefcase className="w-3.5 h-3.5" />
                <span>{jobTitle}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
                <span>Candidate Applicants</span>
                <span className="text-lg font-bold px-3 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/40">
                  {applicantCount}
                </span>
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 space-y-6">
        <ApplicantsTable />
      </main>

      <Footer />
    </div>
  );
};

export default Applicants;