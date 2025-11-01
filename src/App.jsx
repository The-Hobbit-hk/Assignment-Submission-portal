import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import AuthPanel from './components/AuthPanel';
import Dashboard from './components/Dashboard';
import { sampleData } from './data/sampleData';
import { loadData, saveData, loadUser, saveUser } from './utils/localStorage';

export default function App(){
  const [data, setData] = useState(()=>loadData(sampleData));
  const [user, setUser] = useState(()=>loadUser() || null);

  useEffect(()=>{ saveData(data); }, [data]);
  useEffect(()=>{ saveUser(user); }, [user]);

  function handleLogin(asUserId){
    const u = data.users.find(x=>x.id===asUserId);
    if(u) setUser(u);
  }
  function handleLogout(){
    setUser(null);
    localStorage.removeItem('joineazy_user_v1');
  }

  function updateAssignment(updated){
    const next = { ...data, assignments: data.assignments.map(a => (a.id === updated.id ? updated : a)) };
    setData(next);
  }

  function createAssignment(payload){
    const assignment = {
      id: 'a_' + Math.random().toString(36).slice(2,9),
      title: payload.title,
      description: payload.description,
      dueDate: payload.dueDate,
      createdBy: user.id,
      assignedTo: payload.assignedTo,
      submissions: {}
    };
    setData({ ...data, assignments: [assignment, ...data.assignments] });
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-7xl mx-auto p-4">
        <Header user={user} onLogout={handleLogout} />

        {!user ? (
          <AuthPanel users={data.users} onLogin={handleLogin} />
        ) : (
          <Dashboard data={data} user={user} onCreateAssignment={createAssignment} onUpdateAssignment={updateAssignment} />
        )}

        <Footer />
      </div>
    </div>
  );
}
