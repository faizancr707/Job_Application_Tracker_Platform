
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const saveFileLocally = require('../utils/localFileStorage');

// @desc Register new user
exports.register = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, password, role } = req.body;

    if (!fullname || !email || !phoneNumber || !password || !role) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    const normalizedRole = role.toLowerCase().trim();
    if (!['student', 'recruiter'].includes(normalizedRole)) {
      return res.status(400).json({
        message: "Role must be either 'student' or 'recruiter'.",
        success: false,
      });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email.",
        success: false,
      });
    }

    let imageUrl = null;
    if (req.file) {
      imageUrl = await saveFileLocally(req.file.buffer, req.file.originalname, req.file.mimetype);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullname,
      email,
      phoneNumber,
      password: hashedPassword,
      role: normalizedRole,
      profilePhoto: imageUrl,
    });

    return res.status(201).json({
      message: "Account created successfully.",
      success: true,
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        profile: {
          profilePhoto: user.profilePhoto,
          bio: user.bio,
          skills: user.skills || [],
          resume: user.resume,
          resumeOriginalName: user.resumeOriginalName,
        }
      },
    });
  } catch (error) {
    console.error("❌ Signup Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc Login user
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({
        message: "Incorrect email or password.",
        success: false,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Incorrect email or password.",
        success: false,
      });
    }

    const dbRole = user.role?.trim().toLowerCase();
    const reqRole = role?.trim().toLowerCase();

    if (dbRole !== reqRole) {
      return res.status(400).json({
        message: "Account doesn't exist with selected role.",
        success: false,
      });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      })
      .json({
        message: `Welcome back ${user.fullname}`,
        success: true,
        user: {
          id: user.id,
          fullname: user.fullname,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          profile: {
            profilePhoto: user.profilePhoto,
            bio: user.bio,
            skills: user.skills || [],
            resume: user.resume,
            resumeOriginalName: user.resumeOriginalName,
          }
        },
      });
  } catch (error) {
    console.error("❌ Login Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc Logout user
exports.logout = async (req, res) => {
  try {
    return res
      .status(200)
      .cookie("token", "", { maxAge: 0 })
      .json({
        message: "Logged out successfully.",
        success: true,
      });
  } catch (error) {
    console.error("❌ Logout Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, bio, skills } = req.body;
    const file = req.file;
    const userId = req.id; // injected from auth middleware

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
        success: false,
      });
    }

    let resumeUrl = null;
    let resumeName = null;
    if (file) {
      resumeUrl = await saveFileLocally(file.buffer, file.originalname, file.mimetype);
      resumeName = file.originalname;
    }

    await user.update({
      fullname: fullname || user.fullname,
      email: email || user.email,
      phoneNumber: phoneNumber || user.phoneNumber,
      bio: bio || user.bio,
      skills: skills ? skills.split(',').map(s => s.trim()) : user.skills,
      resume: resumeUrl || user.resume,
      resumeOriginalName: resumeName || user.resumeOriginalName,
    });

    return res.status(200).json({
      message: "Profile updated successfully.",
      success: true,
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        profile: {
          profilePhoto: user.profilePhoto,
          bio: user.bio,
          skills: user.skills || [],
          resume: user.resume,
          resumeOriginalName: user.resumeOriginalName,
        }
      },
    });
  } catch (error) {
    console.error("❌ Profile Update Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// POST /api/v1/user/savedjob - Toggle saved job
exports.toggleSavedJob = async (req, res) => {
  try {
    // Disable client-side and browser caching for saved jobs
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const userId = req.id;
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({
        message: "Job ID is required.",
        success: false,
      });
    }

    const { SavedJob, Job, Company } = require('../models/assosiations');

    const existing = await SavedJob.findOne({ where: { userId, jobId } });
    let message = "";
    if (existing) {
      await existing.destroy();
      message = "Job removed from saved list.";
    } else {
      await SavedJob.create({ userId, jobId });
      message = "Job saved successfully.";
    }

    const savedRecords = await SavedJob.findAll({
      where: { userId },
      include: [{
        model: Job,
        as: 'job',
        include: [{ model: Company, as: 'company' }]
      }]
    });

    const savedJobs = savedRecords.map(record => record.job).filter(Boolean);

    return res.status(200).json({
      message,
      savedJobs,
      success: true,
    });
  } catch (error) {
    console.error("❌ Toggle Saved Job Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// GET /api/v1/user/savedjob - Get saved jobs
exports.getSavedJobs = async (req, res) => {
  try {
    // Disable client-side and browser caching for saved jobs
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const userId = req.id;
    const { SavedJob, Job, Company } = require('../models/assosiations');

    const savedRecords = await SavedJob.findAll({
      where: { userId },
      include: [{
        model: Job,
        as: 'job',
        include: [{ model: Company, as: 'company' }]
      }]
    });

    const savedJobs = savedRecords.map(record => record.job).filter(Boolean);

    return res.status(200).json({
      savedJobs,
      success: true,
    });
  } catch (error) {
    console.error("❌ Get Saved Jobs Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};