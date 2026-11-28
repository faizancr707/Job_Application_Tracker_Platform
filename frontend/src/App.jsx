import React, { useEffect } from 'react'
import { createBrowserRouter, RouterProvider, Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './components/shared/Navbar'
import Login from './components/auth/Login'
import Signup from './components/auth/Signup'
import Home from './components/Home'
import Jobs from './components/Jobs'
import Browse from './components/Browse'
import Profile from './components/Profile'
import JobDescription from './components/JobDescription'
import Companies from './components/admin/Companies'
import CompanyCreate from './components/admin/CompanyCreate'
import CompanySetup from './components/admin/CompanySetup'
import AdminJobs from "./components/admin/AdminJobs"
import PostJob from './components/admin/PostJob'
import Applicants from './components/admin/Applicants'
import ProtectedRoute from './components/admin/ProtectedRoute'
import UserProtectedRoute from './components/shared/UserProtectedRoute'
import UpdateJobs from './components/admin/UpdateJobs'
import CompaniesPage from './components/companies/CompaniesPage'
import CareersPage from './components/careers/CareersPage'
import ContactPage from './components/contact/ContactPage'

// AI Pages & Floating Copilot
import CopilotChat from './components/ai/CopilotChat'
import ResumeAnalysis from './components/ai/ResumeAnalysis'
import InterviewPrep from './components/ai/InterviewPrep'
import SemanticSearch from './components/ai/SemanticSearch'
import SkillGapAnalysis from './components/ai/SkillGapAnalysis'
import DashboardInsights from './components/ai/DashboardInsights'
import JobApplicationTracker from './components/tracker/JobApplicationTracker'
import FloatingCopilot from './components/ai/FloatingCopilot'

import './App.css'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

const pageTransition = {
  duration: 0.28,
  ease: [0.22, 1, 0.36, 1],
};

const RootLayout = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen bg-neu-base overflow-x-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
          className="w-full min-h-screen flex flex-col"
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
      <FloatingCopilot />
    </div>
  );
};

const appRouter = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <Home />
      },
      {
        path: '/login',
        element: <Login />
      },
      {
        path: '/signup',
        element: <Signup />
      },
      {
        path: '/jobs',
        element: <Jobs />
      },
      {
        path: '/description/:id',
        element: <JobDescription />
      },
      {
        path: '/browse',
        element: <Browse />
      },
      {
        path: '/profile',
        element: <UserProtectedRoute><Profile /></UserProtectedRoute>
      },
      {
        path: '/admin/companies',
        element: <ProtectedRoute><Companies /></ProtectedRoute>
      },
      {
        path: '/admin/companies/create',
        element: <ProtectedRoute><CompanyCreate /></ProtectedRoute>
      },
      {
        path: '/admin/companies/:id',
        element: <ProtectedRoute><CompanySetup /></ProtectedRoute>
      },
      {
        path: '/admin/jobs',
        element: <ProtectedRoute><AdminJobs /></ProtectedRoute>
      },
      {
        path: '/admin/jobs/create',
        element: <ProtectedRoute><PostJob /></ProtectedRoute>
      },
      {
        path: '/admin/jobs/:id/applicants',
        element: <ProtectedRoute><Applicants /></ProtectedRoute>
      },
      {
        path: '/admin/jobs/:id/update',
        element: <ProtectedRoute><UpdateJobs /></ProtectedRoute>
      },
      {
        path: '/companies',
        element: <CompaniesPage />
      },
      {
        path: '/careers',
        element: <CareersPage />
      },
      {
        path: '/contact',
        element: <ContactPage />
      },
      // AI Routes
      {
        path: '/ai/copilot',
        element: <UserProtectedRoute><CopilotChat /></UserProtectedRoute>
      },
      {
        path: '/ai/resumes',
        element: <UserProtectedRoute><ResumeAnalysis /></UserProtectedRoute>
      },
      {
        path: '/ai/interviews',
        element: <UserProtectedRoute><InterviewPrep /></UserProtectedRoute>
      },
      {
        path: '/ai/search',
        element: <UserProtectedRoute><SemanticSearch /></UserProtectedRoute>
      },
      {
        path: '/ai/skill-gap',
        element: <UserProtectedRoute><SkillGapAnalysis /></UserProtectedRoute>
      },
      {
        path: '/ai/dashboard',
        element: <UserProtectedRoute><JobApplicationTracker /></UserProtectedRoute>
      },
      {
        path: '/tracker',
        element: <UserProtectedRoute><JobApplicationTracker /></UserProtectedRoute>
      },
      {
        path: '/applications',
        element: <UserProtectedRoute><JobApplicationTracker /></UserProtectedRoute>
      }
    ],
  },
]);

function App() {
  return (
    <div className='app'>
      <RouterProvider router={appRouter} />
    </div>
  )
}

export default App
