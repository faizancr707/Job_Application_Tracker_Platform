import { Twitter, Linkedin, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-neu-base border-t border-white/20 text-charcoal relative">
      {/* Accent gradient bar */}
      <div className="h-1 w-full bg-gradient-to-r from-burnt-orange via-lime-green to-burnt-orange opacity-80"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-charcoal">About HireHub</h3>
            <p className="text-charcoal-muted text-sm leading-relaxed">
              Connecting talented professionals with innovative companies worldwide. Powered by intelligent AI matching in a modern soft UI interface.
            </p>
          </div>

          {/* Quick Links Section */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-charcoal">Quick Links</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/jobs" className="text-charcoal-dim hover:text-burnt-orange transition font-medium">
                  Find Jobs
                </Link>
              </li>
              <li>
                <Link to="/companies" className="text-charcoal-dim hover:text-burnt-orange transition font-medium">
                  Companies
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-charcoal-dim hover:text-burnt-orange transition font-medium">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-charcoal-dim hover:text-burnt-orange transition font-medium">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Section */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-charcoal">AI Resources</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/ai/copilot" className="text-charcoal-dim hover:text-burnt-orange transition font-medium">
                  AI Career Copilot
                </Link>
              </li>
              <li>
                <Link to="/ai/resumes" className="text-charcoal-dim hover:text-burnt-orange transition font-medium">
                  Resume Analyzer
                </Link>
              </li>
              <li>
                <Link to="/ai/skill-gap" className="text-charcoal-dim hover:text-burnt-orange transition font-medium">
                  Skill Gap Analysis
                </Link>
              </li>
              <li>
                <Link to="/ai/interviews" className="text-charcoal-dim hover:text-burnt-orange transition font-medium">
                  Interview Prep
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect With Us Section */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-charcoal">Connect With Us</h3>
            <div className="flex space-x-3 mb-4">
              <a href="https://faizan-alam-sde-portfolio.vercel.app/" target="_blank" rel="noreferrer" className="p-2.5 rounded-xl bg-neu-base shadow-neu-flat border border-white/30 text-charcoal-dim hover:text-burnt-orange hover:shadow-neu-raised-xs transition" aria-label="Portfolio">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="https://www.linkedin.com/in/faizan-alam-06897a20b/" target="_blank" rel="noreferrer" className="p-2.5 rounded-xl bg-neu-base shadow-neu-flat border border-white/30 text-charcoal-dim hover:text-burnt-orange hover:shadow-neu-raised-xs transition" aria-label="LinkedIn">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="https://www.instagram.com/in/faizanalamasharafi/" target="_blank" rel="noreferrer" className="p-2.5 rounded-xl bg-neu-base shadow-neu-flat border border-white/30 text-charcoal-dim hover:text-burnt-orange hover:shadow-neu-raised-xs transition" aria-label="Instagram">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
            <p className="text-xs text-charcoal-dim">
              Intelligent Job Tracking Platform &bull; Soft UI Edition
            </p>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-10 pt-6 border-t border-white/15 flex flex-col sm:flex-row justify-between items-center text-xs text-charcoal-dim gap-2">
          <p>© {new Date().getFullYear()} HireHub. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Crafted with Soft Dual Shadows &bull; Burnt Orange &bull; Lime Green
          </p>
        </div>
      </div>
    </footer>
  );
}
