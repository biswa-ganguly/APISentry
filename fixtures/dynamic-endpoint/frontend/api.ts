import axios from 'axios';

export async function getUserById(userId: string) {
  return axios.get(`/api/users/${userId}`);
}
