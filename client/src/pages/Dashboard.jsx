import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { projectAPI } from '../services/api';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [stats, setStats] = useState({ totalProjects: 0, totalChats: 0 });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectAPI.getAll();
      setProjects(response.data);
      
      const totalChats = response.data.reduce((acc, project) => 
        acc + (project.chatSessions?.length || 0), 0
      );
      
      setStats({
        totalProjects: response.data.length,
        totalChats
      });
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const response = await projectAPI.create(newProject);
      setProjects(prev => [response.data, ...prev]);
      setNewProject({ name: '', description: '' });
      setShowCreateModal(false);
      setStats(prev => ({ ...prev, totalProjects: prev.totalProjects + 1 }));
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    
    try {
      await projectAPI.delete(projectId);
      setProjects(prev => prev.filter(p => p._id !== projectId));
      setStats(prev => ({ ...prev, totalProjects: prev.totalProjects - 1 }));
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="card text-center p-8">
          <div className="spinner mx-auto mb-4"></div>
          <div className="text-gray-800">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <header className="card mb-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="section-header">AI Assistant Platform</h1>
            <p className="text-secondary">Welcome back, {user?.name}! 👋</p>
          </div>
          <button
            onClick={logout}
            className="btn-secondary"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card animate-fade-in" style={{animationDelay: '0.1s'}}>
          <div className="text-3xl font-bold text-gray-900">{stats.totalProjects}</div>
          <div className="text-secondary">Total Projects</div>
          <div className="progress-bar mt-3">
            <div 
              className="progress-fill"
              style={{ width: `${Math.min((stats.totalProjects / 10) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="card animate-fade-in" style={{animationDelay: '0.2s'}}>
          <div className="text-3xl font-bold text-gray-900">{stats.totalChats}</div>
          <div className="text-secondary">Total Chats</div>
          <div className="progress-bar mt-3">
            <div 
              className="progress-fill"
              style={{ width: `${Math.min((stats.totalChats / 50) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="card animate-fade-in" style={{animationDelay: '0.3s'}}>
          <div className="text-3xl font-bold gradient-text">{user?.subscription || 'Pro'}</div>
          <div className="text-secondary">Current Plan</div>
          <div className="progress-bar mt-3">
            <div className="progress-fill" style={{ width: '75%' }}></div>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="card animate-fade-in" style={{animationDelay: '0.4s'}}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Your AI Projects</h2>
            <p className="text-secondary">Manage your AI assistant projects</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            + New Project
          </button>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <div 
              key={project._id} 
              className="card hover:transform hover:scale-105 transition-all duration-200 animate-fade-in"
              style={{animationDelay: `${0.5 + index * 0.1}s`}}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900 truncate flex-1">
                  {project.name}
                </h3>
                <div className="flex space-x-2 ml-3">
                  <Link
                    to={`/chat/${project._id}`}
                    className="w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center transition-colors"
                    title="Chat"
                  >
                    💬
                  </Link>
                  <button
                    onClick={() => handleDeleteProject(project._id)}
                    className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center transition-colors"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              <p className="text-secondary text-sm mb-4 line-clamp-2">
                {project.description || 'No description provided'}
              </p>
              
              <div className="flex justify-between text-xs text-gray-500">
                <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                <span>{project.chatSessions?.length || 0} chats</span>
              </div>
            </div>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
            <p className="text-secondary">Create your first AI project to start chatting</p>
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="card max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Project</h3>
            <form onSubmit={handleCreateProject}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Name
                  </label>
                  <input
                    type="text"
                    required
                    className="enhanced-input"
                    value={newProject.name}
                    onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="My AI Assistant"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    className="enhanced-input resize-none"
                    rows={3}
                    value={newProject.description}
                    onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this AI assistant will help you with..."
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button type="submit" className="btn-primary flex-1">
                  Create Project
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;