import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Phone, Mail, LogOut, Package, Edit2, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { notify } from '../components/ui/Toaster';
import { usePageTitle } from '../lib/usePageTitle';

const ProfilePage: React.FC = () => {
  const { user, logout, updateProfile, loading } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    mobile: user?.mobile || ''
  });
  usePageTitle('My Account');

  useEffect(() => {
    setFormData({
      name: user?.name || '',
      mobile: user?.mobile || ''
    });
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      notify('Please enter your name.', 'error');
      return;
    }
    if (formData.mobile && !/^\d{10}$/.test(formData.mobile)) {
      notify('Please enter a 10-digit mobile number.', 'error');
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ name: formData.name, mobile: formData.mobile });
      setIsEditing(false);
      notify('Profile saved.', 'success');
    } catch {
      notify('Could not save your profile. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">My Account</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Profile Card */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
               <div className="flex justify-between items-start mb-6">
                 <div className="w-16 h-16 bg-gold-50 rounded-full flex items-center justify-center text-gold-600">
                    <User size={32} />
                 </div>
                 {!isEditing ? (
                   <button onClick={() => setIsEditing(true)} aria-label="Edit profile" className="text-gray-400 hover:text-brand-black"><Edit2 size={18}/></button>
                 ) : (
                   <div className="flex gap-2">
                     <button onClick={() => setIsEditing(false)} aria-label="Cancel editing" className="text-red-400 hover:text-red-600"><X size={18}/></button>
                     <button onClick={handleSave} disabled={saving} aria-label="Save profile" className="text-green-600 hover:text-green-700 disabled:opacity-50"><Save size={18}/></button>
                   </div>
                 )}
               </div>

               <div className="space-y-4">
                 <div>
                   <label className="text-xs font-bold text-gray-400 uppercase">Name</label>
                   {isEditing ? (
                     <input 
                       type="text" 
                       value={formData.name} 
                       onChange={(e) => setFormData({...formData, name: e.target.value})}
                       className="w-full border-b border-gold-500 focus:outline-none py-1 font-bold text-gray-900"
                     />
                   ) : (
                     <p className="font-bold text-gray-900 text-lg">{user.name}</p>
                   )}
                 </div>
                 
                 <div>
                   <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1"><Phone size={10} /> Mobile</label>
                   {isEditing ? (
                     <input
                       type="tel"
                       inputMode="numeric"
                       maxLength={10}
                       value={formData.mobile}
                       onChange={(e) => setFormData({...formData, mobile: e.target.value.replace(/\D/g, '')})}
                       className="w-full border-b border-gold-500 focus:outline-none py-1 font-medium text-gray-700"
                       placeholder="10-digit mobile number"
                     />
                   ) : (
                     <p className="font-medium text-gray-700">{user.mobile || 'Not Provided'}</p>
                   )}
                 </div>

                 <div>
                   <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1"><Mail size={10} /> Email</label>
                   {/* The sign-in email can't be changed here. */}
                   <p className="font-medium text-gray-700">{user.email || 'Not Provided'}</p>
                 </div>
               </div>

               <button 
                 onClick={handleLogout}
                 className="mt-8 w-full py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 flex items-center justify-center gap-2 text-sm font-bold"
               >
                 <LogOut size={16} /> Logout
               </button>
            </div>
          </div>

          {/* Order History */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
               <div className="p-6 border-b border-gray-100 flex items-center gap-2">
                  <Package size={20} className="text-gold-600" />
                  <h2 className="font-bold text-lg text-gray-900">Order History</h2>
               </div>
               
               <div className="p-8 text-center text-gray-500">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Package size={24} className="opacity-50" />
                  </div>
                  <p className="mb-2 font-medium">No orders yet</p>
                  <p className="text-sm">When you place orders, they will appear here.</p>
                  <button onClick={() => navigate('/collections')} className="mt-4 text-gold-600 font-bold hover:underline">Start Shopping</button>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;