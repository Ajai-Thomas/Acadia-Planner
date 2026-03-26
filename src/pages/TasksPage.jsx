import { useMemo, useState } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import PageShell from '../components/PageShell';
import TaskItem from '../components/TaskItem';
import { usePlanner } from '../context/PlannerContext';

const TasksPage = () => {
  const { tasks, subjects, addTask, toggleTask } = usePlanner();
  const [form, setForm] = useState({ title: '', subjectId: subjects[0]?.id, deadline: '', duration: 45, difficulty: 'Medium' });
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => (filter === 'all' ? tasks : tasks.filter((task) => task.subjectId === filter)), [tasks, filter]);

  const submit = (e) => {
    e.preventDefault();
    addTask({ ...form, deadline: form.deadline || null });
    setForm({ title: '', subjectId: subjects[0]?.id, deadline: '', duration: 45, difficulty: 'Medium' });
  };

  return (
    <PageShell title="Task Planner">
      <Card className="mb-4 bg-white">
        <form onSubmit={submit} className="grid gap-3 md:grid-cols-6">
          <input className="rounded-lg border border-sky px-3 py-2" required placeholder="Task title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
          <select className="rounded-lg border border-sky px-3 py-2" value={form.subjectId} onChange={(e) => setForm((p) => ({ ...p, subjectId: e.target.value }))}>
            {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
          </select>
          <input type="date" className="rounded-lg border border-sky px-3 py-2" value={form.deadline} onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))} />
          <input type="number" min="15" className="rounded-lg border border-sky px-3 py-2" value={form.duration} onChange={(e) => setForm((p) => ({ ...p, duration: Number(e.target.value) }))} />
          <select className="rounded-lg border border-sky px-3 py-2" value={form.difficulty} onChange={(e) => setForm((p) => ({ ...p, difficulty: e.target.value }))}>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          <Button type="submit">Add Task</Button>
        </form>
      </Card>
      <div className="mb-4 flex items-center gap-2">
        <label className="text-sm font-medium">Filter:</label>
        <select className="rounded-lg border border-sky px-3 py-2" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
        </select>
      </div>
      <div className="space-y-3">
        {filtered.map((task) => (
          <TaskItem key={task.id} task={task} subjectName={subjects.find((subject) => subject.id === task.subjectId)?.name || 'General'} onToggle={toggleTask} />
        ))}
      </div>
    </PageShell>
  );
};

export default TasksPage;
