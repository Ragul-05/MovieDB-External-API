import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, User, Mail, Lock, Loader2 } from 'lucide-react';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        currentPassword: '',
        newPassword: '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (field) => (event) => {
        setFormData((prev) => ({ ...prev, [field]: event.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const response = await authService.updateProfile(formData);
            updateUser(response.data, response.data.token);
            setFormData((prev) => ({
                ...prev,
                name: response.data.name,
                email: response.data.email,
                currentPassword: '',
                newPassword: '',
            }));
            setSuccess('Profile updated successfully.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="mx-auto max-w-3xl px-6 py-24">
            <div className="mb-10">
                <h1 className="text-4xl font-extrabold tracking-tight text-dark">Profile Settings</h1>
                <p className="mt-2 text-lg text-gray-500">Update your account details and keep your profile current.</p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm"
            >
                {error && (
                    <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Field label="Full Name" icon={<User size={18} />} value={formData.name} onChange={handleChange('name')} type="text" />
                    <Field label="Email Address" icon={<Mail size={18} />} value={formData.email} onChange={handleChange('email')} type="email" />
                    <Field
                        label="Current Password"
                        icon={<Lock size={18} />}
                        value={formData.currentPassword}
                        onChange={handleChange('currentPassword')}
                        type="password"
                        placeholder="Required only if changing password"
                    />
                    <Field
                        label="New Password"
                        icon={<Lock size={18} />}
                        value={formData.newPassword}
                        onChange={handleChange('newPassword')}
                        type="password"
                        placeholder="Leave blank to keep current password"
                    />

                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex w-full items-center justify-center rounded-2xl bg-primary px-5 py-3 font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} className="mr-2" />}
                        {saving ? 'Saving Changes...' : 'Save Changes'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

const Field = ({ label, icon, ...props }) => (
    <div>
        <label className="mb-2 block text-sm font-bold text-gray-700">{label}</label>
        <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>
            <input
                {...props}
                className="w-full rounded-2xl bg-gray-50 py-3 pl-12 pr-4 text-sm text-dark ring-1 ring-gray-200 transition-all focus:ring-2 focus:ring-primary"
            />
        </div>
    </div>
);

export default Profile;
