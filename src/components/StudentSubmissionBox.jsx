import React, { useState, useEffect } from 'react';

export default function StudentSubmissionBox({ assignment, mySubmission, onSubmit, onConfirm }) {
  const [step, setStep] = useState(mySubmission ? (mySubmission.confirmed ? 'done' : (mySubmission.status==='submitted'?'submitted':'start')) : 'start');
  const [link, setLink] = useState(mySubmission ? mySubmission.driveLink || '' : '');
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(()=>{
    setStep(mySubmission ? (mySubmission.confirmed ? 'done' : (mySubmission.status==='submitted'?'submitted':'start')) : 'start');
    setLink(mySubmission ? mySubmission.driveLink || '' : '');
  }, [mySubmission]);

  function beginSubmit(){
    onSubmit(link);
  }
  function finalConfirm(){
    onConfirm();
    setConfirmOpen(false);
  }

  return (
    <div className="border rounded p-3">
      <div className="text-sm text-gray-600">Your submission</div>
      <div className="mt-2">
        <input value={link} onChange={e=>setLink(e.target.value)} className="w-full border rounded p-2" placeholder="Optional: paste your Drive link" />
      </div>
      <div className="mt-3 flex gap-2">
        {step === 'done' ? (
          <div className="text-sm text-green-600">Submission confirmed ✅</div>
        ) : (
          <>
            <button className="px-3 py-1 bg-white border rounded" onClick={beginSubmit}>Yes, I have submitted</button>
            <button className="px-3 py-1 bg-indigo-600 text-white rounded" onClick={()=>setConfirmOpen(true)} disabled={!mySubmission}>Final Confirm</button>
          </>
        )}
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white p-4 rounded w-full max-w-sm">
            <div className="font-semibold">Confirm final submission</div>
            <div className="text-sm text-gray-600 mt-2">Are you sure you want to finalize this submission? This will mark it as confirmed for your professor to review.</div>
            <div className="flex justify-end gap-2 mt-4">
              <button className="px-3 py-1" onClick={()=>setConfirmOpen(false)}>Cancel</button>
              <button className="px-3 py-1 bg-indigo-600 text-white rounded" onClick={finalConfirm}>Yes, confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
