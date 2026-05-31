export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadTime: Date;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export function generateConversationTitle(firstMessage: string): string {
  return firstMessage.length > 30 ? firstMessage.substring(0, 30) + '...' : firstMessage;
}
