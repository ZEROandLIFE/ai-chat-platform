import type {
  ChatCompletionRequest,
  ChatCompletionResponse,
  StreamChunk,
} from "../types/api";
import { MOCK_RESPONSES } from "./mockData";

export async function chatCompletion(
  request: ChatCompletionRequest,
): Promise<ChatCompletionResponse> {
  await new Promise((resolve) =>
    setTimeout(resolve, 500 + Math.random() * 500),
  );

  const randomResponse =
    MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];

  return {
    id: "mock-" + Date.now().toString(36),
    model: request.model || "gpt-3.5",
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content: randomResponse,
        },
        finish_reason: "stop",
      },
    ],
    usage: {
      prompt_tokens: 10,
      completion_tokens: randomResponse.length,
      total_tokens: 10 + randomResponse.length,
    },
  };
}

export async function* chatCompletionStream(
  _request: ChatCompletionRequest,
): AsyncGenerator<StreamChunk> {
  const response =
    MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];

  const chunkSize = 10;
  const delay = 50;

  for (let i = 0; i < response.length; i += chunkSize) {
    const chunkContent = response.slice(i, i + chunkSize);
    yield {
      id: "mock-" + Date.now().toString(36),
      choices: [
        {
          index: 0,
          delta: { content: chunkContent },
        },
      ],
    };

    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  yield {
    id: "mock-" + Date.now().toString(36),
    choices: [
      {
        index: 0,
        delta: {},
        finish_reason: "stop",
      },
    ],
  };
}
