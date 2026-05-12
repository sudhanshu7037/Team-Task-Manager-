import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ pending: 0, inProgress: 0, completed: 0 });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/tasks');
      setTasks(data);
      
      const counts = data.reduce((acc, task) => {
        if (task.status === 'Pending') acc.pending++;
        if (task.status === 'In Progress') acc.inProgress++;
        if (task.status === 'Completed') acc.completed++;
        return acc;
      }, { pending: 0, inProgress: 0, completed: 0 });
      
      setStats(counts);
    } catch (error) {
      console.error('Error fetching tasks', error);
    }
  };

  const updateStatus = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}/status`, { status: newStatus });
      fetchTasks();
    } catch (error) {
      console.error('Error updating status', error);
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>

      <div className="grid-cards" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: '#fee2e2', borderRadius: '50%', color: 'var(--danger-color)' }}>
            <AlertCircle size={24} />
          </div>
          <div>
            <div className="card-subtitle" style={{ marginBottom: '0.25rem' }}>Pending Tasks</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.pending}</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: '#fef3c7', borderRadius: '50%', color: 'var(--warning-color)' }}>
            <Clock size={24} />
          </div>
          <div>
            <div className="card-subtitle" style={{ marginBottom: '0.25rem' }}>In Progress</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.inProgress}</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: '#d1fae5', borderRadius: '50%', color: 'var(--secondary-color)' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="card-subtitle" style={{ marginBottom: '0.25rem' }}>Completed</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.completed}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">My Tasks</h2>
        {tasks.length === 0 ? (
          <p className="card-subtitle">No tasks assigned to you right now.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {tasks.map(task => (
              <div key={task._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius)' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>{task.title}</h3>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Project: {task.project?.name} | Due: {new Date(task.dueDate).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span className={`badge badge-${task.status.toLowerCase().replace(' ', '')}`}>
                    {task.status}
                  </span>
                  <select 
                    className="form-select" 
                    style={{ width: 'auto', padding: '0.25rem 0.5rem' }}
                    value={task.status}
                    onChange={(e) => updateStatus(task._id, e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
