import axios from 'axios';

export async function registerUser(fullName: string, email: string) {
  return axios.post("/api/register", {
    fullName,
    email
  });
}
