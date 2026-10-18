const User = require('./user');
const Company = require('./company');
const Job = require('./job');
const Application = require('./application');
const SavedJob = require('./savedJob');
const Resume = require('./resume');
const Interview = require('./interview');
const ChatHistory = require('./chatHistory');
const AiUsage = require('./aiUsage');

// Define associations after models are loaded

// Company <-- User
Company.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Company, { foreignKey: 'userId', as: 'companies' });

// Job <-- Company, Job <-- User (creator)
Job.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });
Job.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Company.hasMany(Job, { foreignKey: 'companyId', as: 'jobs' });
User.hasMany(Job, { foreignKey: 'createdBy', as: 'createdJobs' });

// Application <-- User, Application <-- Job
Application.belongsTo(User, { foreignKey: 'applicantId', as: 'applicant' });
User.hasMany(Application, { foreignKey: 'applicantId' });

Application.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });
Job.hasMany(Application, { foreignKey: 'jobId', as: 'applications' });

// SavedJob associations
SavedJob.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(SavedJob, { foreignKey: 'userId', as: 'savedJobs' });

SavedJob.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });
Job.hasMany(SavedJob, { foreignKey: 'jobId', as: 'savedApplications' });

// ============================================
// New AI Model Associations
// ============================================

// Resume <-- User
Resume.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Resume, { foreignKey: 'userId', as: 'resumes' });

// Interview <-- User, Interview <-- Job (optional)
Interview.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Interview, { foreignKey: 'userId', as: 'interviews' });
Interview.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });

// ChatHistory <-- User
ChatHistory.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(ChatHistory, { foreignKey: 'userId', as: 'chatMessages' });

// AiUsage <-- User
AiUsage.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(AiUsage, { foreignKey: 'userId', as: 'aiUsage' });

module.exports = { User, Company, Job, Application, SavedJob, Resume, Interview, ChatHistory, AiUsage };
