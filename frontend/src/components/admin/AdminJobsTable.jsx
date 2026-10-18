import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Trash2, Edit2, Users, MoreHorizontal } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import { JOB_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { setAllJobs } from '@/redux/jobSlice'

const AdminJobsTable = () => {
    const dispatch = useDispatch()
    const { allAdminJobs, searchJobByText } = useSelector(store => store.job);
    const [filterJobs, setFilterJobs] = useState(allAdminJobs);
    const navigate = useNavigate();

    const handleDeleteJob = async (jobId) => {
        try {
            if (!jobId) {
                toast.error('Job ID is missing');
                return;
            }
            axios.defaults.withCredentials = true;
            const response = await axios.post(`${JOB_API_END_POINT}/delete`, { jobId });

            dispatch(setAllJobs(response.data.remainingJobs));
            setFilterJobs(response.data.remainingJobs);

            toast.success(response.data.message);
        } catch (error) {
            console.error('Error deleting job:', error);
            toast.error(error.response?.data?.message || 'Error deleting the job');
        }
    };

    useEffect(() => {
        setFilterJobs(allAdminJobs.filter((job) => {
            if (!searchJobByText) return true;
            return job?.title?.toLowerCase().includes(searchJobByText.toLowerCase()) ||
                job?.company?.name?.toLowerCase().includes(searchJobByText.toLowerCase());
        }));
    }, [allAdminJobs, searchJobByText]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="overflow-x-auto border border-[--border-subtle] rounded-2xl shadow-warm-md bg-white"
        >
            <Table className="min-w-full">
                <TableCaption className="text-center text-charcoal-dim py-4 text-xs">
                    List of all job postings managed by your organization
                </TableCaption>
                <TableHeader>
                    <TableRow className="bg-warm-ivory-dark/70 hover:bg-warm-ivory-dark/70 border-b border-[--border-subtle]">
                        <TableHead className="py-4 px-6 text-charcoal font-bold text-xs uppercase tracking-wider">Company</TableHead>
                        <TableHead className="py-4 px-6 text-charcoal font-bold text-xs uppercase tracking-wider">Role Title</TableHead>
                        <TableHead className="py-4 px-6 text-charcoal font-bold text-xs uppercase tracking-wider">Posted Date</TableHead>
                        <TableHead className="py-4 px-6 text-right text-charcoal font-bold text-xs uppercase tracking-wider">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filterJobs && filterJobs.length > 0 ? (
                        filterJobs.map((job) => (
                            <motion.tr
                                key={job.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.2 }}
                                className="hover:bg-warm-ivory/40 border-b border-[--border-subtle] last:border-b-0 transition-colors"
                            >
                                <TableCell className="py-4 px-6 whitespace-nowrap font-bold text-charcoal">
                                    {job?.company?.name}
                                </TableCell>
                                <TableCell className="py-4 px-6 whitespace-nowrap font-medium text-charcoal">
                                    {job?.title}
                                </TableCell>
                                <TableCell className="py-4 px-6 whitespace-nowrap text-charcoal-muted text-sm">
                                    {job?.createdAt?.split("T")[0]}
                                </TableCell>
                                <TableCell className="py-4 px-6 text-right">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button className="p-1.5 rounded-lg hover:bg-warm-ivory-dark text-charcoal-muted hover:text-burnt-orange transition">
                                                <MoreHorizontal className="w-5 h-5" />
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-36 bg-white border border-[--border-subtle] shadow-warm-lg rounded-xl p-1.5 space-y-0.5">
                                            <div
                                                onClick={() => navigate(`/admin/jobs/${job.id}/update`)}
                                                className="flex items-center gap-2 cursor-pointer text-charcoal hover:text-burnt-orange hover:bg-warm-ivory-dark p-2 rounded-lg text-sm font-medium transition"
                                            >
                                                <Edit2 className="w-3.5 h-3.5 text-burnt-orange" />
                                                <span>Edit</span>
                                            </div>
                                            <div
                                                onClick={() => navigate(`/admin/jobs/${job.id}/applicants`)}
                                                className="flex items-center gap-2 cursor-pointer text-charcoal hover:text-lime-green-dark hover:bg-warm-ivory-dark p-2 rounded-lg text-sm font-medium transition"
                                            >
                                                <Users className="w-3.5 h-3.5 text-lime-green-dark" />
                                                <span>Applicants</span>
                                            </div>
                                            <div
                                                onClick={() => handleDeleteJob(job?.id)}
                                                className="flex items-center gap-2 cursor-pointer text-terracotta hover:bg-red-50 p-2 rounded-lg text-sm font-medium transition"
                                            >
                                                <Trash2 className="w-3.5 h-3.5 text-terracotta" />
                                                <span>Delete</span>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </TableCell>
                            </motion.tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="text-center py-10 text-charcoal-dim text-sm">
                                No job postings found.
                            </td>
                        </tr>
                    )}
                </TableBody>
            </Table>
        </motion.div>
    );
};

export default AdminJobsTable;