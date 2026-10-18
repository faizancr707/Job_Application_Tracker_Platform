import React from 'react';
import { Button } from './ui/button';
import { BookmarkPlus, ArrowUpRight } from 'lucide-react';
import { Avatar, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { setsavedJobs } from '@/redux/authSlice';
import { toast } from 'sonner';
import { USER_API_END_POINT } from '@/utils/constant';
import { Card } from '@/components/ui/card';
import axios from 'axios';

const Job = ({ job }) => {
    const { savedJobs } = useSelector(store => store.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const daysAgoFunction = (mongodbTime) => {
        const createdAt = new Date(mongodbTime);
        const currentTime = new Date();
        const timeDifference = currentTime - createdAt;
        return Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    };

    const handleSaveForLater = async (jobId) => {
        try {
            const response = await axios.post(
                `${USER_API_END_POINT}/savedjob`,
                { jobId },
                { withCredentials: true }
            );
            if (response) {
                dispatch(setsavedJobs(response.data.savedJobs));
                toast.success(response.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error saving job');
        }
    };

    const isSaved = savedJobs?.some(savedJob => savedJob.id?.toString() === job?.id?.toString());

    return (
        <motion.div
            className="flex items-stretch gap-4 p-2 sm:p-3"
            whileHover={{ y: -4 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card key={job?.id} className="bg-white border border-[--border-subtle] hover:border-burnt-orange/50 w-full p-6 rounded-xl shadow-warm-sm hover:shadow-warm-md transition-all">
                <div className="flex items-start justify-between">
                    <div className="flex items-center">
                        <Avatar className="w-12 h-12 rounded-xl border border-[--border-subtle]">
                            <AvatarImage src={job?.company?.logo} alt={job?.company?.name} />
                        </Avatar>
                        <div className="ml-4">
                            <h3 className="text-lg font-bold text-dark-charcoal hover:text-burnt-orange transition-colors cursor-pointer" onClick={() => navigate(`/description/${job?.id}`)}>
                                {job?.title}
                            </h3>
                            <p className="text-sm text-muted-brown font-medium">{job?.company?.name}</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSaveForLater(job?.id)}
                        className="text-muted-brown hover:text-burnt-orange hover:bg-warm-ivory-dark"
                    >
                        <BookmarkPlus className={`h-5 w-5 ${isSaved ? 'text-burnt-orange fill-burnt-orange' : ''}`} />
                    </Button>
                </div>

                <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge variant="secondary" className="bg-warm-ivory-dark text-dark-charcoal border-none font-medium">
                            {job?.position} Positions
                        </Badge>
                        <span className="text-xs text-muted-brown px-2.5 py-0.5 rounded-full bg-warm-ivory border border-[--border-subtle]">
                            📍 {job?.location}
                        </span>
                        <span className="text-xs text-muted-brown px-2.5 py-0.5 rounded-full bg-warm-ivory border border-[--border-subtle]">
                            💼 {job?.jobType || 'Full Time'}
                        </span>
                    </div>

                    <p className="text-burnt-orange font-bold text-lg mt-3">₹ {job?.salary} LPA</p>

                    <div className="mt-5 pt-4 border-t border-[--border-subtle] flex items-center justify-between gap-2">
                        {isSaved ? (
                            <Button className="bg-lime-green text-charcoal font-semibold hover:bg-lime-green-dim text-xs sm:text-sm py-1.5 px-3.5 shadow-sm">
                                ✓ Saved
                            </Button>
                        ) : (
                            <Button
                                className="bg-burnt-orange hover:bg-burnt-orange-hover text-white font-medium text-xs sm:text-sm py-1.5 px-3.5 shadow-sm"
                                onClick={() => handleSaveForLater(job?.id)}
                            >
                                Save For Later
                            </Button>
                        )}

                        <span className="text-xs text-muted-brown">
                            {daysAgoFunction(job?.createdAt) === 0
                                ? 'Today'
                                : `${daysAgoFunction(job?.createdAt)}d ago`}
                        </span>

                        <Button
                            className="text-burnt-orange-link hover:text-deep-brown hover:bg-burnt-orange-light text-xs sm:text-sm font-semibold py-1.5 px-3"
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/description/${job?.id}`)}
                        >
                            Details
                            <ArrowUpRight className="ml-1.5 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
};

export default Job;
