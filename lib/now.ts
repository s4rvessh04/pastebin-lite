import { headers } from 'next/headers';

export async function getCurrentTime(): Promise<Date> {
  if (process.env.TEST_MODE === '1') {
    const headerList = await headers();
    const testTime = headerList.get('x-test-now-ms');
    if (testTime) return new Date(parseInt(testTime, 10));

  }
  return new Date();
}
