import axios from 'axios';

export async function getUser(id: string) {
  return axios.get(`/api/v1/users/${id}`);
}
