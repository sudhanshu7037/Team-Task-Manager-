import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [users, setUsers] = useState([]);
  
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'Pending',
    assignedTo: '',
    dueDate: '',
    priority: 'Medium'
  });

  useEffect(() => {
    fetchProjectDetails();
    fetchTasks();
    if (user?.role === 'Admin') {
      fetchUsers();
    }
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      const { data } = await api.get(`/projects/${id}`);
      setProject(data);
    } catch (error) {
      console.error('Error fetching project', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const { data } = await api.get(`/tasks?project=${id}`);
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users', error);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', { ...newTask, project: id });
      setShowTaskModal(false);
      setNewTask({ title: '', description: '', status: 'Pending', assignedTo: '', dueDate: '', priority: 'Medium' });
      fetchTasks();
    } catch (error) {
      console.error('Error creating task', error);
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}/status`, { status });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task status', error);
    }
  };

  const handleDeleteProject = async () => {
    if (window.confirm('Are you sure you want to delete this project? All associated tasks will also be deleted.')) {
      try {
        await api.delete(`/projects/${id}`);
        navigate('/projects');
      } catch (error) {
        console.error('Error deleting project', error);
        alert('Failed to delete project');
      }
    }
  };

  if (!project) return <div>Loading...</div>;

  return (
    <div className="fade-in">
      <Link to="/projects" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
        <ArrowLeft size={16} /> Back to Projects
      </Link>
      
      <div className="page-header">
        <div>
          <h1 className="page-title">{project.name}</h1>
          <p className="card-subtitle">{project.description}</p>
        </div>
        {user?.role === 'Admin' && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-outline" style={{ color: 'var(--danger-color)', borderColor: 'var(--danger-color)' }} onClick={handleDeleteProject}>
              <Trash2 size={20} /> Delete Project
            </button>
            <button className="btn btn-primary" onClick={() => setShowTaskModal(true)}>
              <Plus size={20} /> Add Task
            </button>
          </div>
        )}
      </div>

      <div className="grid-cards">
        {['Pending', 'In Progress', 'Completed'].map(status => (
          <div key={status} className="card" style={{ backgroundColor: '#f9fafb' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: status === 'Pending' ? 'var(--danger-color)' : status === 'In Progress' ? 'var(--warning-color)' : 'var(--secondary-color)' }}></span>
              {status} ({tasks.filter(t => t.status === status).length})
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {tasks.filter(t => t.status === status).map(task => (
                <div key={task._id} style={{ backgroundColor: 'var(--surface-color)', padding: '1rem', borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>{task.title}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{task.description}</p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem' }}>
                        {task.assignedTo?.name ? task.assignedTo.name.charAt(0) : '?'}
                      </div>
                    </div>
                    
                    {(user?.role === 'Admin' || task.assignedTo?._id === user?._id) && (
                      <select 
                        className="form-select" 
                        style={{ width: 'auto', padding: '0.25rem', fontSize: '0.75rem' }}
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add New Task</h2>
              <button className="close-btn" onClick={() => setShowTaskModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label>Task Title</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={newTask.title} 
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  className="form-control" 
                  rows="2"
                  value={newTask.description} 
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})} 
                ></textarea>
              </div>
              <div className="grid-cards" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Assignee</label>
                  <select 
                    className="form-select" 
                    value={newTask.assignedTo} 
                    onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                  >
                    <option value="">Unassigned</option>
                    {users.map(u => (
                      <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Due date</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={newTask.dueDate} 
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})} 
                  />
                </div>
              </div>
              <div className="grid-cards" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Status</label>
                  <select 
                    className="form-select" 
                    value={newTask.status} 
                    onChange={(e) => setNewTask({...newTask, status: e.target.value})}
                  >
                    <option value="Pending">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select 
                    className="form-select" 
                    value={newTask.priority} 
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
