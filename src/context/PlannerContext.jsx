import { createContext, useContext, useMemo, useState, useEffect } from 'react';

const API_URL = 'http://localhost:8000/api';

const PlannerContext = createContext(null);

export const PlannerProvider = ({ children }) => {
  const [subjects, setSubjectsState] = useState([]);
  const [tasks, setTasksState] = useState([]);
  const [availability, setAvailabilityState] = useState({});
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/subjects/`).then(res => res.json()).then(setSubjectsState).catch(console.error);
    fetch(`${API_URL}/tasks/`).then(res => res.json()).then(setTasksState).catch(console.error);
    fetch(`${API_URL}/availability/`).then(res => res.json()).then(setAvailabilityState).catch(console.error);
  }, []);

  const notify = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 2200);
  };

  const addSubject = async (subject) => {
    const newSub = { id: crypto.randomUUID(), progress: 0, ...subject };
    try {
      await fetch(`${API_URL}/subjects/`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newSub)
      });
      setSubjectsState((prev) => [newSub, ...prev]);
      notify('Subject added');
    } catch (e) {
      console.error(e);
      notify('Error adding subject');
    }
  };

  const editSubject = async (subjectId, patch) => {
    try {
      setSubjectsState((prev) => {
        const updated = prev.map((item) => (item.id === subjectId ? { ...item, ...patch } : item));
        const itemToUpdate = updated.find(s => s.id === subjectId);
        if (itemToUpdate) {
          fetch(`${API_URL}/subjects/${subjectId}/`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(itemToUpdate)
          }).catch(console.error);
        }
        return updated;
      });
      notify('Subject updated');
    } catch (e) {
      console.error(e);
    }
  };

  const addTask = async (task) => {
    const newTask = { id: crypto.randomUUID(), status: 'Pending', ...task };
    try {
      await fetch(`${API_URL}/tasks/`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newTask)
      });
      setTasksState((prev) => [newTask, ...prev]);
      notify('Task created');
    } catch (e) {
      console.error(e);
      notify('Error adding task');
    }
  };

  const toggleTask = async (taskId) => {
    setTasksState((prev) => {
      const updated = prev.map((item) => (item.id === taskId ? { ...item, status: item.status === 'Done' ? 'Pending' : 'Done' } : item));
      const itemToUpdate = updated.find(t => t.id === taskId);
      if (itemToUpdate) {
        fetch(`${API_URL}/tasks/${taskId}/`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(itemToUpdate)
        }).catch(console.error);
      }
      return updated;
    });
  };

  const setAvailability = (updater) => {
    setAvailabilityState((prev) => {
      const newVal = typeof updater === 'function' ? updater(prev) : updater;
      fetch(`${API_URL}/availability/`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newVal)
      }).catch(console.error);
      return newVal;
    });
  };

  const value = useMemo(
    () => ({
      subjects,
      tasks,
      availability,
      toast,
      setAvailability,
      addSubject,
      editSubject,
      addTask,
      toggleTask,
      notify,
    }),
    [subjects, tasks, availability, toast],
  );

  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>;
};

export const usePlanner = () => {
  const context = useContext(PlannerContext);
  if (!context) throw new Error('usePlanner must be used inside PlannerProvider');
  return context;
};
