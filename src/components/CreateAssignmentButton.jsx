import React, { useState } from 'react';
import CreateAssignmentModal from './CreateAssignmentModal';

export default function CreateAssignmentButton({ users, onCreate }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="px-3 py-2 bg-indigo-600 text-white rounded shadow" onClick={()=>setOpen(true)}>Create Assignment</button>
      {open && <CreateAssignmentModal users={users} onClose={()=>setOpen(false)} onCreate={(p)=>{ onCreate(p); setOpen(false); }} />}
    </>
  );
}
