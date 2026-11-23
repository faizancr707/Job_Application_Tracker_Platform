import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import Navbar from './shared/Navbar';
import Footer from './shared/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, Building, Clock, IndianRupeeIcon, Sparkles } from 'lucide-react';
import { USER_API_END_POINT, JOB_API_END_POINT, APPLICATION_API_END_POINT } from '@/utils/constant';
import { setsavedJobs } from '@/redux/authSlice';
import { setSingleJob, setAllAppliedJobs } from '@/redux/jobSlice';
import JobAnalysisCard from './ai/JobAnalysisCard';
import JobMatchCard from './ai/JobMatchCard';
import CoverLetterGenerator from './ai/CoverLetterGenerator';

const JobDescription = () => {
    const { id: jobId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { savedJobs, user } = useSelector((store) => store.auth);
    const { singleJob, allAppliedJobs } = useSelector((store) => store.job);

    const [isApplied, setIsApplied] = useState(false);
    const [activeAITab, setActiveAITab] = useState(null);

    useEffect(() => {
        const fetchSingleJob = async () => {
            try {
                const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`, { withCredentials: true });
                if (res.data.success) {
                    dispatch(setSingleJob(res.data.job));
                    setIsApplied(
                        res.data.job.applications.some((application) => application.applicantId === user?.id)
                    );
                }
            } catch (error) {
                console.error('Error fetching job details:', error);
            }
        };
        fetchSingleJob();
    }, [jobId, dispatch, user?.id]);

    const applyJobHandler = async () => {
        if (!user) {
            toast.error('Please login first then proceed');
            navigate('/login');
            return;
        }

        try {
            const res = await axios.post(
                `${APPLICATION_API_END_POINT}/apply/${jobId}`,
                {},
                { withCredentials: true }
            );

            if (res.data.success) {
                setIsApplied(true);
                dispatch(
                    setSingleJob({
                        ...singleJob,
                        applications: [...singleJob.applications, { applicantId: user?.id }],
                    })
                );
                const newAppliedJobRecord = {
                    id: res.data.application?.id || Date.now(),
                    status: res.data.application?.status || 'pending',
                    createdAt: res.data.application?.createdAt || new Date().toISOString(),
                    job: singleJob
                };
                const currentAppliedJobs = Array.isArray(allAppliedJobs) ? allAppliedJobs : [];
                dispatch(setAllAppliedJobs([newAppliedJobRecord, ...currentAppliedJobs]));
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'An error occurred while applying');
            if (error.response?.status === 401) {
                navigate('/login');
            }
        }
    };

    const handleSaveForLater = async () => {
        if (!user) {
            toast.error('Please login first then proceed');
            navigate('/login');
            return;
        }

        try {
            const res = await axios.post(
                `${USER_API_END_POINT}/savedjob`,
                { jobId },
                { withCredentials: true }
            );
            if (res.data.success) {
                dispatch(setsavedJobs(res.data.savedJobs));
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error saving job');
            if (error.response?.status === 401) {
                navigate('/login');
            }
        }
    };

    const aiTabs = [
        { key: 'analyze', label: '🔍 AI Analysis' },
        { key: 'match', label: '🎯 Match Resume' },
        { key: 'cover', label: '✍️ Cover Letter' },
    ];

    const isSaved = savedJobs?.some((savedJob) => savedJob.id?.toString() === singleJob?.id?.toString());

    return (
        <div className="bg-slate-50 min-h-screen text-slate-800">
            <Navbar />
            <main className="pt-24 pb-20 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Main Job Card */}
                    <Card className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-10 shadow-glass">
                        {/* Job Header */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                    {singleJob?.title || 'Job Title'}
                                </h1>
                                <p className="text-base text-electric font-bold mt-1">
                                    {singleJob?.company?.name || 'Company Name'}
                                    <span className="text-slate-400 mx-2 font-normal">•</span>
                                    <span className="text-slate-500 font-normal">{singleJob?.location || 'Remote'}</span>
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                                {isSaved ? (
                                    <Button className="w-full sm:w-auto bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold hover:bg-emerald-100 shadow-glass-sm">
                                        ✓ Saved Already
                                    </Button>
                                ) : (
                                    <Button
                                        variant="outline"
                                        className="w-full sm:w-auto text-slate-700 hover:text-electric shadow-glass-sm font-semibold"
                                        onClick={handleSaveForLater}
                                    >
                                        Save For Later
                                    </Button>
                                )}
                                <Button
                                    className={`w-full sm:w-auto rounded-xl px-6 py-2.5 font-bold text-sm shadow-glass transition-all ${
                                        isApplied
                                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                            : 'bg-gradient-to-r from-electric to-electric-dim hover:from-electric-dim hover:to-electric text-white shadow-[0_4px_16px_rgba(124,58,237,0.3)]'
                                    }`}
                                    onClick={isApplied ? null : applyJobHandler}
                                    disabled={isApplied}
                                >
                                    {isApplied ? 'Already Applied' : 'Apply Now'}
                                </Button>
                            </div>
                        </div>

                        {/* Meta Highlights Grid with Soft Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 my-6">
                            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 flex flex-col items-start shadow-glass-sm">
                                <span className="text-xs text-slate-500 flex items-center gap-1.5 mb-1 font-semibold">
                                    <MapPin className="h-3.5 w-3.5 text-electric" /> Location
                                </span>
                                <span className="text-sm font-bold text-slate-800">{singleJob?.location || 'Remote'}</span>
                            </div>

                            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 flex flex-col items-start shadow-glass-sm">
                                <span className="text-xs text-slate-500 flex items-center gap-1.5 mb-1 font-semibold">
                                    <Building className="h-3.5 w-3.5 text-electric" /> Type
                                </span>
                                <span className="text-sm font-bold text-slate-800">{singleJob?.jobType || 'Full-time'}</span>
                            </div>

                            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 flex flex-col items-start shadow-glass-sm">
                                <span className="text-xs text-slate-500 flex items-center gap-1.5 mb-1 font-semibold">
                                    <IndianRupeeIcon className="h-3.5 w-3.5 text-electric" /> Compensation
                                </span>
                                <span className="text-sm font-extrabold text-electric">
                                    {singleJob?.salary ? `${singleJob.salary} LPA` : 'Competitive'}
                                </span>
                            </div>

                            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 flex flex-col items-start shadow-glass-sm">
                                <span className="text-xs text-slate-500 flex items-center gap-1.5 mb-1 font-semibold">
                                    <Clock className="h-3.5 w-3.5 text-electric" /> Posted
                                </span>
                                <span className="text-sm font-bold text-slate-800">
                                    {singleJob?.createdAt ? new Date(singleJob.createdAt).toLocaleDateString() : 'Recent'}
                                </span>
                            </div>
                        </div>

                        {/* Job Description */}
                        <div className="mt-8 space-y-6">
                            <div>
                                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    Role Overview
                                </h2>
                                <p className="text-sm sm:text-base text-slate-600 leading-relaxed whitespace-pre-line font-normal">
                                    {singleJob?.description || 'No detailed description available.'}
                                </p>
                            </div>

                            {/* Requirements */}
                            <div>
                                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    Key Requirements
                                </h2>
                                <div className="text-sm sm:text-base text-slate-700 leading-relaxed">
                                    {Array.isArray(singleJob?.requirements) ? (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {singleJob.requirements.map((req, i) => (
                                                <span key={i} className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                                                    {req}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-slate-600">{singleJob?.requirements || 'Requirements not specified'}</p>
                                    )}
                                </div>
                            </div>

                            {/* Experience & Metrics */}
                            <div className="pt-4 border-t border-slate-100 flex flex-wrap justify-between items-center text-sm text-slate-500">
                                <div>
                                    <span className="font-semibold text-slate-700">Experience Required: </span>
                                    <span>{singleJob?.experienceLevel ? `${singleJob.experienceLevel} years` : 'Open'}</span>
                                </div>
                                <div>
                                    <span className="font-semibold text-slate-700">Total Applicants: </span>
                                    <span className="font-bold text-electric">{singleJob?.applications?.length || 0}</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* AI Tools Section */}
                    {user && user.role === 'student' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <span className="bg-electric-50 text-electric border border-electric/30 px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow-glass-sm">
                                        <Sparkles className="w-3.5 h-3.5 text-electric" /> AI Copilot
                                    </span>
                                    Smart Application Toolkit
                                </h2>
                                <span className="text-xs text-slate-500">Select a tool to analyze this opening</span>
                            </div>

                            <div className="flex gap-3 flex-wrap">
                                {aiTabs.map((tab) => {
                                    const isActive = activeAITab === tab.key;
                                    return (
                                        <button
                                            key={tab.key}
                                            onClick={() => setActiveAITab(isActive ? null : tab.key)}
                                            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                                                isActive
                                                    ? 'bg-gradient-to-r from-electric to-electric-dim text-white shadow-[0_4px_16px_rgba(124,58,237,0.3)] scale-[1.02]'
                                                    : 'bg-white text-slate-700 hover:text-electric hover:bg-slate-50 border border-slate-200/80 shadow-glass-sm'
                                            }`}
                                        >
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {activeAITab && (
                                <Card className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-glass-md animate-fadeIn">
                                    {activeAITab === 'analyze' && <JobAnalysisCard jobId={jobId} />}
                                    {activeAITab === 'match' && <JobMatchCard jobId={jobId} jobTitle={singleJob?.title} />}
                                    {activeAITab === 'cover' && <CoverLetterGenerator jobId={jobId} />}
                                </Card>
                            )}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default JobDescription;
