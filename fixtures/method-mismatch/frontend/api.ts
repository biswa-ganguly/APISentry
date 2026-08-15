import axios from 'axios';

export async function updateProfile(data: { name: string }) {
  return axios.post('/api/profile', data);
}
