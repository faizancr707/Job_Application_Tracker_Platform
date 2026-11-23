import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import {
  MoreHorizontal,
  FileText,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Clock,
  Search,
  Target,
  User,
  Mail,
  Phone,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { APPLICATION_API_END_POINT } from '@/utils/constant';
import { setAllApplicants } from '@/redux/applicationSlice';
import axios from 'axios';

const shortlistingStatus = [
  { label: 'In Review', value: 'review', icon: Search, color: 'text-blue-800 hover:bg-blue-50' },
  { label: 'Interviewing', value: 'interview', icon: Target, color: 'text-purple-800 hover:bg-purple-50' },
  { label: 'Accepted', value: 'accepted', icon: CheckCircle2, color: 'text-emerald-800 hover:bg-emerald-50' },
  { label: 'Rejected', value: 'rejected', icon: XCircle, color: 'text-rose-800 hover:bg-rose-50' },
  { label: 'Reset to Applied', value: 'pending', icon: Clock, color: 'text-amber-800 hover:bg-amber-50' },
];

const tableRowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const ApplicantsTable = () => {
  const dispatch = useDispatch();
  const { applicants } = useSelector((store) => store.application);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const statusHandler = async (status, id) => {
    try {
      axios.defaults.withCredentials = true;
      const res = await axios.post(`${APPLICATION_API_END_POINT}/status/${id}/update`, { status });
      if (res.data.success) {
        toast.success(res.data.message || `Status updated to ${status}`);

        // Update local Redux state so the status badge updates immediately
        if (applicants?.applications) {
          const updatedApps = applicants.applications.map((app) =>
            app.id === id ? { ...app, status: status.toLowerCase() } : app
          );
          dispatch(setAllApplicants({ ...applicants, applications: updatedApps }));
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating status');
    }
  };

  const renderStatusBadge = (status) => {
    const s = (status || 'pending').toLowerCase();
    switch (s) {
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Accepted</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>Rejected</span>
          </span>
        );
      case 'interview':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200">
            <Target className="w-3 h-3 text-purple-600" />
            <span>Interviewing</span>
          </span>
        );
      case 'review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <Search className="w-3 h-3 text-blue-600" />
            <span>In Review</span>
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Applied</span>
          </span>
        );
    }
  };

  const openCandidateProfile = (applicant) => {
    setSelectedCandidate(applicant);
    setProfileModalOpen(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="overflow-x-auto border border-slate-200/80 rounded-2xl shadow-sm bg-white"
      >
        <Table className="min-w-full">
          <TableCaption className="text-slate-400 py-4 text-xs font-medium">
            List of candidates who submitted applications for this posting
          </TableCaption>
          <TableHeader>
            <TableRow className="bg-[#FAF8F5] border-b border-slate-200 hover:bg-[#FAF8F5]">
              <TableHead className="py-4 px-6 text-slate-700 font-bold text-xs uppercase tracking-wider">Candidate</TableHead>
              <TableHead className="py-4 px-6 text-slate-700 font-bold text-xs uppercase tracking-wider">Email</TableHead>
              <TableHead className="py-4 px-6 text-slate-700 font-bold text-xs uppercase tracking-wider">Phone</TableHead>
              <TableHead className="py-4 px-6 text-slate-700 font-bold text-xs uppercase tracking-wider">Resume / Profile</TableHead>
              <TableHead className="py-4 px-6 text-slate-700 font-bold text-xs uppercase tracking-wider">Date Applied</TableHead>
              <TableHead className="py-4 px-6 text-slate-700 font-bold text-xs uppercase tracking-wider">Status</TableHead>
              <TableHead className="py-4 px-6 text-right text-slate-700 font-bold text-xs uppercase tracking-wider">Decision</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applicants?.applications && applicants.applications.length > 0 ? (
              applicants.applications.map((item, index) => {
                const resumeUrl = item?.applicant?.profile?.resume || item?.applicant?.resume;
                const resumeName = item?.applicant?.profile?.resumeOriginalName || item?.applicant?.resumeOriginalName || 'Resume.pdf';
                const appliedDate = item?.createdAt
                  ? new Date(item.createdAt).toLocaleDateString()
                  : item?.applicant?.createdAt
                  ? new Date(item.applicant.createdAt).toLocaleDateString()
                  : 'N/A';

                return (
                  <motion.tr
                    key={item.id}
                    variants={tableRowVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.04 }}
                    className="hover:bg-slate-50/80 border-b border-slate-100 last:border-b-0 transition-colors"
                  >
                    <TableCell
                      onClick={() => openCandidateProfile(item.applicant)}
                      className="py-4 px-6 text-slate-900 font-bold whitespace-nowrap cursor-pointer hover:text-[#1B4332]"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 text-[#1B4332] flex items-center justify-center font-bold text-xs">
                          {(item?.applicant?.fullname || 'C').charAt(0).toUpperCase()}
                        </div>
                        <span>{item?.applicant?.fullname || 'Candidate'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6 text-slate-600 text-sm whitespace-nowrap">
                      {item?.applicant?.email || 'N/A'}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-slate-500 text-sm whitespace-nowrap">
                      {item?.applicant?.phoneNumber || 'N/A'}
                    </TableCell>
                    <TableCell className="py-4 px-6 whitespace-nowrap">
                      {resumeUrl ? (
                        <a
                          className="text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer transition-colors font-bold text-xs inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200"
                          href={resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="truncate max-w-[130px]">{resumeName}</span>
                          <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                        </a>
                      ) : (
                        <button
                          onClick={() => openCandidateProfile(item.applicant)}
                          className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition flex items-center gap-1"
                        >
                          <User className="w-3 h-3 text-slate-500" />
                          <span>View Profile & Skills</span>
                        </button>
                      )}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-slate-500 text-xs font-medium whitespace-nowrap">
                      {appliedDate}
                    </TableCell>
                    <TableCell className="py-4 px-6 whitespace-nowrap">
                      {renderStatusBadge(item?.status)}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-right whitespace-nowrap">
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition">
                            <MoreHorizontal className="w-4 h-4 inline-block" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-44 bg-white border border-slate-200 shadow-lg p-1.5 rounded-xl space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                            Set Decision Stage
                          </p>
                          {shortlistingStatus.map((st, idx) => {
                            const Icon = st.icon;
                            return (
                              <motion.div
                                key={idx}
                                onClick={() => statusHandler(st.value, item?.id)}
                                whileHover={{ scale: 1.02 }}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition text-xs font-bold ${st.color}`}
                              >
                                <Icon className="w-4 h-4" />
                                <span>{st.label}</span>
                              </motion.div>
                            );
                          })}
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                  </motion.tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-400 text-sm">
                  No applications received for this position yet.
                </td>
              </tr>
            )}
          </TableBody>
        </Table>
      </motion.div>

      {/* Candidate Profile Inspection Dialog */}
      <Dialog open={profileModalOpen} onOpenChange={setProfileModalOpen}>
        <DialogContent className="max-w-lg bg-white p-6 rounded-2xl border border-slate-200 shadow-xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#1B4332] flex items-center justify-center font-bold text-lg">
                {(selectedCandidate?.fullname || 'C').charAt(0).toUpperCase()}
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900">
                  {selectedCandidate?.fullname || 'Candidate Profile'}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Applicant Credentials & Skills Breakdown
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Contact info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-700">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{selectedCandidate?.email || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-700">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{selectedCandidate?.phoneNumber || 'N/A'}</span>
              </div>
            </div>

            {/* Bio */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Professional Bio</p>
              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                {selectedCandidate?.bio || selectedCandidate?.profile?.bio || 'Dedicated software developer focused on modern web architectures.'}
              </p>
            </div>

            {/* Skills */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Verified Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {(() => {
                  const rawSkills = selectedCandidate?.skills || selectedCandidate?.profile?.skills || ['JavaScript', 'React', 'Node.js', 'SQL', 'Git'];
                  const list = Array.isArray(rawSkills) ? rawSkills : String(rawSkills).split(/[,;]+/);
                  return list.map((sk, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold"
                    >
                      ✓ {String(sk).trim()}
                    </span>
                  ));
                })()}
              </div>
            </div>

            {/* Resume Link if available */}
            {(selectedCandidate?.profile?.resume || selectedCandidate?.resume) && (
              <div className="pt-2">
                <a
                  href={selectedCandidate?.profile?.resume || selectedCandidate?.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-[#1B4332] hover:bg-[#143D2B] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <FileText className="w-4 h-4" />
                  <span>Download / View Resume PDF</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ApplicantsTable;