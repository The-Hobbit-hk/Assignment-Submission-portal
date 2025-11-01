import React from 'react';
import StudentSubmissionBox from './StudentSubmissionBox';
import AttachDriveSmall from './AttachDriveSmall'; // <--- Add this line

export default function AssignmentCard({ assignment, user, users, onUpdate }) {
  const isStudent = user.role === 'student';
  const isAdmin = user.role === 'admin';
  const mySubmission = assignment.submissions[user.id] || null;

  function studentProgress(sid){
    const s = assignment.submissions[sid];
    if(!s) return 0;
    return s.confirmed ? 100 : (s.status === 'submitted' ? 70 : 0);
  }

  function handleStudentSubmit(driveLink){
    const updated = { ...assignment, submissions: { ...assignment.submissions } };
    updated.submissions[user.id] = { status: 'submitted', driveLink: driveLink || '', confirmed: false, at: new Date().toISOString() };
    onUpdate(updated);
  }

  function handleStudentConfirm(){
    const updated = { ...assignment, submissions: { ...assignment.submissions } };
    if(!updated.submissions[user.id]) return;
    updated.submissions[user.id] = { ...updated.submissions[user.id], confirmed: true, confirmedAt: new Date().toISOString() };
    onUpdate(updated);
  }

  function attachDriveLinkForStudent(sid, link){
    const updated = { ...assignment, submissions: { ...assignment.submissions } };
    const prev = updated.submissions[sid] || { status: 'not_submitted', driveLink: '', confirmed: false };
    updated.submissions[sid] = { ...prev, driveLink: link, status: link ? 'submitted' : prev.status };
    onUpdate(updated);
  }

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg border hover:shadow-xl transition group">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-1">
            <div className="font-extrabold text-2xl text-gray-800">{assignment.title}</div>
            <div className="bg-blue-100 text-blue-700 px-3 py-0.5 text-xs rounded-full font-semibold border border-blue-200">
              Due: {assignment.dueDate}
            </div>
          </div>
          <div className="text-base text-gray-600 mt-2 mb-6">{assignment.description}</div>

          <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-6">
            {isStudent && (
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 shadow-none group-hover:shadow-sm transition">
                <StudentSubmissionBox assignment={assignment} mySubmission={mySubmission} onSubmit={handleStudentSubmit} onConfirm={handleStudentConfirm} />
              </div>
            )}

            {isAdmin && (
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 shadow-none group-hover:shadow-sm transition">
                <div className="font-semibold text-gray-700 mb-2">Assigned Students</div>
                <div className="mt-2 space-y-3">
                  {assignment.assignedTo.length === 0 && <div className="text-sm text-gray-500 italic">No students assigned</div>}
                  {assignment.assignedTo.map(sid=>{
                    const student = users.find(u=>u.id===sid);
                    const prog = studentProgress(sid);
                    const sub = assignment.submissions[sid] || null;
                    return (
                      <div key={sid} className="flex items-center gap-4 p-2 rounded-lg border border-gray-200 hover:bg-blue-50 transition">
                        <div className="w-44 text-sm font-medium truncate text-gray-900">{student ? student.name : sid}</div>
                        <div className="flex-1 min-w-[100px]">
                          <div className="h-2 rounded bg-gray-200">
                            <div
                              style={{
                                width: `${prog}%`,
                                background: prog === 100 ? "#22c55e" : prog === 70 ? "#facc15" : "#e5e7eb"
                              }}
                              className="h-full transition-all"
                            />
                          </div>
                          <div className={`text-xs mt-1 ${
                            sub
                              ? sub.confirmed
                                ? "text-green-600"
                                : sub.status === 'submitted'
                                  ? "text-yellow-600"
                                  : "text-gray-500"
                              : "text-gray-500"
                          }`}>
                            {sub
                              ? sub.confirmed
                                ? 'Submitted (confirmed)'
                                : sub.status === 'submitted'
                                  ? 'Submitted (pending confirm)'
                                  : 'Not submitted'
                              : 'Not submitted'}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {sub && sub.driveLink && (
                            <a
                              href={sub.driveLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold border border-green-200 hover:bg-green-200 hover:text-green-900 transition"
                            >Drive</a>
                          )}
                          <AttachDriveSmall current={sub && sub.driveLink} onAttach={(link)=>attachDriveLinkForStudent(sid, link)} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="w-44 text-right text-sm text-gray-400 flex flex-col gap-2">
          <div>
            <span className="font-bold text-gray-600">Created by:</span><br />
            <span className="">{assignment.createdBy}</span>
          </div>
          <div>
            <span className="font-bold text-gray-600">Assignment ID:</span><br />
            <span className="">{assignment.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
}