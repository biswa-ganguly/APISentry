import axios from 'axios';

export async function getStatus() {
  const res = await axios.get('/api/status');
  return res.data.email;
}
