import React from 'react';
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
import { MoreHorizontal, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { APPLICATION_API_END_POINT } from '@/utils/constant';
import axios from 'axios';

const shortlistingStatus = ['Accepted', 'Rejected'];

const tableRowVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 },
};

const ApplicantsTable = () => {
    const { applicants } = useSelector((store) => store.application);

    const statusHandler = async (status, id) => {
        try {
            axios.defaults.withCredentials = true;
            const res = await axios.post(`${APPLICATION_API_END_POINT}/status/${id}/update`, { status });
            if (res.data.success) {
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating status');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="overflow-x-auto border border-[--border-subtle] rounded-2xl shadow-warm-md bg-white"
        >
            <Table className="min-w-full">
                <TableCaption className="text-charcoal-dim py-4 text-xs">
                    List of candidates who submitted applications for this posting
                </TableCaption>
                <TableHeader>
                    <TableRow className="bg-warm-ivory-dark/70 hover:bg-warm-ivory-dark/70 border-b border-[--border-subtle]">
                        <TableHead className="py-4 px-6 text-charcoal font-bold text-xs uppercase tracking-wider">Candidate</TableHead>
                        <TableHead className="py-4 px-6 text-charcoal font-bold text-xs uppercase tracking-wider">Email</TableHead>
                        <TableHead className="py-4 px-6 text-charcoal font-bold text-xs uppercase tracking-wider">Phone</TableHead>
                        <TableHead className="py-4 px-6 text-charcoal font-bold text-xs uppercase tracking-wider">Resume</TableHead>
                        <TableHead className="py-4 px-6 text-charcoal font-bold text-xs uppercase tracking-wider">Date</TableHead>
                        <TableHead className="py-4 px-6 text-right text-charcoal font-bold text-xs uppercase tracking-wider">Decision</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {applicants?.applications && applicants.applications.length > 0 ? (
                        applicants.applications.map((item, index) => (
                            <motion.tr
                                key={item.id}
                                variants={tableRowVariants}
                                initial="hidden"
                                animate="visible"
                                transition={{ delay: index * 0.05 }}
                                className="hover:bg-warm-ivory/40 border-b border-[--border-subtle] last:border-b-0 transition-colors"
                            >
                                <TableCell className="py-4 px-6 text-charcoal font-semibold whitespace-nowrap">
                                    {item?.applicant?.fullname}
                                </TableCell>
                                <TableCell className="py-4 px-6 text-charcoal-muted text-sm whitespace-nowrap">
                                    {item?.applicant?.email}
                                </TableCell>
                                <TableCell className="py-4 px-6 text-charcoal-dim text-sm whitespace-nowrap">
                                    {item?.applicant?.phoneNumber || 'NA'}
                                </TableCell>
                                <TableCell className="py-4 px-6 whitespace-nowrap">
                                    {item.applicant?.profile?.resume ? (
                                        <a
                                            className="text-burnt-orange hover:text-burnt-orange-hover hover:underline cursor-pointer transition-colors font-medium text-sm inline-flex items-center gap-1.5"
                                            href={item?.applicant?.profile?.resume}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <FileText className="w-4 h-4 text-burnt-orange" />
                                            <span>{item?.applicant?.profile?.resumeOriginalName || 'Resume.pdf'}</span>
                                        </a>
                                    ) : (
                                        <span className="text-charcoal-dim text-sm">Not Provided</span>
                                    )}
                                </TableCell>
                                <TableCell className="py-4 px-6 text-charcoal-dim text-sm whitespace-nowrap">
                                    {item?.applicant?.createdAt?.split('T')[0]}
                                </TableCell>
                                <TableCell className="py-4 px-6 text-right whitespace-nowrap">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button className="p-1.5 rounded-lg hover:bg-warm-ivory-dark text-charcoal-muted hover:text-burnt-orange transition">
                                                <MoreHorizontal className="w-5 h-5 inline-block" />
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-36 bg-white border border-[--border-subtle] shadow-warm-lg p-1.5 rounded-xl space-y-1">
                                            {shortlistingStatus.map((status, idx) => {
                                                const isAccept = status === "Accepted";
                                                return (
                                                    <motion.div
                                                        key={idx}
                                                        onClick={() => statusHandler(status, item?.id)}
                                                        whileHover={{ scale: 1.02 }}
                                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition text-sm font-semibold ${
                                                            isAccept
                                                                ? "text-lime-green-dark hover:bg-lime-green-light"
                                                                : "text-terracotta hover:bg-red-50"
                                                        }`}
                                                    >
                                                        {isAccept ? (
                                                            <CheckCircle2 className="w-4 h-4 text-lime-green-dark" />
                                                        ) : (
                                                            <XCircle className="w-4 h-4 text-terracotta" />
                                                        )}
                                                        <span>{status}</span>
                                                    </motion.div>
                                                );
                                            })}
                                        </PopoverContent>
                                    </Popover>
                                </TableCell>
                            </motion.tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="text-center py-12 text-charcoal-dim text-sm">
                                No applications received for this position yet.
                            </td>
                        </tr>
                    )}
                </TableBody>
            </Table>
        </motion.div>
    );
};

export default ApplicantsTable;