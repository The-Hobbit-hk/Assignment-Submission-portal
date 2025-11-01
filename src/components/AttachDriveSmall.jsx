import React, { useState, useEffect } from 'react';

export default function AttachDriveSmall({ current, onAttach }) {
  const [open, setOpen] = useState(false);
  const [val, setVal] = useState(current || '');
  useEffect(()=>{ setVal(current||''); }, [current]);
  return (
    <div>
      <div className="text-xs">{current ? 'Drive attached' : 'No link'}</div>
      <div className="mt-1 flex gap-1 justify-end">
        <button className="text-xs px-2 py-1 border rounded" onClick={()=>setOpen(true)}>Attach</button>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white p-4 rounded w-full max-w-md">
            <div className="flex justify-between items-center"><div className="font-semibold">Attach Drive link</div><button onClick={()=>setOpen(false)}>Close</button></div>
            <input value={val} onChange={e=>setVal(e.target.value)} className="w-full border rounded p-2 mt-3" placeholder="https://drive.google.com/..." />
            <div className="flex justify-end gap-2 mt-3">
              <button onClick={()=>setOpen(false)} className="px-3 py-1">Cancel</button>
              <button onClick={()=>{ onAttach(val); setOpen(false); }} className="px-3 py-1 bg-indigo-600 text-white rounded">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
