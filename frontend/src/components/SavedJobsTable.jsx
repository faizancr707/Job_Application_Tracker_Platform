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
            <div className="overflow-x-auto border border-[--border-subtle] rounded-xl">
                <Table className="table-auto w-full bg-white text-charcoal">
                    <TableHeader>
                        <TableRow className="bg-warm-ivory-dark/70 hover:bg-warm-ivory-dark/70">
                            <TableCell className="border-b border-[--border-subtle] px-4 py-3.5 font-bold text-charcoal text-xs uppercase tracking-wider">Title</TableCell>
                            <TableCell className="border-b border-[--border-subtle] px-4 py-3.5 font-bold text-charcoal text-xs uppercase tracking-wider">Location</TableCell>
                            <TableCell className="border-b border-[--border-subtle] px-4 py-3.5 font-bold text-charcoal text-xs uppercase tracking-wider">Salary</TableCell>
                            <TableCell className="border-b border-[--border-subtle] px-4 py-3.5 font-bold text-charcoal text-xs uppercase tracking-wider">Positions</TableCell>
                            <TableCell className="border-b border-[--border-subtle] px-4 py-3.5 font-bold text-charcoal text-xs uppercase tracking-wider text-right">Action</TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {savedJobs && savedJobs.length > 0 ? (
                            savedJobs.map((job, index) => (
                                <motion.tr
                                    key={job?.id || index}
                                    className="hover:bg-warm-ivory/40 transition-colors border-b border-[--border-subtle] last:border-b-0"
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
                                    <TableCell className="px-4 py-3.5 font-semibold text-burnt-orange">
                                        {job?.salary ? `₹ ${job.salary} LPA` : 'Competitive'}
                                    </TableCell>
                                    <TableCell className="px-4 py-3.5 text-charcoal-muted">
                                        {job?.position || 1}
                                    </TableCell>
                                    <TableCell className="px-4 py-3.5 text-right">
                                        <Link
                                            to={`/description/${job?.id}`}
                                            className="inline-flex items-center gap-1 text-burnt-orange hover:text-burnt-orange-hover font-semibold text-xs py-1 px-2.5 rounded-lg hover:bg-burnt-orange-light transition"
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