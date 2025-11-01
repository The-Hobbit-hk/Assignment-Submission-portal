export const sampleData = {
  users: [
    { id: 's1', name: 'Harshvardhan', role: 'student' },
    { id: 's2', name: 'Aditi Sharma', role: 'student' },
    { id: 'admin1', name: 'Professor Rao', role: 'admin' }
  ],
  assignments: [
    {
      id: 'a1',
      title: 'Embedded Systems Lab - Report',
      description: 'Write and submit the lab report. Attach Drive link after uploading.',
      dueDate: '2025-11-02',
      createdBy: 'admin1',
      assignedTo: ['s1','s2'],
      submissions: {}
    },
    {
      id: 'a2',
      title: 'ECU Testing - Quiz',
      description: 'MCQ quiz link will be posted. For now upload your answers to Drive if offline.',
      dueDate: '2025-11-05',
      createdBy: 'admin1',
      assignedTo: ['s1'],
      submissions: {}
    }
  ]
}
