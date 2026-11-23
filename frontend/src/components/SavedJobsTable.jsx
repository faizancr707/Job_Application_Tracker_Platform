import React from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Table, TableBody, TableCell, TableHeader, TableRow } from './ui/table';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const SavedJobsTable = () => {
    const { savedJobs } = useSelector(store => store.auth);

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
                            <TableCell className="border-b border-white/20 px-4 py-3.5 font-bold text-charcoal text-xs uppercase tracking-wider">Title</TableCell>
                            <TableCell className="border-b border-white/20 px-4 py-3.5 font-bold text-charcoal text-xs uppercase tracking-wider">Location</TableCell>
                            <TableCell className="border-b border-white/20 px-4 py-3.5 font-bold text-charcoal text-xs uppercase tracking-wider">Salary</TableCell>
                            <TableCell className="border-b border-white/20 px-4 py-3.5 font-bold text-charcoal text-xs uppercase tracking-wider">Positions</TableCell>
                            <TableCell className="border-b border-white/20 px-4 py-3.5 font-bold text-charcoal text-xs uppercase tracking-wider text-right">Action</TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {savedJobs && savedJobs.length > 0 ? (
                            savedJobs.map((job, index) => (
                                <motion.tr
                                    key={job?.id || index}
                                    className="hover:bg-neu-base-dark/40 transition-colors border-b border-white/15 last:border-b-0"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2, delay: index * 0.05 }}
                                >
                                    <TableCell className="px-4 py-3.5 font-semibold text-charcoal">
                                        {job?.title}
                                    </TableCell>
                                    <TableCell className="px-4 py-3.5 text-charcoal-muted">
                                        {job?.location}
                                    </TableCell>
                                    <TableCell className="px-4 py-3.5 font-extrabold text-burnt-orange">
                                        {job?.salary ? `₹ ${job.salary} LPA` : 'Competitive'}
                                    </TableCell>
                                    <TableCell className="px-4 py-3.5 text-charcoal-muted">
                                        {job?.position || 1}
                                    </TableCell>
                                    <TableCell className="px-4 py-3.5 text-right">
                                        <Link
                                            to={`/description/${job?.id}`}
                                            className="inline-flex items-center gap-1 text-burnt-orange hover:text-burnt-orange-hover font-bold text-xs py-1.5 px-3 rounded-xl bg-neu-base shadow-neu-btn hover:shadow-neu-raised-xs transition"
                                        >
                                            <span>View</span>
                                            <ArrowUpRight className="h-3.5 w-3.5" />
                                        </Link>
                                    </TableCell>
                                </motion.tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center py-8 text-charcoal-dim text-sm">
                                    No saved jobs found.
                                </td>
                            </tr>
                        )}
                    </TableBody>
                </Table>
            </div>
        </motion.div>
    );
};

export default SavedJobsTable;
