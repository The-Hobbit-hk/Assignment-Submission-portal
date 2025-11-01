import React from 'react';
import CreateAssignmentButton from './CreateAssignmentButton';
import AssignmentCard from './AssignmentCard';
import SidePanel from './SidePanel';

export default function Dashboard({ data, user, onCreateAssignment, onUpdateAssignment }) {
  return (
    <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Assignments</h2>
            {user.role === 'admin' && <CreateAssignmentButton users={data.users.filter(u=>u.role==='student')} onCreate={onCreateAssignment} />}
          </div>

          {data.assignments.length === 0 ? (
            <div className="p-4 bg-white rounded">No assignments yet.</div>
          ) : (
            <div className="space-y-4">
              {data.assignments.map(a=>(
                <AssignmentCard key={a.id} assignment={a} user={user} users={data.users} onUpdate={onUpdateAssignment} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <SidePanel data={data} user={user} />
      </div>
    </div>
  );
}
