import { useState } from 'react';
import Card from '../components/Card';
import PageShell from '../components/PageShell';
import { usePlanner } from '../context/PlannerContext';
import { Link } from 'react-router-dom';

const StudyPlanPage = () => {
  const { subjects, availability, notify, getAiPlan } = usePlanner();
  const days = Object.keys(availability);
  const [loading, setLoading] = useState(false);
  const [aiPlan, setAiPlan] = useState('');

  const generatePlan = async () => {
    setLoading(true);
    notify('AI is analyzing your schedule and subjects...');
    try {
      const data = await getAiPlan();
      if (data.plan) {
        setAiPlan(data.plan);
        notify('Smart Plan Generated!');
      } else {
        notify('Failed to generate plan.');
      }
    } catch {
      notify('Error communicating with AI server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell title="AI-Generated Study Plan">
      <div className="mb-6 flex justify-end">
        <button
          onClick={generatePlan}
          disabled={loading}
          className="bg-planetary hover:bg-universe text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all"
        >
          {loading ? 'Thinking...' : '✨ Auto-Generate Smart Plan (AI)'}
        </button>
      </div>

      {aiPlan ? (
        <Card className="bg-white p-8">
          <h2 className="text-2xl font-bold mb-6 text-black">Your Custom Schedule</h2>
          <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed text-base">
            {aiPlan}
          </pre>
        </Card>
      ) : days.length === 0 ? (
        <Card className="bg-white p-8 text-center flex flex-col items-center justify-center py-16">
          <div className="text-5xl mb-4">📅</div>
          <h2 className="text-2xl font-bold mb-2 text-black">Availability Required</h2>
          <p className="text-galaxy/70 mb-8 max-w-md mx-auto">You need to set your weekly availability before the AI can generate a smart study schedule for you.</p>
          <Link to="/availability" className="bg-planetary hover:bg-universe text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:scale-105 transition-transform inline-block">
            Set Availability Now
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {days.map((day, index) => {
            const subject = subjects[index % subjects.length];
            const rawSlots = availability[day] || [];
            // Handle both 1D and 2D array formats for the UI
            const slots = Array.isArray(rawSlots) && Array.isArray(rawSlots[0]) 
              ? rawSlots 
              : Array.isArray(rawSlots) && typeof rawSlots[0] === 'string'
                ? [rawSlots]
                : [];

            return (
              <Card key={day} className="bg-white">
                <p className="text-sm font-semibold uppercase tracking-wide text-planetary">{day}</p>
                <h3 className="mt-2 text-xl font-bold">{subject?.name || 'General Review'}</h3>
                <div className="mt-2 space-y-1">
                  {slots.map((slot, idx) => (
                    <div key={idx} className="text-sm text-galaxy/70 flex items-center">
                      <span className="w-16">Slot {idx + 1}:</span>
                      <span className="font-medium text-galaxy">{slot[0]} - {slot[1]}</span>
                    </div>
                  ))}
                  {slots.length === 0 && (
                    <p className="text-sm text-gray-400 italic">No time slots set</p>
                  )}
                </div>
                <div className="mt-4 rounded-lg bg-sky p-3 text-sm text-galaxy">
                  Click the "Auto-Generate Smart Plan" button to dynamically map your schedule.
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </PageShell>
  );
};

export default StudyPlanPage;
