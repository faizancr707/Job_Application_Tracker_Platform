import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
        }
    };

    const handleSaveForLater = async () => {
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
        }
    };

    const aiTabs = [
        { key: 'analyze', label: '🔍 AI Analysis', component: <JobAnalysisCard jobId={jobId} /> },
        { key: 'match', label: '🎯 Match Resume', component: <JobMatchCard jobId={jobId} /> },
        { key: 'cover', label: '✍️ Cover Letter', component: <CoverLetterGenerator jobId={jobId} /> },
    ];

    const isSaved = savedJobs?.some((savedJob) => savedJob.id?.toString() === singleJob?.id?.toString());

    return (
        <div className="bg-warm-ivory min-h-screen text-charcoal">
            <Navbar />
            <main className="pt-24 pb-20 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Main Job Card */}
                    <Card className="bg-white border border-[--border-subtle] rounded-2xl p-6 sm:p-10 shadow-warm-md">
                        {/* Job Header */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-[--border-subtle] gap-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-deep-brown tracking-tight">
                                    {singleJob?.title || 'Job Title'}
                                </h1>
                                <p className="text-base text-burnt-orange-link font-semibold mt-1">
                                    {singleJob?.company?.name || 'Company Name'}
                                    <span className="text-muted-brown mx-2 font-normal">•</span>
                                    <span className="text-muted-brown font-normal">{singleJob?.location || 'Remote'}</span>
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                                {isSaved ? (
                                    <Button className="w-full sm:w-auto bg-lime-green text-charcoal font-semibold hover:bg-lime-green-dim shadow-sm">
                                        ✓ Saved Already
                                    </Button>
                                ) : (
                                    <Button
                                        variant="outline"
                                        className="w-full sm:w-auto border-burnt-orange/40 text-charcoal hover:text-burnt-orange bg-white hover:bg-burnt-orange-light font-medium"
                                        onClick={handleSaveForLater}
                                    >
                                        Save For Later
                                    </Button>
                                )}
                                <Button
                                    className={`w-full sm:w-auto rounded-xl px-6 py-2.5 font-semibold text-sm shadow-sm transition ${
                                        isApplied
                                            ? 'bg-warm-ivory-dark text-charcoal-dim cursor-not-allowed border border-[--border-subtle]'
                                            : 'bg-burnt-orange hover:bg-burnt-orange-hover text-white hover:shadow-glow-orange'
                                    }`}
                                    onClick={isApplied ? null : applyJobHandler}
                                    disabled={isApplied}
                                >
                                    {isApplied ? 'Already Applied' : 'Apply Now'}
                                </Button>
                            </div>
                        </div>

                        {/* Meta Highlights Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
                            <div className="bg-warm-ivory/60 border border-[--border-subtle] rounded-xl p-3.5 flex flex-col items-start">
                                <span className="text-xs text-charcoal-dim flex items-center gap-1 mb-1 font-medium">
                                    <MapPin className="h-3.5 w-3.5 text-burnt-orange" /> Location
                                </span>
                                <span className="text-sm font-bold text-charcoal">{singleJob?.location || 'Remote'}</span>
                            </div>

                            <div className="bg-warm-ivory/60 border border-[--border-subtle] rounded-xl p-3.5 flex flex-col items-start">
                                <span className="text-xs text-charcoal-dim flex items-center gap-1 mb-1 font-medium">
                                    <Building className="h-3.5 w-3.5 text-burnt-orange" /> Type
                                </span>
                                <span className="text-sm font-bold text-charcoal">{singleJob?.jobType || 'Full-time'}</span>
                            </div>

                            <div className="bg-warm-ivory/60 border border-[--border-subtle] rounded-xl p-3.5 flex flex-col items-start">
                                <span className="text-xs text-charcoal-dim flex items-center gap-1 mb-1 font-medium">
                                    <IndianRupeeIcon className="h-3.5 w-3.5 text-burnt-orange" /> Compensation
                                </span>
                                <span className="text-sm font-bold text-burnt-orange">
                                    {singleJob?.salary ? `${singleJob.salary} LPA` : 'Competitive'}
                                </span>
                            </div>

                            <div className="bg-warm-ivory/60 border border-[--border-subtle] rounded-xl p-3.5 flex flex-col items-start">
                                <span className="text-xs text-charcoal-dim flex items-center gap-1 mb-1 font-medium">
                                    <Clock className="h-3.5 w-3.5 text-burnt-orange" /> Posted
                                </span>
                                <span className="text-sm font-bold text-charcoal">
                                    {singleJob?.createdAt ? new Date(singleJob.createdAt).toLocaleDateString() : 'Recent'}
                                </span>
                            </div>
                        </div>

                        {/* Job Description */}
                        <div className="mt-8 space-y-6">
                            <div>
                                <h2 className="text-base font-bold text-deep-brown uppercase tracking-wider mb-2">
                                    Role Overview
                                </h2>
                                <p className="text-sm sm:text-base text-warm-charcoal leading-relaxed whitespace-pre-line">
                                    {singleJob?.description || 'No detailed description available.'}
                                </p>
                            </div>

                            {/* Requirements */}
                            <div>
                                <h2 className="text-base font-bold text-deep-brown uppercase tracking-wider mb-2">
                                    Key Requirements
                                </h2>
                                <div className="text-sm sm:text-base text-warm-charcoal leading-relaxed">
                                    {Array.isArray(singleJob?.requirements) ? (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {singleJob.requirements.map((req, i) => (
                                                <span key={i} className="px-3 py-1 rounded-full bg-warm-ivory-dark text-dark-charcoal text-xs font-semibold border border-[--border-subtle]">
                                                    {req}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p>{singleJob?.requirements || 'Requirements not specified'}</p>
                                    )}
                                </div>
                            </div>

                            {/* Experience & Metrics */}
                            <div className="pt-4 border-t border-[--border-subtle] flex flex-wrap justify-between items-center text-sm text-muted-brown">
                                <div>
                                    <span className="font-semibold text-dark-charcoal">Experience Required: </span>
                                    <span>{singleJob?.experienceLevel ? `${singleJob.experienceLevel} years` : 'Open'}</span>
                                </div>
                                <div>
                                    <span className="font-semibold text-dark-charcoal">Total Applicants: </span>
                                    <span className="font-bold text-burnt-orange">{singleJob?.applications?.length || 0}</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* AI Tools Section */}
                    {user && user.role === 'student' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <h2 className="text-xl font-bold text-deep-brown flex items-center gap-2">
                                    <span className="bg-burnt-orange-light text-burnt-orange border border-burnt-orange/30 px-2.5 py-0.5 rounded-full text-xs font-extrabold flex items-center gap-1">
                                        <Sparkles className="w-3 h-3 text-burnt-orange" /> AI Copilot
                                    </span>
                                    Smart Application Toolkit
                                </h2>
                                <span className="text-xs text-muted-brown">Select a tool to analyze this opening</span>
                            </div>

                            <div className="flex gap-2 flex-wrap">
                                {aiTabs.map((tab) => {
                                    const isActive = activeAITab === tab.key;
                                    return (
                                        <button
                                            key={tab.key}
                                            onClick={() => setActiveAITab(isActive ? null : tab.key)}
                                            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm ${
                                                isActive
                                                    ? 'bg-burnt-orange text-white shadow-glow-orange'
                                                    : 'bg-white text-charcoal-muted hover:text-burnt-orange hover:bg-warm-ivory-dark border border-[--border-subtle]'
                                            }`}
                                        >
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {activeAITab && (
                                <Card className="bg-white border border-[--border-subtle] rounded-2xl p-6 shadow-warm-md animate-fadeIn">
                                    {aiTabs.find((t) => t.key === activeAITab)?.component}
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
