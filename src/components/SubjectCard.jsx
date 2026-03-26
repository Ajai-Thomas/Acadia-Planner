import { useState } from 'react';
import Card from './Card';
import ProgressBar from './ProgressBar';
import { usePlanner } from '../context/PlannerContext';

const SubjectCard = ({ subject }) => {
  const { notify } = usePlanner();
  const [uploading, setUploading] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [quiz, setQuiz] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('filename', file.name);
    formData.append('subject', subject.id);

    setUploading(true);
    notify('Splitting text and saving to Vector DB...');

    try {
      const res = await fetch('http://localhost:8000/api/materials/', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        notify('Document processed by AI!');
      } else {
        notify('Failed to process document');
      }
    } catch (e) {
      notify('Upload error');
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  const generateQuiz = async () => {
    setGeneratingQuiz(true);
    notify('AI is writing questions from your notes...');
    try {
      const res = await fetch('http://localhost:8000/api/ai/quiz/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject_id: subject.id }),
      });
      const data = await res.json();
      if (data.quiz) {
        setQuiz(data.quiz);
        notify('Quiz ready!');
      } else {
        notify('Failed to generate quiz. Have you uploaded notes?');
      }
    } catch {
      notify('Error generating quiz');
    } finally {
      setGeneratingQuiz(false);
    }
  };

  return (
    <Card className="bg-white">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold">{subject.name}</h3>
        <span className="rounded-full bg-sky px-3 py-1 text-xs font-medium text-planetary">{subject.difficulty}</span>
      </div>
      <p className="mb-3 text-sm text-galaxy/70">Exam: {subject.examDate}</p>
      <ProgressBar value={subject.progress} />
      <p className="mt-2 text-sm">{subject.progress}% completed</p>

      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm font-semibold">
        <label className={`cursor-pointer text-planetary hover:text-universe transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
          {uploading ? 'Processing AI...' : '+ Upload Notes (PDF)'}
          <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} disabled={uploading} />
        </label>

        <button
          onClick={generateQuiz}
          disabled={generatingQuiz}
          className="text-white bg-planetary hover:bg-universe px-3 py-1 rounded-md transition-colors"
        >
          {generatingQuiz ? 'Scanning Vectors...' : 'Take AI Quiz'}
        </button>
      </div>

      {quiz && Array.isArray(quiz) && (
        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm h-48 overflow-y-auto">
          <h4 className="font-bold text-black mb-2 flex justify-between">Retrieval Augmented Quiz <button onClick={() => setQuiz(null)} className="text-red-500 font-normal">Close</button></h4>
          {quiz.map((q, i) => (
            <div key={i} className="mb-4">
              <p className="font-semibold text-gray-800">{i + 1}. {q.question}</p>
              <ul className="ml-4 mt-1 list-disc text-gray-600">
                {q.options?.map((opt, j) => (
                  <li key={j} className={opt === q.answer ? "font-bold text-green-600" : ""}>{opt}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default SubjectCard;
