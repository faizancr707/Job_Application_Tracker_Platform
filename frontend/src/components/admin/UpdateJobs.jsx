import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../shared/Navbar';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import axios from 'axios';
import { JOB_API_END_POINT } from '@/utils/constant';
import { toast } from 'sonner';
import { Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Footer from '../shared/Footer';

const UpdateJobs = () => {
    const { id: jobId } = useParams();
    const navigate = useNavigate();
    const [input, setInput] = useState({
        title: '',
        description: '',
        requirements: '',
        salary: '',
        location: '',
        jobType: '',
        experience: '',
        position: 0,
        companyId: '',
    });
    const [loading, setLoading] = useState(false);
    const [companies, setCompanies] = useState([]);

    useEffect(() => {
        const fetchJobDetails = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`);
                setInput(response.data.job);
            } catch (error) {
                toast.error('Failed to fetch job details. Please try again.');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchJobDetails();
    }, [jobId]);

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const selectChangeHandler = (value) => {
        setInput({ ...input, companyId: value });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.put(`${JOB_API_END_POINT}/update`, { ...input, jobId });
            toast.success('Job updated successfully!');
            navigate('/admin/jobs');
        } catch (error) {
            toast.error('Failed to update the job. Please try again.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            await axios.delete(`${JOB_API_END_POINT}/delete`, { data: { jobId } });
            toast.success('Job deleted successfully!');
            navigate('/admin/jobs');
        } catch (error) {
            toast.error('Failed to delete the job. Please try again.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-neu-base min-h-screen text-charcoal flex flex-col justify-between">
            <Navbar />
            <motion.div
                className="flex items-center justify-center w-full pt-24 pb-16 px-4 sm:px-6 flex-1"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <form
                    onSubmit={submitHandler}
                    className="p-8 sm:p-10 max-w-4xl w-full bg-neu-base border border-white/30 shadow-neu-raised-lg rounded-neu-lg"
                >
                    <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/20">
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => navigate('/admin/jobs')}
                            className="rounded-xl"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-extrabold text-charcoal tracking-tight">Update Job Posting</h1>
                            <p className="text-xs text-charcoal-muted mt-0.5">Modify role details, compensation, and requirements</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {Object.entries(input).map(([key, value]) => (
                            key !== 'companyId' && key !== 'id' && key !== 'createdAt' && key !== 'updatedAt' && key !== 'company' && key !== 'applications' && (
                                <div key={key}>
                                    <Label className="block text-sm font-semibold text-charcoal mb-1.5">
                                        {key.charAt(0).toUpperCase() + key.slice(1)} <span className="text-burnt-orange">*</span>
                                    </Label>
                                    <Input
                                        type={typeof value === 'number' ? 'number' : 'text'}
                                        name={key}
                                        value={value || ''}
                                        onChange={changeEventHandler}
                                    />
                                </div>
                            )
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-4 border-t border-white/20">
                        {loading ? (
                            <Button disabled className="w-full h-12 rounded-xl">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                            </Button>
                        ) : (
                            <>
                                <Button
                                    type="submit"
                                    className="flex-1 h-12 rounded-xl"
                                >
                                    Save Changes
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={handleDelete}
                                    className="h-12 rounded-xl px-6"
                                >
                                    Delete Job
                                </Button>
                            </>
                        )}
                    </div>
                </form>
            </motion.div>
            <Footer />
        </div>
    );
};

export default UpdateJobs;
