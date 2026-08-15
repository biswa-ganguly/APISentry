import axios from 'axios';

export async function createItem(name: string, price: number) {
  return axios.post('/api/items', { name, price });
}
