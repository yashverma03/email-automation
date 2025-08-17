export interface EmailLog {
  email: string;
  status: 'success' | 'failed';
  error?: string;
}
