import React, { useState, useRef, useEffect } from 'react';
import Card from './Card';

export default function AuthPanel({ users, onLogin }) {
  const admins = users.filter((u) => u.role === 'admin');
  const students = users.filter((u) => u.role === 'student');
  const [selectedUser, setSelectedUser] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  // Focus input when modal appears
  const inputRef = useRef(null);
  useEffect(() => {
    if (selectedUser && inputRef.current) inputRef.current.focus();
  }, [selectedUser]);

  useEffect(() => {
    if (!selectedUser) setInputValue('');
  }, [selectedUser]);

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setInputValue('');
    setError('');
  };

  const handleCancel = () => {
    setSelectedUser(null);
    setInputValue('');
    setError('');
  };

  // For demo, professor password is 'profpass'
  const handleLogin = () => {
    if (!selectedUser) return;
    if (selectedUser.role === 'student') {
      if (inputValue.trim() === selectedUser.id) {
        onLogin(selectedUser.id);
        setSelectedUser(null);
        setInputValue('');
        setError('');
      } else {
        setError('Incorrect roll number.');
      }
    } else if (selectedUser.role === 'admin') {
      if (inputValue === 'profpass') {
        onLogin(selectedUser.id);
        setSelectedUser(null);
        setInputValue('');
        setError('');
      } else {
        setError('Incorrect password.');
      }
    }
  };

  // Allow Enter = OK, Esc = Cancel
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin();
    if (e.key === 'Escape') handleCancel();
  };

  // Overlay modal for user prompt
  const CredentialModal = () => (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 border relative">
        <button className="absolute top-2 right-3 text-xl font-bold text-gray-400 hover:text-red-400"
          onClick={handleCancel} aria-label="Close">×</button>
        <h2 className="text-lg font-semibold text-center mb-2">
          {selectedUser.role === 'student' ? `Student: ${selectedUser.name}` : `Admin: ${selectedUser.name}`}
        </h2>
        <div className="mb-3 text-center text-gray-500 text-sm">
  {selectedUser.role === 'student'
    ? 'Please enter your roll number to continue.'
    : 'Please enter your password.'}
</div>
{selectedUser.role === 'admin' && (
  <div className="mb-1 text-center text-xs text-blue-400 italic">
    (Hint: password is <span className="font-mono text-blue-600">profpass</span>)
  </div>
)}
{selectedUser.role === 'student' && (
  <div className="mb-1 text-center text-xs text-blue-400 italic">
    (Hint: roll number is <span className="font-mono text-blue-600">{selectedUser.id}</span>)
  </div>
)}
        <input
          ref={inputRef}
          type={selectedUser.role === 'admin' ? 'password' : 'text'}
          className="w-full mb-2 px-3 py-2 border-2 border-gray-200 rounded focus:border-blue-500 outline-none text-base"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={selectedUser.role === 'student' ? 'Roll number' : 'Password'}
          aria-label={selectedUser.role === 'student' ? 'Roll number' : 'Password'}
        />
        {error && <div className="mb-2 text-center text-sm text-red-600 font-medium animate-shake">{error}</div>}
        <div className="flex justify-end gap-3 mt-2">
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded bg-gray-100 text-gray-600 border hover:bg-gray-200 transition focus:outline-none"
          >Cancel</button>
          <button
            onClick={handleLogin}
            className="px-4 py-2 rounded bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition disabled:bg-blue-200"
            disabled={!inputValue}
          >Login</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-10">
      <Card>
        <h3 className="font-semibold text-lg mb-2">Login as Student</h3>
        <p className="text-sm text-gray-500 mb-4">Select your student account:</p>
        <div className="space-y-3">
          {students.map(s => (
            <div
              key={s.id}
              className={`overflow-hidden rounded-lg border transition shadow-sm group cursor-pointer ${selectedUser && selectedUser.id === s.id ? 'border-blue-400 ring-2 ring-blue-300 bg-blue-50' : 'border-gray-200 bg-white hover:shadow-md hover:border-blue-300'}`}
              onClick={() => !selectedUser && handleUserClick(s)}
              tabIndex={0}
              onKeyDown={e => (!selectedUser && (e.key === 'Enter') && handleUserClick(s))}
            >
              <div className="flex items-center px-4 py-3">
                <span className="flex-1 text-base font-medium text-gray-900">{s.name}</span>
                <span className="ml-2 text-xs bg-gray-100 rounded px-2 py-0.5 text-gray-600">{s.id}</span>
                <span className="ml-4 hidden group-hover:inline-block text-blue-500">→</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <h3 className="font-semibold text-lg mb-2">Login as Admin</h3>
        <p className="text-sm text-gray-500 mb-4">Select a professor to log in as admin:</p>
        <div className="space-y-3">
          {admins.map(a => (
            <div
              key={a.id}
              className={`overflow-hidden rounded-lg border transition shadow-sm group cursor-pointer ${selectedUser && selectedUser.id === a.id ? 'border-blue-400 ring-2 ring-blue-300 bg-blue-50' : 'border-gray-200 bg-white hover:shadow-md hover:border-blue-300'}`}
              onClick={() => !selectedUser && handleUserClick(a)}
              tabIndex={0}
              onKeyDown={e => (!selectedUser && e.key === 'Enter' && handleUserClick(a))}
            >
              <div className="flex items-center px-4 py-3">
                <span className="flex-1 text-base font-medium text-gray-900">{a.name}</span>
                <span className="ml-2 text-xs bg-yellow-100 rounded px-2 py-0.5 text-yellow-800">Admin</span>
                <span className="ml-4 hidden group-hover:inline-block text-blue-500">→</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
      {selectedUser && <CredentialModal />}
    </div>
  );
}
