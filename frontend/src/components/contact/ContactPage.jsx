import React, { useState } from 'react';
import Navbar from '../shared/Navbar';
import Footer from '../shared/Footer';
import { motion } from 'framer-motion';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Mail, Phone, MapPin, Send, MessageSquare, ShieldCheck, Heart } from 'lucide-react';
import { toast } from 'sonner';

const ContactPage = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      toast.success('Your message has been sent successfully! We will get back to you shortly.');
      setForm({ name: '', email: '', subject: '', message: '' });
      setSubmitting(false);
    }, 1200);
  };

  return (
    <div className="bg-warm-ivory min-h-screen text-charcoal">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Header Section */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-burnt-orange-light text-burnt-orange text-xs font-bold uppercase tracking-wider mb-4 border border-burnt-orange/20">
            Support & Partnerships
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-charcoal mb-4 tracking-tight">
            Get in <span className="text-burnt-orange">Touch</span>
          </h1>
          <p className="text-charcoal-muted text-lg max-w-2xl mx-auto leading-relaxed">
            Have questions about the job portal, need technical help, or want to explore enterprise recruiter plans? We're here to help.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
          {/* Contact Details Card */}
          <motion.div
            className="lg:col-span-5 space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <div className="bg-white border border-[--border-subtle] rounded-2xl p-8 shadow-warm-sm">
              <h2 className="text-xl font-bold text-charcoal mb-6">Contact Channels</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-burnt-orange-light text-burnt-orange rounded-xl mt-1">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-charcoal">Direct Email</h3>
                    <p className="text-sm text-charcoal-muted mt-0.5">support@hirehub.com</p>
                    <p className="text-xs text-charcoal-dim mt-0.5">Typically replies within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-burnt-orange-light text-burnt-orange rounded-xl mt-1">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-charcoal">Phone & Support Desk</h3>
                    <p className="text-sm text-charcoal-muted mt-0.5">+91 (800) 123-4567</p>
                    <p className="text-xs text-charcoal-dim mt-0.5">Mon–Fri, 9:00 AM – 6:00 PM IST</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-burnt-orange-light text-burnt-orange rounded-xl mt-1">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-charcoal">Headquarters</h3>
                    <p className="text-sm text-charcoal-muted mt-0.5">Tech Hub Center, Bandra Kurla Complex</p>
                    <p className="text-xs text-charcoal-dim mt-0.5">Mumbai, MH 400051, India</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[--border-subtle] rounded-2xl p-6 shadow-warm-sm flex items-center space-x-4">
              <div className="p-3 bg-lime-green-light text-lime-green-dark rounded-xl">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-charcoal">Data & Privacy Protected</h4>
                <p className="text-xs text-charcoal-muted">Your contact information is never sold or shared.</p>
              </div>
            </div>
          </motion.div>

          {/* Form Card */}
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="bg-white border border-[--border-subtle] rounded-2xl p-8 sm:p-10 shadow-warm-md">
              <h2 className="text-2xl font-bold text-charcoal mb-2">Send Us a Message</h2>
              <p className="text-sm text-charcoal-muted mb-8">
                Fill in the form below and one of our specialists will get in touch.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="block text-sm font-semibold text-charcoal mb-1.5">
                      Your Name <span className="text-burnt-orange">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Alex Morgan"
                      className="bg-warm-ivory/50 border border-[--border-subtle] rounded-xl text-charcoal focus:border-burnt-orange"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="block text-sm font-semibold text-charcoal mb-1.5">
                      Email Address <span className="text-burnt-orange">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="alex@domain.com"
                      className="bg-warm-ivory/50 border border-[--border-subtle] rounded-xl text-charcoal focus:border-burnt-orange"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject" className="block text-sm font-semibold text-charcoal mb-1.5">
                    Subject / Topic
                  </Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="General inquiry, Recruiter demo, or Feedback"
                    className="bg-warm-ivory/50 border border-[--border-subtle] rounded-xl text-charcoal focus:border-burnt-orange"
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="block text-sm font-semibold text-charcoal mb-1.5">
                    Message <span className="text-burnt-orange">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us what you need help with..."
                    className="bg-warm-ivory/50 border border-[--border-subtle] rounded-xl text-charcoal focus:border-burnt-orange resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-burnt-orange hover:bg-burnt-orange-hover text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-glow-orange flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  <span>{submitting ? 'Sending Message...' : 'Send Message'}</span>
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;
