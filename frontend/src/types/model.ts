export interface Model {
  id: string;
  name: string;
  description: string;
}

export const AVAILABLE_MODELS: Model[] = [
  { id: 'gpt-4', name: 'GPT-4', description: '最强大的模型' },
  { id: 'gpt-3.5', name: 'GPT-3.5', description: '快速响应' },
  { id: 'claude', name: 'Claude', description: '安全可靠' }
];
