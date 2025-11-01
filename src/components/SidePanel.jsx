import React from 'react';
import Card from './Card';

export default function SidePanel({ data, user }) {
  const myAssignments = data.assignments.filter(a => (user.role === 'student' ? a.assignedTo.includes(user.id) : a.createdBy === user.id));

  const total = myAssignments.length;
  const done = myAssignments.filter(a => {
    if (user.role === 'student') return a.submissions[user.id] && a.submissions[user.id].confirmed;
    if (user.role === 'admin') {
      const assigned = a.assignedTo.length;
      if (assigned === 0) return false;
      const submittedCount = a.assignedTo.filter(sid => a.submissions[sid] && a.submissions[sid].confirmed).length;
      return submittedCount === assigned;
    }
    return false;
  }).length;

  const pct = total === 0 ? 0 : Math.round((done/total)*100);

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">Your assignment completion</div>
            <div className="text-lg font-semibold">{done}/{total} completed</div>
          </div>
          <div className="w-24 text-right font-mono">{pct}%</div>
        </div>
        <div className="mt-3 bg-gray-100 rounded-full h-3 overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: '#4f46e5' }} />
        </div>
      </Card>

      <Card>
        <h4 className="font-semibold">Quick Info</h4>
        <ul className="mt-2 text-sm text-gray-600 space-y-1">
          <li>Assignments are simulated locally (localStorage).</li>
          <li>Students confirm submission via a double-confirmation flow.</li>
          <li>Admins attach Drive links and see per-student progress bars.</li>
        </ul>
      </Card>
    </div>
  );
}
