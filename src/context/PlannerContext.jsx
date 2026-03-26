import { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';

const API_URL = 'http://localhost:8000/api';

const PlannerContext = createContext(null);

export const PlannerProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [subjects, setSubjectsState] = useState([]);
  const [tasks, setTasksState] = useState([]);
  const [availability, setAvailabilityState] = useState({});
  const [toast, setToast] = useState('');

  const apiFetch = useCallback(async (endpoint, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }
    const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || err.error || 'Network error');
    }
    return res;
  }, [token]);

  useEffect(() => {
    if (token) {
      apiFetch('/subjects/').then(res => res.json()).then(setSubjectsState).catch(console.error);
      apiFetch('/tasks/').then(res => res.json()).then(setTasksState).catch(console.error);
      apiFetch('/availability/').then(res => res.json()).then(setAvailabilityState).catch(console.error);
    } else {
      setSubjectsState([]);
      setTasksState([]);
      setAvailabilityState({});
    }
  }, [token, apiFetch]);

  const notify = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 2200);
  };

  const login = async (username, password) => {
    const res = await fetch(`${API_URL}/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.non_field_errors?.[0] || 'Login failed');
    setToken(data.token);
    localStorage.setItem('token', data.token);
  };

  const register = async (username, email, password) => {
    const res = await fetch(`${API_URL}/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.username?.[0] || 'Registration failed');
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
    notify('Logged out');
  };

  const addSubject = async (subject) => {
    const newSub = { id: crypto.randomUUID(), progress: 0, ...subject };
    try {
      await apiFetch('/subjects/', { method: 'POST', body: JSON.stringify(newSub) });
      setSubjectsState((prev) => [newSub, ...prev]);
      notify('Subject added');
    } catch (e) {
      console.error(e);
      notify('Error adding subject');
    }
  };

  const removeSubject = async (subjectId) => {
    try {
      await apiFetch(`/subjects/${subjectId}/`, { method: 'DELETE' });
      setSubjectsState((prev) => prev.filter(s => s.id !== subjectId));
      notify('Subject removed');
    } catch (e) {
      console.error(e);
      notify('Error removing subject');
    }
  };

  const editSubject = async (subjectId, patch) => {
    try {
      setSubjectsState((prev) => {
        const updated = prev.map((item) => (item.id === subjectId ? { ...item, ...patch } : item));
        const itemToUpdate = updated.find(s => s.id === subjectId);
        if (itemToUpdate) {
          apiFetch(`/subjects/${subjectId}/`, {
            method: 'PUT', body: JSON.stringify(itemToUpdate)
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
      await apiFetch('/tasks/', { method: 'POST', body: JSON.stringify(newTask) });
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
        apiFetch(`/tasks/${taskId}/`, {
          method: 'PUT', body: JSON.stringify(itemToUpdate)
        }).catch(console.error);
      }
      return updated;
    });
  };

  const setAvailability = (updater) => {
    setAvailabilityState((prev) => {
      const newVal = typeof updater === 'function' ? updater(prev) : updater;
      apiFetch('/availability/', {
        method: 'POST', body: JSON.stringify(newVal)
      }).catch(console.error);
      return newVal;
    });
  };

  const getAiPlan = async () => {
    const res = await apiFetch('/ai/plan/', { method: 'POST' });
    return await res.json();
  };

  const value = useMemo(
    () => ({
      token,
      subjects,
      tasks,
      availability,
      toast,
      login,
      register,
      logout,
      setAvailability,
      addSubject,
      editSubject,
      removeSubject,
      addTask,
      toggleTask,
      notify,
      getAiPlan
    }),
    [token, subjects, tasks, availability, toast],
  );

  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>;
};

export const usePlanner = () => {
  const context = useContext(PlannerContext);
  if (!context) throw new Error('usePlanner must be used inside PlannerProvider');
  return context;
};
