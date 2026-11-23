import React, { useEffect, useState } from 'react';
import Navbar from '../shared/Navbar';
import Footer from '../shared/Footer';
import { motion } from 'framer-motion';
import { Input } from '../ui/input';
import { Avatar, AvatarImage } from '../ui/avatar';
import { Globe, MapPin, Search } from 'lucide-react';
import axios from 'axios';
import { COMPANY_API_END_POINT } from '@/utils/constant';

const CompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllCompanies = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${COMPANY_API_END_POINT}/all`, { withCredentials: true });
        if (res.data.success) {
          setCompanies(res.data.companies);
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllCompanies();
  }, []);

  const filteredCompanies = companies.filter((company) =>
    company.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-neu-base min-h-screen text-charcoal">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        {/* Header Section */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-neu-base text-burnt-orange text-xs font-bold uppercase tracking-wider mb-4 border border-white/40 shadow-neu-raised-xs">
            Employer Directory
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-charcoal mb-4 tracking-tight">
            Explore <span className="text-burnt-orange">Top Employers</span>
          </h1>
          <p className="text-charcoal-muted text-lg max-w-2xl mx-auto leading-relaxed">
            Discover companies actively hiring through HireHub. Explore their workspaces, mission, and open roles.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          className="max-w-md mx-auto mb-14"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-burnt-orange z-10" />
            <Input
              type="text"
              placeholder="Search by company name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-3.5 h-12 rounded-2xl text-base"
            />
          </div>
        </motion.div>

        {/* Companies Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-neu-base border border-white/30 rounded-neu p-6 h-56 shadow-neu-raised-xs animate-pulse">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-14 h-14 bg-neu-base-dark rounded-2xl shadow-neu-inset-xs"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-neu-base-dark rounded w-3/4"></div>
                    <div className="h-4 bg-neu-base-dark rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-4 bg-neu-base-dark rounded w-full mb-2"></div>
                <div className="h-4 bg-neu-base-dark rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="text-center py-20 bg-neu-base rounded-neu border border-white/30 shadow-neu-raised-sm p-8 max-w-lg mx-auto">
            <p className="text-lg font-bold text-charcoal mb-1">No companies found</p>
            <p className="text-sm text-charcoal-muted">Try adjusting your search query or check back later.</p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.08 }
              }
            }}
          >
            {filteredCompanies.map((company) => (
              <motion.div
                key={company.id}
                className="bg-neu-base border border-white/30 rounded-neu p-6 shadow-neu-raised-sm hover:shadow-neu-raised-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <div>
                  <div className="flex items-center space-x-4 mb-4">
                    <Avatar className="w-14 h-14 rounded-2xl border border-white/20 p-1 bg-neu-base shadow-neu-flat">
                      <AvatarImage src={company.logo} alt={company.name} className="object-cover rounded-xl" />
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-bold text-charcoal hover:text-burnt-orange transition-colors">
                        {company.name}
                      </h3>
                      {company.location && (
                        <p className="text-sm text-charcoal-muted flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3.5 w-3.5 text-burnt-orange" />
                          {company.location}
                        </p>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-charcoal-muted line-clamp-3 mb-6 leading-relaxed">
                    {company.description || 'This company has not added a description yet.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/20 flex items-center justify-between">
                  {company.website ? (
                    <a
                      href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-burnt-orange hover:text-burnt-orange-hover flex items-center gap-1.5 hover:underline"
                    >
                      <Globe className="h-4 w-4" />
                      Visit Website
                    </a>
                  ) : (
                    <span className="text-xs text-charcoal-dim">No website listed</span>
                  )}
                  <span className="text-xs px-2.5 py-1 rounded-full bg-neu-base text-lime-green-dark font-semibold shadow-neu-flat border border-lime-green/30">
                    Active Employer
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CompaniesPage;
