import axios from 'axios';
import { HttpException, HttpStatus } from '@nestjs/common';

export async function sendPostRequest(url: string, data: any) {
  try {
    const response = await axios.post(url, data, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  } catch (error) {
    console.error('Error in sendPostRequest:', error.message);
    throw new HttpException('Request failed', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
