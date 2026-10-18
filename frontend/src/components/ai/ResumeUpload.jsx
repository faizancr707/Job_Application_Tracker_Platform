import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { FiUploadCloud, FiFile, FiCheck, FiAlertCircle, FiLoader } from 'react-icons/fi';
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
    if (file.type !== 'application/pdf') { toast.error('Only PDF files are accepted.'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('File must be under 5MB.'); return; }

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
        toast.success(data.message);
        if (onUploadComplete) onUploadComplete(data.data);
      }
    } catch (err) {
      setStatus('failed');
      toast.error(err.response?.data?.message || 'Upload failed.');
      dispatch(setError(err.response?.data?.message));
    }
    setUploading(false);
  }, [dispatch, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1, disabled: uploading,
  });

  const statusConfig = {
    uploading: { icon: <FiLoader className="animate-spin" />, text: 'Uploading file...', color: 'text-burnt-orange' },
    processing: { icon: <FiLoader className="animate-spin" />, text: 'AI is analyzing your resume...', color: 'text-burnt-orange' },
    ready: { icon: <FiCheck />, text: 'Resume parsed & analyzed successfully!', color: 'text-lime-green-dark' },
    failed: { icon: <FiAlertCircle />, text: 'Processing failed. Please try again.', color: 'text-terracotta' },
  };

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-burnt-orange bg-burnt-orange-light shadow-sm'
            : 'border-[--border-subtle] hover:border-burnt-orange/60 bg-warm-ivory/40'
        } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="w-14 h-14 mx-auto mb-3.5 rounded-full bg-burnt-orange-light border border-burnt-orange/20 flex items-center justify-center text-burnt-orange">
          <FiUploadCloud className="text-2xl" />
        </div>
        <p className="text-charcoal font-bold text-base">
          {isDragActive ? 'Drop your resume here...' : 'Upload your resume PDF'}
        </p>
        <p className="text-charcoal-muted text-sm mt-1">Drag and drop or click to browse files (PDF only, max 5MB)</p>
      </div>

      {status && (
        <div className={`flex items-center justify-center gap-2 mt-4 text-sm font-semibold ${statusConfig[status].color}`}>
          {statusConfig[status].icon}
          <span>{statusConfig[status].text}</span>
        </div>
      )}
    </motion.div>
  );
};

export default ResumeUpload;
