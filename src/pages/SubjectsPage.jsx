import { useState } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import PageShell from '../components/PageShell';
import SubjectCard from '../components/SubjectCard';
import { usePlanner } from '../context/PlannerContext';

const SubjectsPage = () => {
  const { subjects, addSubject, removeSubject } = usePlanner();
  const [newSubject, setNewSubject] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');

  const handleAddSubject = (e) => {
    e.preventDefault();
    if (newSubject.trim()) {
      addSubject({
        id: Date.now().toString(),
        name: newSubject.trim(),
        color: '#ccff00', // Neon accent color
        difficulty: difficulty,
        progress: 0,
        examDate: null,
      });
      setNewSubject('');
      setDifficulty('Medium');
    }
  };

  return (
    <PageShell title="Manage Subjects">
      {/* Subject Input Form Container */}
      <Card className="mb-8 bg-white border-none shadow-2xl">
        <form onSubmit={handleAddSubject} className="grid gap-4 md:grid-cols-[1fr_auto_auto]">
          <input
            type="text"
            placeholder="New Subject Name (e.g. Mathematics)"
            className="rounded-full bg-gray-100 px-6 py-4 text-black placeholder:text-gray-500 outline-none border-2 border-transparent focus:border-neon transition-all"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
          />
          <select
            className="rounded-full bg-gray-100 px-6 py-4 text-black outline-none border-2 border-transparent focus:border-neon transition-all"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          <Button type="submit" variant="primary">
            <span className="text-black">Add Subject</span>
          </Button>
        </form>
      </Card>

      {/* Subjects Display Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {subjects.length > 0 ? (
          subjects.map((subject) => (
            <div key={subject.id} className="relative group">
              <SubjectCard subject={subject} />
              <button
                onClick={() => removeSubject(subject.id)}
                className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg flex items-center justify-center font-bold"
              >
                ×
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <p className="text-muted text-lg uppercase tracking-widest font-black">No subjects added yet</p>
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default SubjectsPage;