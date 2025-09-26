import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const projectAPI = {
  getAll: () => axios.get(`${API_BASE_URL}/projects`),
  getById: (id) => axios.get(`${API_BASE_URL}/projects/${id}`),
  create: (data) => axios.post(`${API_BASE_URL}/projects`, data),
  update: (id, data) => axios.put(`${API_BASE_URL}/projects/${id}`, data),
  delete: (id) => axios.delete(`${API_BASE_URL}/projects/${id}`)
};

export const chatAPI = {
  sendMessage: (projectId, message, chatHistory) => 
    axios.post(`${API_BASE_URL}/chat/${projectId}`, { message, chatHistory })
};

export const uploadAPI = {
  uploadFile: (projectId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post(`${API_BASE_URL}/upload/${projectId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};