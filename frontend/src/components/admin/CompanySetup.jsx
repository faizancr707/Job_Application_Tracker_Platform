import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../shared/Navbar';
import Footer from '../shared/Footer';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import useGetCompanyById from '@/hooks/useGetCompanyById';
import { COMPANY_API_END_POINT } from '@/utils/constant';

const CompanySetup = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [input, setInput] = useState({
    name: '', description: '', website: '', location: '', file: null
  });
  const [loading, setLoading] = useState(false);
  const { company, loading: companyLoading, error: companyError } = useGetCompanyById(id);

  useEffect(() => {
    if (!id) {
      toast.error('Invalid company ID.');
      navigate('/admin/companies');
    }
  }, [id, navigate]);

  useEffect(() => {
    if (company) {
      setInput({
        name: company.name || '',
        description: company.description || '',
        website: company.website || '',
        location: company.location || '',
        file: null,
      });
    }
  }, [company]);

  const changeEventHandler = (e) => {
    setInput(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const changeFileHandler = (e) => {
    const file = e.target.files?.[0];
    if (file) setInput(prev => ({ ...prev, file }));
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!id) return toast.error('Invalid company ID.');

    const formData = new FormData();
    Object.entries(input).forEach(([key, val]) => {
      if (key === 'file' && val) formData.append('file', val);
      else formData.append(key, val);
    });

    try {
      setLoading(true);
      const res = await axios.put(`${COMPANY_API_END_POINT}/update/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      if (res.data.success) {
        toast.success(res.data.message);
        navigate('/admin/companies');
      } else {
        toast.error(res.data.message || 'Failed to update company.');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Server error while updating company.');
    } finally {
      setLoading(false);
    }
  };

  if (companyLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-neu-base text-charcoal">
        <Loader2 className="animate-spin h-8 w-8 text-burnt-orange" />
        <span className="ml-3 font-bold text-charcoal">Loading company details...</span>
      </div>
    );
  }

  if (companyError) {
    return (
      <div className="text-center pt-24 min-h-screen bg-neu-base text-charcoal">
        <p className="text-terracotta font-bold">Error loading company data: {companyError}</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-4 shadow-neu-btn text-burnt-orange">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-neu-base min-h-screen text-charcoal flex flex-col justify-between">
      <Navbar />
      <motion.div
        className="max-w-2xl mx-auto w-full pt-24 pb-16 px-4 sm:px-6 flex-1"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="bg-neu-base border border-white/30 rounded-neu-lg p-8 sm:p-10 shadow-neu-raised-lg">
          <form onSubmit={submitHandler} encType="multipart/form-data">
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/20">
              <Button
                onClick={() => navigate('/admin/companies')}
                variant="outline"
                type="button"
                className="shadow-neu-btn hover:shadow-neu-raised-xs text-charcoal rounded-xl h-10 w-10 p-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-extrabold text-charcoal tracking-tight">Company Setup</h1>
                <p className="text-xs text-charcoal-muted mt-0.5">Customize your brand presence and public details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">Company Name</Label>
                <Input
                  name="name"
                  value={input.name}
                  onChange={changeEventHandler}
                  required
                  className="bg-gradient-to-br from-neu-base-dark to-neu-base-light shadow-neu-inset-sm border border-white/10"
                />
              </div>

              <div className="sm:col-span-2">
                <Label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">Description</Label>
                <Input
                  name="description"
                  value={input.description}
                  onChange={changeEventHandler}
                  placeholder="Tell applicants what your company does"
                  className="bg-gradient-to-br from-neu-base-dark to-neu-base-light shadow-neu-inset-sm border border-white/10"
                />
              </div>

              <div>
                <Label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">Website URL</Label>
                <Input
                  name="website"
                  value={input.website}
                  onChange={changeEventHandler}
                  placeholder="https://example.com"
                  className="bg-gradient-to-br from-neu-base-dark to-neu-base-light shadow-neu-inset-sm border border-white/10"
                />
              </div>

              <div>
                <Label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">Location / HQ</Label>
                <Input
                  name="location"
                  value={input.location}
                  onChange={changeEventHandler}
                  placeholder="San Francisco, CA or Remote"
                  className="bg-gradient-to-br from-neu-base-dark to-neu-base-light shadow-neu-inset-sm border border-white/10"
                />
              </div>

              <div className="sm:col-span-2">
                <Label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">Company Logo</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={changeFileHandler}
                  className="bg-gradient-to-br from-neu-base-dark to-neu-base-light shadow-neu-inset-sm border border-white/10 cursor-pointer text-xs"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-8 bg-gradient-to-br from-burnt-orange-dim to-burnt-orange hover:from-burnt-orange hover:to-burnt-orange-hover text-white rounded-neu py-3.5 font-bold shadow-neu-btn hover:shadow-glow-orange"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating Profile...
                </>
              ) : (
                'Save & Update Company'
              )}
            </Button>
          </form>
        </div>
      </motion.div>
      <Footer />
    </div>
  );
};

export default CompanySetup;
