const axios = require("axios");

class LLMService {
  constructor() {
    this.baseURL = process.env.LLM_BASE_URL;
    this.apiKey = process.env.LLM_API_KEY;
    this.model = process.env.LLM_MODEL;
  }

  async *streamChatCompletion(messages) {
    try {
      console.log("LLM Service: Starting stream request...");
      console.log("LLM Service: Model:", this.model);
      console.log("LLM Service: Messages:", JSON.stringify(messages));

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: this.model,
          messages: messages,
          stream: true,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          responseType: "stream",
        },
      );

      console.log("LLM Service: Response received, status:", response.status);

      let buffer = "";
      let receivedChunks = 0;

      for await (const chunk of response.data) {
        buffer += chunk.toString();
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.substring(6);
            if (data === "[DONE]") {
              console.log(
                "LLM Service: Stream completed, total chunks:",
                receivedChunks,
              );
              return;
            }
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices[0]?.delta?.content;
              if (delta) {
                receivedChunks++;
                if (receivedChunks <= 5) {
                  console.log(
                    "LLM Service: Received chunk:",
                    delta.substring(0, 50),
                  );
                }
                yield delta;
              }
            } catch (e) {
              console.error("LLM Service: Error parsing chunk:", e);
              console.error("LLM Service: Raw data:", data);
            }
          }
        }
      }
    } catch (error) {
      console.error(
        "LLM Service: API Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  async generateResponse(messages) {
    try {
      console.log("LLM Service: Generating response...");
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: this.model,
          messages: messages,
          stream: false,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        },
      );
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error(
        "LLM Service: API Error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  }
}

module.exports = new LLMService();
