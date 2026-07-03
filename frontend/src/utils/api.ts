import type { Conversation } from "../types";

const BASE_URL = "/api";

const fetchOptions: RequestInit = {
  signal: AbortSignal.timeout(120000),
};

export const api = {
  conversations: {
    getAll: async (): Promise<Conversation[]> => {
      const response = await fetch(`${BASE_URL}/conversations`, fetchOptions);
      return response.json();
    },

    getById: async (id: string): Promise<Conversation> => {
      const response = await fetch(`${BASE_URL}/conversations/${id}`, fetchOptions);
      return response.json();
    },

    create: async (): Promise<Conversation> => {
      const response = await fetch(`${BASE_URL}/conversations`, {
        ...fetchOptions,
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      return response.json();
    },

    sendMessage: async (
      id: string,
      content: string
    ): Promise<Conversation> => {
      const response = await fetch(`${BASE_URL}/conversations/${id}/message`, {
        ...fetchOptions,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      return response.json();
    },

    sendMessageStream: async (
      id: string,
      content: string,
      onChunk: (chunk: string) => void,
      onFinish: () => void
    ): Promise<void> => {
      console.log("API: Starting stream request...");
      
      try {
        const response = await fetch(
          `${BASE_URL}/conversations/${id}/message/stream`,
          {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Accept": "text/event-stream",
            },
            body: JSON.stringify({ content }),
            signal: AbortSignal.timeout(120000),
          }
        );

        console.log("API: Response status:", response.status);
        console.log("API: Response headers:", [...response.headers.entries()]);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("API: Response error:", errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          console.error("API: No response body");
          return;
        }

        console.log("API: Starting to read stream...");
        
        const decoder = new TextDecoder();
        let buffer = "";
        let receivedChunks = 0;

        while (true) {
          const { done, value } = await reader.read();
          console.log("API: read() result - done:", done, "value length:", value?.length || 0);
          
          if (done) {
            console.log("API: Stream reading completed");
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          console.log("API: Buffer content:", buffer.substring(0, 200));
          
          while (buffer.includes("\n\n")) {
            const idx = buffer.indexOf("\n\n");
            const line = buffer.substring(0, idx);
            buffer = buffer.substring(idx + 2);

            if (line.startsWith("data: ")) {
              const data = line.substring(6);
              console.log("API: Parsing data:", data);
              try {
                const parsed = JSON.parse(data);
                if (parsed.chunk) {
                  receivedChunks++;
                  console.log("API: Received chunk", receivedChunks, ":", parsed.chunk.substring(0, 50));
                  onChunk(parsed.chunk);
                }
                if (parsed.finish) {
                  console.log("API: Received finish signal");
                  onFinish();
                }
              } catch (e) {
                console.error("API: Error parsing SSE:", e);
                console.error("API: Raw line:", line);
              }
            }
          }
        }
      } catch (error) {
        console.error("API: Stream error:", error);
        throw error;
      }
    },

    delete: async (id: string): Promise<void> => {
      await fetch(`${BASE_URL}/conversations/${id}`, {
        ...fetchOptions,
        method: "DELETE",
      });
    },

    updateTitle: async (id: string, title: string): Promise<Conversation> => {
      const response = await fetch(`${BASE_URL}/conversations/${id}/title`, {
        ...fetchOptions,
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      return response.json();
    },

    deleteMessage: async (conversationId: string, messageId: string): Promise<Conversation> => {
      const response = await fetch(
        `${BASE_URL}/conversations/${conversationId}/message/${messageId}`,
        { ...fetchOptions, method: "DELETE" }
      );
      return response.json();
    },

    regenerate: async (id: string): Promise<Conversation> => {
      const response = await fetch(`${BASE_URL}/conversations/${id}/regenerate`, {
        ...fetchOptions,
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      return response.json();
    },

    regenerateStream: async (
      id: string,
      onChunk: (chunk: string) => void,
      onFinish: () => void
    ): Promise<void> => {
      console.log("API: Starting regenerate stream request...");
      
      try {
        const response = await fetch(
          `${BASE_URL}/conversations/${id}/regenerate/stream`,
          {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Accept": "text/event-stream",
            },
            signal: AbortSignal.timeout(120000),
          }
        );

        console.log("API: Regenerate response status:", response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("API: Regenerate response error:", errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          console.error("API: No regenerate response body");
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";
        let receivedChunks = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log("API: Regenerate stream reading completed");
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          
          while (buffer.includes("\n\n")) {
            const idx = buffer.indexOf("\n\n");
            const line = buffer.substring(0, idx);
            buffer = buffer.substring(idx + 2);

            if (line.startsWith("data: ")) {
              const data = line.substring(6);
              try {
                const parsed = JSON.parse(data);
                if (parsed.chunk) {
                  receivedChunks++;
                  if (receivedChunks <= 5) {
                    console.log("API: Received regenerate chunk:", parsed.chunk.substring(0, 50));
                  }
                  onChunk(parsed.chunk);
                }
                if (parsed.finish) {
                  console.log("API: Received regenerate finish signal");
                  onFinish();
                }
              } catch (e) {
                console.error("API: Error parsing regenerate SSE:", e);
              }
            }
          }
        }
      } catch (error) {
        console.error("API: Regenerate stream error:", error);
        throw error;
      }
    },
  },

  files: {
    upload: async (conversationId: string, file: File): Promise<any> => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("conversationId", conversationId);

      const response = await fetch(`${BASE_URL}/files/upload`, {
        ...fetchOptions,
        method: "POST",
        body: formData,
      });
      return response.json();
    },

    getByConversation: async (conversationId: string): Promise<any[]> => {
      const response = await fetch(`${BASE_URL}/files/conversation/${conversationId}`, fetchOptions);
      return response.json();
    },

    getContent: async (fileId: string): Promise<{ content: string; name: string; type: string }> => {
      const response = await fetch(`${BASE_URL}/files/${fileId}/content`, fetchOptions);
      return response.json();
    },

    getRaw: async (fileId: string): Promise<Blob> => {
      const response = await fetch(`${BASE_URL}/files/${fileId}/raw`, fetchOptions);
      return response.blob();
    },

    delete: async (id: string): Promise<void> => {
      await fetch(`${BASE_URL}/files/${id}`, { ...fetchOptions, method: "DELETE" });
    },
  },
};
