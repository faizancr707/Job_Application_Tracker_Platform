import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../shared/Navbar';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { COMPANY_API_END_POINT } from '@/utils/constant';
import { toast } from 'sonner';
import { useDispatch } from 'react-redux';
import { setSingleCompany } from '@/redux/companySlice';
import Footer from '../shared/Footer';
import { Building2 } from 'lucide-react';

const CompanyCreate = () => {
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState('');
  const dispatch = useDispatch();

  const registerNewCompany = async () => {
    if (!companyName.trim()) {
      toast.error('Company name is required.');
      return;
    }

    try {
      const res = await axios.post(
        `${COMPANY_API_END_POINT}/register`,
        { companyName },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );

      const company = res?.data?.company;
      const companyId = company?.id;

      if (res?.data?.success && company && companyId) {
        dispatch(setSingleCompany(company));
        toast.success(res.data.message || 'Company created successfully!');
        navigate(`/admin/companies/${companyId}`);
      } else {
        toast.error('Invalid response from server. Company ID missing.');
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        'Failed to create company. Please try again.';
      toast.error(msg);
    }
  };

  return (
    <div className="bg-warm-ivory min-h-screen text-charcoal flex flex-col justify-between">
      <Navbar />
      <motion.div
        className="max-w-2xl mx-auto w-full pt-28 pb-20 px-4 sm:px-6 flex-1"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="bg-white border border-[--border-subtle] rounded-2xl p-8 sm:p-10 shadow-warm-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-burnt-orange-light border border-burnt-orange/20 text-burnt-orange">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-2xl sm:text-3xl text-charcoal tracking-tight">
                Register Your Company
              </h1>
              <p className="text-sm text-charcoal-muted mt-0.5">What would you like to name your company or workspace?</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="block text-sm font-semibold text-charcoal mb-1.5">
                Company Name <span className="text-burnt-orange">*</span>
              </Label>
              <Input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Innovations, Stripe, Google"
                className="p-3 bg-warm-ivory/50 border border-[--border-subtle] rounded-xl text-charcoal placeholder:text-charcoal-dim focus:border-burnt-orange focus:ring-burnt-orange text-base"
              />
              <p className="text-xs text-charcoal-dim mt-1.5">You can update the logo, website, and details on the next step.</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-[--border-subtle]">
              <Button
                variant="outline"
                onClick={() => navigate('/admin/companies')}
                className="border-burnt-orange/40 text-charcoal hover:bg-warm-ivory-dark rounded-xl px-5"
              >
                Cancel
              </Button>
              <Button
                onClick={registerNewCompany}
                className="bg-burnt-orange hover:bg-burnt-orange-hover text-white rounded-xl px-6 font-semibold shadow-sm hover:shadow-glow-orange"
              >
                Continue to Setup →
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
      <Footer />
    </div>
  );
};

export default CompanyCreate;
