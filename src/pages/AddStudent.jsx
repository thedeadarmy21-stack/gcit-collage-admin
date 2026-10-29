import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../config';

const AddStudent = () => {
  const [formData, setFormData] = useState({
    name: '', rollNumber: '', className: '', section: 'A', fatherName: '', fatherWhatsApp: '', fatherEmail: ''
  });
  const [image, setImage] = useState(null); 
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🚀 IMAGE COMPRESSION LOGIC
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800; // 🚀 Width limit
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // 🚀 70% Quality (Size kam ho jayega)
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7); 
          
          setImage(compressedBase64); 
          setPreview(compressedBase64); 
        };
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const dataToSend = { ...formData, photoBase64: image }; 

      await axios.post(`${API_BASE}/api/students/add`, dataToSend, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/students');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add student.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800/80 backdrop-blur-lg p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors duration-300">
      <div className="mb-8">
        <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white">Add New Student</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Enter details & upload photo for Face Recognition.</p>
      </div>

      {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 text-sm font-bold border border-red-100 dark:border-red-800 flex items-center gap-2"><span>⚠️</span>{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* 🚀 PHOTO UPLOAD SECTION */}
        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
          <div className="h-24 w-24 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden mb-4 shadow-inner border-2 border-green-500">
            {preview ? (
              <img src={preview} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <span className="text-3xl text-slate-400">👤</span>
            )}
          </div>
          <label className="cursor-pointer bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-700 transition">
            Upload Student Photo
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
          <p className="text-xs text-slate-500 mt-2">Clear face photo (Auto-compressed for upload)</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
            <input type="text" name="name" required onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-800 dark:text-white transition-all" placeholder="Enter full name" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Roll Number</label>
            <input type="text" name="rollNumber" required onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-800 dark:text-white transition-all" placeholder="Enter roll number" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Class</label>
            <input type="text" name="className" required onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-800 dark:text-white transition-all" placeholder="Enter class" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Section</label>
            <input type="text" name="section" value={formData.section} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-800 dark:text-white transition-all" placeholder="Enter section" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Father Name</label>
            <input type="text" name="fatherName" required onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-800 dark:text-white transition-all" placeholder="Enter father name" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Father Email (Gmail)</label>
            <input type="email" name="fatherEmail" required onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-800 dark:text-white transition-all" placeholder="Enter email address" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">WhatsApp No. <span className="text-slate-400 dark:text-slate-500 font-normal">(Optional)</span></label>
            <input type="text" name="fatherWhatsApp" onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-800 dark:text-white transition-all" placeholder="Enter WhatsApp number" />
          </div>
        </div>
        
        <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
          <button type="submit" disabled={loading} className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-600/30 flex justify-center items-center gap-2">
            {loading ? (
              <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Saving...</>
            ) : (
              <>➕ Add Student & Generate QR</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStudent;