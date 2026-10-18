import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../shared/Navbar';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import CompaniesTable from './CompaniesTable';
import { useNavigate } from 'react-router-dom';
import useGetAllCompanies from '@/hooks/useGetAllCompanies';
import { useDispatch } from 'react-redux';
import { setSearchCompanyByText } from '@/redux/companySlice';
import Footer from '../shared/Footer';
import { Plus, Search } from 'lucide-react';

const Companies = () => {
    useGetAllCompanies();
    const [input, setInput] = useState("");
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setSearchCompanyByText(input));
    }, [input, dispatch]);

    return (
        <div className="bg-warm-ivory min-h-screen text-charcoal flex flex-col justify-between">
            <motion.div
                className="flex-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
            >
                <Navbar />
                <div className="max-w-6xl mx-auto pt-24 pb-16 px-4 sm:px-6">
                    <div className="mb-8">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
                            Registered Companies
                        </h1>
                        <p className="text-sm text-charcoal-muted mt-1">
                            Manage and organize company profiles and branding
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-burnt-orange" />
                            <Input
                                className="w-full pl-10 bg-white border border-[--border-subtle] rounded-xl text-charcoal placeholder:text-charcoal-dim focus:border-burnt-orange focus:ring-burnt-orange shadow-warm-sm"
                                placeholder="Filter companies by name..."
                                onChange={(e) => setInput(e.target.value)}
                            />
                        </div>
                        <Button
                            onClick={() => navigate("/admin/companies/create")}
                            className="w-full sm:w-auto bg-burnt-orange hover:bg-burnt-orange-hover text-white rounded-xl shadow-warm-sm hover:shadow-glow-orange font-semibold flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Company</span>
                        </Button>
                    </div>
                    <CompaniesTable />
                </div>
            </motion.div>
            <Footer />
        </div>
    );
};

export default Companies;