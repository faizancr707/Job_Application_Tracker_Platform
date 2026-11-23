import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { FiUploadCloud, FiCheck, FiAlertCircle, FiLoader } from 'react-icons/fi';
import axios from 'axios';
import { RESUME_API_END_POINT } from '../../utils/constant';
import { addResume, setError } from '../../redux/resumeSlice';
import { toast } from 'sonner';

const ResumeUpload = ({ onUploadComplete }) => {
  const dispatch = useDispatch();
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are accepted.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5MB.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    setStatus('uploading');

    try {
      setStatus('processing');
      const { data } = await axios.post(`${RESUME_API_END_POINT}/upload`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (data.success) {
        setStatus(data.data.status === 'ready' ? 'ready' : 'failed');
        dispatch(addResume(data.data));
        toast.success(data.message || 'Resume uploaded and analyzed successfully!');
        if (onUploadComplete) onUploadComplete(data.data);
      }
    } catch (err) {
      setStatus('failed');
      toast.error(err.response?.data?.message || 'Upload failed.');
      dispatch(setError(err.response?.data?.message));
    } finally {
      setUploading(false);
    }
  }, [dispatch, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: uploading,
  });

  const statusConfig = {
    uploading: {
      icon: <FiLoader className="animate-spin text-lg" />,
      text: 'Uploading file securely...',
      color: 'text-electric-600 bg-electric-50 border-electric-100',
    },
    processing: {
      icon: <FiLoader className="animate-spin text-lg" />,
      text: 'AI is analyzing your resume & extracting ATS keywords...',
      color: 'text-electric-600 bg-electric-50 border-electric-100',
    },
    ready: {
      icon: <FiCheck className="text-lg" />,
      text: 'Resume parsed & analyzed successfully!',
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    failed: {
      icon: <FiAlertCircle className="text-lg" />,
      text: 'Processing failed. You can re-upload or try again.',
      color: 'text-rose-700 bg-rose-50 border-rose-200',
    },
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-electric-500 bg-electric-50/50 scale-[0.99]'
            : 'border-slate-200 hover:border-electric-400 bg-white hover:bg-slate-50/50 shadow-sm'
        } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="w-14 h-14 mx-auto mb-3.5 rounded-2xl bg-electric-50 border border-electric-100 flex items-center justify-center text-electric-600 shadow-xs">
          <FiUploadCloud className="text-2xl" />
        </div>
        <p className="text-slate-800 font-extrabold text-base">
          {isDragActive ? 'Drop your resume PDF here...' : 'Upload your resume PDF'}
        </p>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          Drag and drop or browse from your device (PDF only, max 5MB)
        </p>
      </div>

      {status && statusConfig[status] && (
        <div
          className={`flex items-center justify-center gap-2 mt-4 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition ${statusConfig[status].color}`}
        >
          {statusConfig[status].icon}
          <span>{statusConfig[status].text}</span>
        </div>
      )}
    </motion.div>
  );
};

export default ResumeUpload;