import React from 'react';
import Navbar from '../shared/Navbar';
import Footer from '../shared/Footer';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Briefcase, MapPin, Users, Zap, Heart, Star } from 'lucide-react';

const mockCareers = [
  {
    id: 1,
    title: 'Senior Frontend Engineer (React)',
    department: 'Engineering',
    location: 'Remote, India',
    type: 'Full-Time',
  },
  {
    id: 2,
    title: 'Full Stack Developer (Node/React)',
    department: 'Engineering',
    location: 'Hybrid, Mumbai',
    type: 'Full-Time',
  },
  {
    id: 3,
    title: 'Product Designer (UX/UI)',
    department: 'Design',
    location: 'Remote',
    type: 'Full-Time',
  },
  {
    id: 4,
    title: 'DevOps & Cloud Engineer',
    department: 'Infrastructure',
    location: 'Remote',
    type: 'Contract / Full-Time',
  }
];

const CareersPage = () => {
  return (
    <div className="bg-warm-ivory min-h-screen text-charcoal">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-burnt-orange-light text-burnt-orange text-xs font-bold uppercase tracking-wider mb-4 border border-burnt-orange/20">
            We are hiring
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold mb-6 tracking-tight text-charcoal">
            Build the Future of <br className="hidden sm:block" />
            <span className="text-burnt-orange">
              Recruitment Technology
            </span>
          </h1>
          <p className="text-charcoal-muted text-lg sm:text-xl max-w-3xl mx-auto font-normal leading-relaxed">
            At HireHub, we believe in empowering builders, thinkers, and creators to connect global talent with their dream careers. Join our remote-first, high-performing team.
          </p>
        </motion.div>

        {/* Core Values Section */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card className="bg-white border border-[--border-subtle] p-8 flex flex-col items-center text-center rounded-2xl shadow-warm-sm hover:shadow-warm-md transition">
            <div className="p-4 bg-burnt-orange-light rounded-2xl mb-4 text-burnt-orange">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-charcoal mb-2">High Impact</h3>
            <p className="text-charcoal-muted text-sm leading-relaxed">
              Every line of code you write and feature you design impacts millions of job seekers and hiring managers globally.
            </p>
          </Card>

          <Card className="bg-white border border-[--border-subtle] p-8 flex flex-col items-center text-center rounded-2xl shadow-warm-sm hover:shadow-warm-md transition">
            <div className="p-4 bg-lime-green-light rounded-2xl mb-4 text-lime-green-dark">
              <Heart className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-charcoal mb-2">Empathy & Inclusivity</h3>
            <p className="text-charcoal-muted text-sm leading-relaxed">
              We collaborate with trust, respect, and diversity across different timezones, cultures, and skills.
            </p>
          </Card>

          <Card className="bg-white border border-[--border-subtle] p-8 flex flex-col items-center text-center rounded-2xl shadow-warm-sm hover:shadow-warm-md transition">
            <div className="p-4 bg-warm-ivory-dark rounded-2xl mb-4 text-burnt-orange">
              <Star className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-charcoal mb-2">Continuous Learning</h3>
            <p className="text-charcoal-muted text-sm leading-relaxed">
              Generous education stipends, mentorship, and growth budgets to push your craft and career forward.
            </p>
          </Card>
        </motion.div>

        {/* Open Positions */}
        <div className="max-w-4xl mx-auto">
          <motion.h2
            className="text-3xl font-extrabold text-charcoal mb-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Current Open Roles
          </motion.h2>

          <motion.div
            className="space-y-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              }
            }}
          >
            {mockCareers.map((career) => (
              <motion.div
                key={career.id}
                className="bg-white border border-[--border-subtle] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:border-burnt-orange/50 hover:shadow-warm-md transition-all duration-300 gap-4"
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <div>
                  <h3 className="text-xl font-bold text-charcoal">{career.title}</h3>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-charcoal-muted">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Briefcase className="h-4 w-4 text-burnt-orange" />
                      {career.department}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <MapPin className="h-4 w-4 text-burnt-orange" />
                      {career.location}
                    </span>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-warm-ivory-dark text-xs font-semibold text-charcoal border border-[--border-subtle]">
                      {career.type}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => alert(`Thank you for your interest in the ${career.title} position! Please send your resume to careers@hirehub.com`)}
                  className="bg-burnt-orange hover:bg-burnt-orange-hover text-white font-semibold rounded-xl shrink-0 shadow-sm"
                >
                  Apply Now
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CareersPage;
