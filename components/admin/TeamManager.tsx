import React, { useEffect, useState } from 'react';
import { Crown, Loader, Mail, Shield, Trash2, UserPlus } from 'lucide-react';
import { apiFetch } from '../../lib/api';

interface TeamMember {
  email: string;
  role: 'OWNER' | 'ADMIN';
  status: 'INVITED' | 'ACTIVE';
  invitedByEmail: string;
  createdAt: string;
}

/** Owner-only screen: grant or remove admin access by email. */
const TeamManager: React.FC = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [email, setEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [confirmingEmail, setConfirmingEmail] = useState<string | null>(null);
  const [removingEmail, setRemovingEmail] = useState<string | null>(null);

  const loadMembers = async () => {
    try {
      setMembers(await apiFetch<TeamMember[]>('/team'));
      setError('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setError('');
    setNotice('');
    try {
      const member = await apiFetch<TeamMember>('/team', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim() }),
      });
      setEmail('');
      setNotice(
        member.status === 'ACTIVE'
          ? `${member.email} is now an admin. They may need to sign out and back in.`
          : `Invite saved. ${member.email} becomes an admin the first time they sign in with that verified email.`,
      );
      await loadMembers();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (memberEmail: string) => {
    setRemovingEmail(memberEmail);
    setError('');
    setNotice('');
    try {
      await apiFetch<void>(`/team/${encodeURIComponent(memberEmail)}`, { method: 'DELETE' });
      setNotice(`${memberEmail} no longer has admin access and has been signed out.`);
      await loadMembers();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setRemovingEmail(null);
      setConfirmingEmail(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Shield size={24} /> Team &amp; Admin Access
      </h2>
      <p className="text-sm text-gray-500 mt-1 mb-6">
        Give admin access by email. Each person signs in with their own account; never share passwords.
      </p>

      <form onSubmit={handleAdd} className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Mail size={18} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="staff@example.com"
            className="w-full border border-gray-200 rounded-lg pl-10 pr-3 py-2.5 text-sm outline-none focus:border-brand-black"
          />
        </div>
        <button
          type="submit"
          disabled={adding}
          className="bg-brand-black text-white px-4 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-gold-600 transition disabled:opacity-60"
        >
          {adding ? <Loader size={16} className="animate-spin" /> : <UserPlus size={16} />} Add admin
        </button>
      </form>

      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-lg mb-4">{error}</div>}
      {notice && <div className="text-sm text-green-700 bg-green-50 border border-green-100 p-3 rounded-lg mb-4">{notice}</div>}

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {loading ? (
          <div className="p-6 text-center text-sm text-gray-500">Loading team…</div>
        ) : members.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500">No team members yet.</div>
        ) : (
          members.map((member) => (
            <div key={member.email} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">{member.email}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {member.role === 'OWNER' ? 'Owner' : `Added by ${member.invitedByEmail}`}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {member.role === 'OWNER' ? (
                  <span className="text-xs font-bold px-2 py-1 rounded-full bg-gold-50 text-gold-700 flex items-center gap-1">
                    <Crown size={12} /> Owner
                  </span>
                ) : (
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full ${
                      member.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                    }`}
                  >
                    {member.status === 'ACTIVE' ? 'Active admin' : 'Invite pending'}
                  </span>
                )}

                {member.role !== 'OWNER' &&
                  (confirmingEmail === member.email ? (
                    <>
                      <button
                        onClick={() => handleRemove(member.email)}
                        disabled={removingEmail === member.email}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                      >
                        {removingEmail === member.email ? 'Removing…' : 'Confirm remove'}
                      </button>
                      <button
                        onClick={() => setConfirmingEmail(null)}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setConfirmingEmail(member.email)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                      aria-label={`Remove ${member.email}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TeamManager;
