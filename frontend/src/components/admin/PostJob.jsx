import React, { useState } from 'react';
import Navbar from '../shared/Navbar';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useSelector } from 'react-redux';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import axios from 'axios';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Loader2, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import Footer from '../shared/Footer';
import { JOB_API_END_POINT } from '@/utils/constant';

const PostJob = () => {
  const [input, setInput] = useState({
    title: '',
    description: '',
    requirements: '',
    salary: '',
    location: '',
    jobType: '',
    experience: '',
    position: '',
    companyId: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { companies } = useSelector((store) => store.company);

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const selectChangeHandler = (value) => {
    const selectedCompany = companies.find(
      (company) => company.name.toLowerCase() === value
    );
    if (selectedCompany) {
      setInput({ ...input, companyId: selectedCompany.id });
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    const payload = {
      ...input,
      salary: Number(input.salary),
      experience: Number(input.experience),
      position: Number(input.position),
      companyId: Number(input.companyId),
    };

    try {
      setLoading(true);
      const res = await axios.post(`${JOB_API_END_POINT}/post`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      if (res.data.success) {
        toast.success(res.data.message);
        navigate('/admin/jobs');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-warm-ivory min-h-screen text-charcoal flex flex-col justify-between">
      <Navbar />
      <motion.div
        className="flex items-center justify-center w-full pt-24 pb-16 px-4 sm:px-6 flex-1"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <form
          onSubmit={submitHandler}
          className="p-8 sm:p-10 max-w-4xl w-full bg-white border border-[--border-subtle] shadow-warm-md rounded-2xl"
        >
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-[--border-subtle]">
            <div className="p-3 rounded-xl bg-burnt-orange-light border border-burnt-orange/20 text-burnt-orange">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
                Post a New Opportunity
              </h1>
              <p className="text-sm text-charcoal-muted mt-0.5">
                Fill in the opening details to attract top talent
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label className="block text-sm font-semibold text-charcoal mb-1">
                Job Title <span className="text-burnt-orange">*</span>
              </Label>
              <Input
                type="text"
                name="title"
                placeholder="e.g. Senior Frontend Engineer"
                value={input.title}
                onChange={changeEventHandler}
                className="bg-warm-ivory/50 border border-[--border-subtle] rounded-xl text-charcoal focus:border-burnt-orange"
                required
              />
            </div>

            <div>
              <Label className="block text-sm font-semibold text-charcoal mb-1">
                Location <span className="text-burnt-orange">*</span>
              </Label>
              <Input
                type="text"
                name="location"
                placeholder="e.g. Bangalore, Remote, New York"
                value={input.location}
                onChange={changeEventHandler}
                className="bg-warm-ivory/50 border border-[--border-subtle] rounded-xl text-charcoal focus:border-burnt-orange"
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label className="block text-sm font-semibold text-charcoal mb-1">
                Job Description <span className="text-burnt-orange">*</span>
              </Label>
              <Input
                type="text"
                name="description"
                placeholder="Detailed description of responsibilities and day-to-day work"
                value={input.description}
                onChange={changeEventHandler}
                className="bg-warm-ivory/50 border border-[--border-subtle] rounded-xl text-charcoal focus:border-burnt-orange"
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label className="block text-sm font-semibold text-charcoal mb-1">
                Requirements <span className="text-burnt-orange">*</span>
              </Label>
              <Input
                type="text"
                name="requirements"
                placeholder="Comma separated skills (e.g. React, TypeScript, Node.js)"
                value={input.requirements}
                onChange={changeEventHandler}
                className="bg-warm-ivory/50 border border-[--border-subtle] rounded-xl text-charcoal focus:border-burnt-orange"
                required
              />
            </div>

            <div>
              <Label className="block text-sm font-semibold text-charcoal mb-1">
                Salary (LPA) <span className="text-burnt-orange">*</span>
              </Label>
              <Input
                type="number"
                name="salary"
                placeholder="e.g. 15"
                value={input.salary}
                onChange={changeEventHandler}
                className="bg-warm-ivory/50 border border-[--border-subtle] rounded-xl text-charcoal focus:border-burnt-orange"
                required
              />
            </div>

            <div>
              <Label className="block text-sm font-semibold text-charcoal mb-1">
                Job Type <span className="text-burnt-orange">*</span>
              </Label>
              <Input
                type="text"
                name="jobType"
                placeholder="Full-time, Part-time, Contract"
                value={input.jobType}
                onChange={changeEventHandler}
                className="bg-warm-ivory/50 border border-[--border-subtle] rounded-xl text-charcoal focus:border-burnt-orange"
                required
              />
            </div>

            <div>
              <Label className="block text-sm font-semibold text-charcoal mb-1">
                Experience Level (Years) <span className="text-burnt-orange">*</span>
              </Label>
              <Input
                type="number"
                name="experience"
                placeholder="e.g. 3"
                value={input.experience}
                onChange={changeEventHandler}
                className="bg-warm-ivory/50 border border-[--border-subtle] rounded-xl text-charcoal focus:border-burnt-orange"
                required
              />
            </div>

            <div>
              <Label className="block text-sm font-semibold text-charcoal mb-1">
                No. of Openings <span className="text-burnt-orange">*</span>
              </Label>
              <Input
                type="number"
                name="position"
                placeholder="e.g. 2"
                value={input.position}
                onChange={changeEventHandler}
                className="bg-warm-ivory/50 border border-[--border-subtle] rounded-xl text-charcoal focus:border-burnt-orange"
                required
              />
            </div>

            {companies.length > 0 && (
              <div className="md:col-span-2">
                <Label className="block text-sm font-semibold text-charcoal mb-1">
                  Assign to Company <span className="text-burnt-orange">*</span>
                </Label>
                <Select onValueChange={selectChangeHandler}>
                  <SelectTrigger className="w-full bg-warm-ivory/50 border border-[--border-subtle] rounded-xl text-charcoal">
                    <SelectValue placeholder="Select a Company Workspace" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-[--border-subtle] shadow-warm-lg rounded-xl">
                    <SelectGroup>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.name.toLowerCase()}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="mt-8 pt-4 border-t border-[--border-subtle]">
            {loading ? (
              <Button disabled className="w-full py-3 bg-burnt-orange text-white rounded-xl shadow-sm">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing Opening...
              </Button>
            ) : (
              <Button
                type="submit"
                className="w-full py-3 bg-burnt-orange hover:bg-burnt-orange-hover text-white font-semibold rounded-xl shadow-sm hover:shadow-glow-orange transition"
              >
                Publish Job Opening
              </Button>
            )}
          </div>

          {companies.length === 0 && (
            <p className="text-xs text-terracotta font-semibold text-center mt-4">
              *Please register a company first before creating job listings.
            </p>
          )}
        </form>
      </motion.div>
      <Footer />
    </div>
  );
};

export default PostJob;
