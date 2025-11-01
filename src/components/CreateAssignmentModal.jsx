import React, { useState } from 'react';

export default function CreateAssignmentModal({ users, onClose, onCreate }) {
  const [title,setTitle] = useState('');
  const [desc,setDesc] = useState('');
  const [dueDate,setDueDate] = useState('');
  const [assignedTo,setAssignedTo] = useState(users.map(u=>u.id));

  function toggleStudent(id){
    setAssignedTo(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev,id]);
  }

  function submit(){
    if(!title||!dueDate) return alert('Please fill title and due date');
    onCreate({ title, description: desc, dueDate, assignedTo });
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="w-full max-w-2xl bg-white rounded p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Create Assignment</h3>
          <button className="text-gray-500" onClick={onClose}>Close</button>
        </div>
        <div className="mt-4 space-y-3">
          <input className="w-full border rounded p-2" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
          <textarea className="w-full border rounded p-2" placeholder="Description" value={desc} onChange={e=>setDesc(e.target.value)} rows={3} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input type="date" className="border rounded p-2" value={dueDate} onChange={e=>setDueDate(e.target.value)} />
            <input className="border rounded p-2" placeholder="Optional: Drive link for submissions" />
          </div>

          <div>
            <div className="text-sm text-gray-600">Assign to students</div>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
              {users.map(s=>(
                <label key={s.id} className="flex items-center gap-2 p-2 border rounded">
                  <input type="checkbox" checked={assignedTo.includes(s.id)} onChange={()=>toggleStudent(s.id)} />
                  <div className="text-sm">{s.name}</div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button className="px-3 py-1" onClick={onClose}>Cancel</button>
            <button className="px-3 py-1 bg-indigo-600 text-white rounded" onClick={submit}>Create</button>
          </div>
        </div>
      </div>
    </div>
  );
}
