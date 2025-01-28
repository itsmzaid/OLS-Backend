import axios from 'axios';

export async function sendPostRequest(url: string, data: any) {
  try {
    const response = await axios.post(url, data, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.error.message || 'Request failed');
    }
    throw new Error('Network error. Please check your connection.');
  }
}
