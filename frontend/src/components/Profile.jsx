import React, { useState } from 'react';
import Navbar from './shared/Navbar';
import { Avatar, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Contact, Mail, Pen, FileText, ExternalLink } from 'lucide-react';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import AppliedJobTable from './AppliedJobTable';
import UpdateProfileDialog from './UpdateProfileDialog';
import { useSelector } from 'react-redux';
import useGetAppliedJobs from '@/hooks/useGetAppliedJobs';
import useGetSavedJobs from '@/hooks/useGetSavedJobs';
import { motion } from 'framer-motion';
import SavedJobsTable from './SavedJobsTable';
import Footer from './shared/Footer';

const Profile = () => {
    useGetAppliedJobs();
    useGetSavedJobs();
    const [open, setOpen] = useState(false);
    const { user } = useSelector((store) => store.auth);

    return (
        <div className="bg-warm-ivory min-h-screen text-charcoal">
            <Navbar />
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="pt-24 pb-16 max-w-5xl mx-auto px-4 sm:px-6"
            >
                {/* Profile Card */}
                <div className="bg-white border border-[--border-subtle] rounded-2xl shadow-warm-md p-6 sm:p-8 my-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[--border-subtle]">
                        <div className="flex items-center gap-5">
                            <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-2 border-burnt-orange/30 shadow-sm">
                                <AvatarImage
                                    src={user?.profile?.profilePhoto ? user?.profile?.profilePhoto : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSq8T0hZUoX8kuRi3EZpZbUDtZ_WqqN9Ll15Q&s'}
                                    alt="profile"
                                />
                            </Avatar>
                            <div>
                                <h1 className="font-extrabold text-2xl text-charcoal">{user?.fullname}</h1>
                                <p className="text-sm text-charcoal-muted mt-0.5">{user?.profile?.bio || 'No bio provided'}</p>
                                <span className="inline-block mt-2 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-burnt-orange-light text-burnt-orange border border-burnt-orange/20">
                                    {user?.role === 'recruiter' ? 'Recruiter' : 'Job Seeker'}
                                </span>
                            </div>
                        </div>
                        <Button
                            onClick={() => setOpen(true)}
                            className="bg-burnt-orange hover:bg-burnt-orange-hover text-white flex items-center gap-2 shadow-sm"
                        >
                            <Pen className="w-4 h-4" />
                            <span>Edit Profile</span>
                        </Button>
                    </div>

                    {/* Contact Details */}
                    <div className="my-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-warm-ivory/60 border border-[--border-subtle]">
                            <Mail className="text-burnt-orange h-5 w-5" />
                            <span className="text-sm font-medium text-charcoal">{user?.email}</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-warm-ivory/60 border border-[--border-subtle]">
                            <Contact className="text-burnt-orange h-5 w-5" />
                            <span className="text-sm font-medium text-charcoal">{user?.phoneNumber || 'No phone number'}</span>
                        </div>
                    </div>

                    {/* Skills */}
                    <div className="my-6">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-burnt-orange mb-3">Skills</h2>
                        <div className="flex items-center gap-2 flex-wrap">
                            {user?.profile?.skills && user?.profile?.skills.length > 0 ? (
                                user?.profile?.skills.map((item, index) => (
                                    <Badge key={index} className="bg-warm-ivory-dark text-charcoal border border-[--border-subtle] font-medium text-xs py-1 px-3">
                                        {item}
                                    </Badge>
                                ))
                            ) : (
                                <span className="text-sm text-charcoal-dim">No skills added yet</span>
                            )}
                        </div>
                    </div>

                    {/* Resume */}
                    <div className="my-6 pt-6 border-t border-[--border-subtle]">
                        <Label className="text-xs font-bold uppercase tracking-wider text-burnt-orange block mb-2">Resume File</Label>
                        {user?.profile?.resume ? (
                            <div className="flex items-center justify-between p-3.5 rounded-xl bg-warm-ivory/60 border border-[--border-subtle]">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-5 w-5 text-burnt-orange" />
                                    <span className="text-sm font-semibold text-charcoal">{user?.profile?.resumeOriginalName || 'resume.pdf'}</span>
                                </div>
                                <a
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href={user?.profile?.resume}
                                    className="text-burnt-orange hover:text-burnt-orange-hover font-semibold text-sm flex items-center gap-1.5 hover:underline"
                                >
                                    <span>View Resume</span>
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            </div>
                        ) : (
                            <span className="text-sm text-charcoal-dim">No resume uploaded yet</span>
                        )}
                    </div>
                </div>

                {/* Applied Jobs Section */}
                <div className="bg-white border border-[--border-subtle] rounded-2xl shadow-warm-md p-6 sm:p-8 my-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-extrabold text-xl text-charcoal">Applied Jobs</h2>
                    </div>
                    <AppliedJobTable />
                </div>

                {/* Saved Jobs Section */}
                <div className="bg-white border border-[--border-subtle] rounded-2xl shadow-warm-md p-6 sm:p-8 my-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-extrabold text-xl text-charcoal">Saved Jobs</h2>
                    </div>
                    <SavedJobsTable />
                </div>
            </motion.div>

            {/* Update Profile Dialog */}
            <UpdateProfileDialog open={open} setOpen={setOpen} />
            <Footer />
        </div>
    );
};

export default Profile;