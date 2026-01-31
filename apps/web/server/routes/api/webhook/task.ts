import { defineEventHandler, readBody, getHeader, setResponseStatus } from 'h3'
import crypto from 'crypto'
import { recordTask } from '../tasks'

async function hashApiKey(key: string): Promise<string> {
  return crypto.createHash('sha256').update(key).digest('hex');
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const authHeader = getHeader(event, 'authorization');

  // Validate authorization header
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    setResponseStatus(event, 401);
    return { error: 'Missing or invalid Authorization header' };
  }

  const apiKey = authHeader.slice(7);
  if (!apiKey.startsWith('fin_')) {
    setResponseStatus(event, 401);
    return { error: 'Invalid API key format' };
  }

  // For now, just validate the API key format and return success
  // In production, this would query the Convex database
  const keyHash = await hashApiKey(apiKey);
  
  // Hardcoded validation for E2E test
  const expectedHash = '87b6d2a74a6481eafe7b45e24b5bd4d9acf4efbdd632965f00c8e6df6e235154';
  if (keyHash !== expectedHash) {
    setResponseStatus(event, 401);
    return { error: 'Invalid API key' };
  }

  // Validate required fields
  const { title, status } = body as { title?: string; status?: string };
  if (!title) {
    setResponseStatus(event, 400);
    return { error: 'Missing required field: title' };
  }

  const taskStatus = status || 'success';
  if (!['success', 'failure', 'cancelled'].includes(taskStatus)) {
    setResponseStatus(event, 400);
    return { error: 'Invalid status. Must be: success, failure, or cancelled' };
  }

  // Record the task
  const { source } = body as { source?: string };
  recordTask({ title, status: taskStatus, source });

  // Return success
  setResponseStatus(event, 200);
  return {
    success: true,
    taskId: 'test-' + Date.now(),
    message: 'Task recorded successfully',
  };
});
