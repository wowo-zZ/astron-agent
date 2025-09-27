import http from '@/utils/http';
import type { Classify } from '@/types/plugin-store';

export async function getTags(flag: string): Promise<Classify[]> {
  return await http.get(`/config-info/tags?flag=${flag}`);
}
