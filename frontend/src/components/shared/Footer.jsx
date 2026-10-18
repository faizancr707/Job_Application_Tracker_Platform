import { Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-warm-ivory-dark border-t border-[--border-subtle] text-charcoal relative">
      {/* Accent gradient bar */}
      <div className="h-1 w-full bg-gradient-to-r from-burnt-orange via-lime-green to-burnt-orange"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-dark-charcoal">About HireHub</h3>
            <p className="text-warm-charcoal text-sm leading-relaxed">
              Connecting talented professionals with innovative companies worldwide. Powered by intelligent AI matching.
            </p>
          </div>

          {/* Quick Links Section */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-dark-charcoal">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/jobs" className="text-muted-brown hover:text-burnt-orange transition font-medium">
                  Find Jobs
                </Link>
              </li>
              <li>
                <Link to="/companies" className="text-muted-brown hover:text-burnt-orange transition font-medium">
                  Companies
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-brown hover:text-burnt-orange transition font-medium">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-brown hover:text-burnt-orange transition font-medium">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Section */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-dark-charcoal">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/ai/copilot" className="text-muted-brown hover:text-burnt-orange transition font-medium">
                  AI Career Copilot
                </Link>
              </li>
              <li>
                <Link to="/ai/resumes" className="text-muted-brown hover:text-burnt-orange transition font-medium">
                  Resume Analyzer
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-muted-brown hover:text-burnt-orange transition font-medium">
                  Careers at HireHub
                </Link>
              </li>
              <li>
                <Link to="/ai/interviews" className="text-muted-brown hover:text-burnt-orange transition font-medium">
                  Interview Prep
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect With Us Section */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-dark-charcoal">Connect With Us</h3>
            <div className="flex space-x-3 mb-4">
              <a href="https://faizan-alam-sde-portfolio.vercel.app/" className="p-2 rounded-full bg-white border border-[--border-subtle] text-muted-brown hover:text-burnt-orange hover:border-burnt-orange transition" aria-label="Twitter">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="https://www.linkedin.com/in/faizan-alam-06897a20b/" className="p-2 rounded-full bg-white border border-[--border-subtle] text-muted-brown hover:text-burnt-orange hover:border-burnt-orange transition" aria-label="LinkedIn">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="https://www.instagram.com/in/faizanalamasharafi/" className="p-2 rounded-full bg-white border border-[--border-subtle] text-muted-brown hover:text-burnt-orange hover:border-burnt-orange transition" aria-label="Instagram">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
            <p className="text-xs text-muted-brown">
              Premium Job Tracking & AI Career Copilot
            </p>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-8 pt-8 border-t border-[--border-subtle] flex flex-col sm:flex-row justify-between items-center text-xs text-muted-brown gap-2">
          <p>© {new Date().getFullYear()} HireHub. All rights reserved.</p>
          <p>Crafted with Warm Ivory, Burnt Orange & Lime Green</p>
        </div>
      </div>
    </footer>
  );
}