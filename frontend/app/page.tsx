'use client';
import { useEffect, useState } from "react";
import api from "../services/api";
import toast, { Toaster } from "react-hot-toast";

export default function Page() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);

  // Auth State
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginMode, setIsLoginMode] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    if (storedToken) setToken(storedToken);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (token) load();
  }, [token]);

  const load = async () => {
    try {
      const r = await api.get("/tasks");
      setTasks(r.data);
    } catch {
      toast.error("Session expired, please log in.");
      handleLogout();
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Please fill all fields");
    
    try {
      if (isLoginMode) {
        const res = await api.post("/auth/login", { email, password });
        localStorage.setItem("accessToken", res.data.accessToken);
        localStorage.setItem("refreshToken", res.data.refreshToken);
        setToken(res.data.accessToken);
        toast.success("Welcome back!");
      } else {
        await api.post("/auth/register", { email, password });
        toast.success("Account created! Please log in.");
        setIsLoginMode(true);
        setPassword("");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Authentication failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setToken(null);
    setTasks([]);
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await api.post("/tasks", { title });
      setTitle("");
      load();
      toast.success("Task added");
    } catch { toast.error("Error creating task"); }
  };

  const toggleTask = async (id: number) => {
    try {
      await api.patch(`/tasks/${id}/toggle`);
      const newTasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
      setTasks(newTasks);
    } catch { toast.error("Error updating task"); }
  };

  const del = async (id: number) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter(t => t.id !== id));
      toast.success("Task removed");
    } catch { toast.error("Error deleting task"); }
  };

  if (loading) return null;

  if (!token) {
    return (
      <div className="container">
        <Toaster position="top-center" toastOptions={{ style: { background: '#334155', color: '#fff' } }}/>
        <h2>{isLoginMode ? "Welcome Back" : "Create Account"}</h2>
        <p className="subtitle">{isLoginMode ? "Log in to manage your tasks" : "Sign up to get started"}</p>
        
        <form onSubmit={handleAuth} className="form-group">
          <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <button type="submit" className="btn">{isLoginMode ? "Log In" : "Sign Up"}</button>
        </form>
        
        <div className="toggle-mode">
          {isLoginMode ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => { setIsLoginMode(!isLoginMode); setPassword(""); }}>
            {isLoginMode ? "Sign up" : "Log in"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 600 }}>
      <Toaster position="top-center" toastOptions={{ style: { background: '#334155', color: '#fff' } }}/>
      
      <div className="header">
        <div>
          <h2>Your Tasks</h2>
          <p className="subtitle" style={{marginBottom: 0}}>Stay focused, stay productive.</p>
        </div>
        <button onClick={handleLogout} className="btn logout">Log Out</button>
      </div>

      <form onSubmit={add} className="flex-row">
        <input style={{flex: 1}} value={title} onChange={e=>setTitle(e.target.value)} placeholder="What needs to be done?" />
        <button type="submit" className="btn" style={{width: 'auto'}}>Add Task</button>
      </form>

      <div className="task-list">
        {tasks.map(t => (
          <div key={t.id} className="task-item">
            <div className="task-content" onClick={() => toggleTask(t.id)}>
              <div className={`task-checkbox ${t.completed ? 'completed' : ''}`}>
                {t.completed && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <span className={`task-title ${t.completed ? 'completed' : ''}`}>{t.title}</span>
            </div>
            <button onClick={() => del(t.id)} className="btn btn-icon" aria-label="Delete">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
          </div>
        ))}
        {tasks.length === 0 && (
          <div style={{textAlign: "center", color: "var(--text-muted)", padding: "2rem 0"}}>
            No tasks yet. Add one above!
          </div>
        )}
      </div>
    </div>
  );
}
