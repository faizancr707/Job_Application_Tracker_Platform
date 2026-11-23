import React from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Table, TableBody, TableCell, TableHeader, TableRow } from './ui/table';

const AppliedJobTable = () => {
    const { allAppliedJobs } = useSelector(state => state.job);

    const renderStatusBadge = (status) => {
        const s = status?.toLowerCase() || 'pending';
        switch (s) {
            case 'accepted':
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-lime-green-light text-deep-green border border-lime-green/40 shadow-neu-flat">
                        ✓ Accepted
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-neu-base text-terracotta border border-terracotta/30 shadow-neu-flat">
                        ✕ Rejected
                    </span>
                );
            case 'pending':
            default:
                return (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-neu-base text-burnt-orange border border-burnt-orange/30 shadow-neu-flat">
                        ⏳ Pending
                    </span>
                );
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="overflow-x-auto border border-white/20 rounded-neu shadow-neu-flat">
                <Table className="table-auto w-full bg-neu-base text-charcoal">
                    <TableHeader>
                        <TableRow className="bg-neu-base-dark/60 hover:bg-neu-base-dark/60">
                            <TableCell className="border-b border-white/20 px-4 py-3.5 font-bold text-charcoal text-xs uppercase tracking-wider">Job Title</TableCell>
                            <TableCell className="border-b border-white/20 px-4 py-3.5 font-bold text-charcoal text-xs uppercase tracking-wider">Company</TableCell>
                            <TableCell className="border-b border-white/20 px-4 py-3.5 font-bold text-charcoal text-xs uppercase tracking-wider">Applied Date</TableCell>
                            <TableCell className="border-b border-white/20 px-4 py-3.5 font-bold text-charcoal text-xs uppercase tracking-wider">Status</TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {allAppliedJobs?.length > 0 ? (
                            allAppliedJobs.map((appliedJob, index) => (
                                <motion.tr
                                    key={appliedJob.id || index}
                                    className="hover:bg-neu-base-dark/40 transition-colors border-b border-white/15 last:border-b-0"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2, delay: index * 0.05 }}
                                >
                                    <TableCell className="px-4 py-3.5 font-semibold text-charcoal">
                                        {appliedJob?.job?.title || 'Unknown Title'}
                                    </TableCell>
                                    <TableCell className="px-4 py-3.5 text-charcoal-muted">
                                        {appliedJob?.job?.company?.name || 'Company'}
                                    </TableCell>
                                    <TableCell className="px-4 py-3.5 text-charcoal-dim text-sm">
                                        {appliedJob?.createdAt ? new Date(appliedJob.createdAt).toLocaleDateString() : 'N/A'}
                                    </TableCell>
                                    <TableCell className="px-4 py-3.5">
                                        {renderStatusBadge(appliedJob?.status)}
                                    </TableCell>
                                </motion.tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center py-8 text-charcoal-dim text-sm">
                                    No applications submitted yet.
                                </td>
                            </tr>
                        )}
                    </TableBody>
                </Table>
            </div>
        </motion.div>
    );
};

export default AppliedJobTable;
