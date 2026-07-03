const express = require("express");
const { v4: uuidv4 } = require("uuid");
const Conversation = require("../models/Conversation");
const UploadedFile = require("../models/UploadedFile");
const llmService = require("../services/llmService");

const router = express.Router();

const buildMessageWithFiles = async (content, conversationId) => {
  const files = await UploadedFile.find({ conversationId });
  if (files.length === 0) return content;

  const fileContents = files
    .filter((f) => f.content)
    .map((f) => `【${f.name}】\n${f.content}`)
    .join("\n\n---\n\n");

  return `【用户消息】\n${content}\n\n【参考文件】\n${fileContents}`;
};

router.get("/", async (req, res) => {
  try {
    const conversations = await Conversation.find().sort({ updatedAt: -1 });
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const conversation = await Conversation.findOne({ id: req.params.id });
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const newConversation = new Conversation({
      id: uuidv4(),
      title: "新对话",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      model: process.env.LLM_MODEL,
    });
    await newConversation.save();
    res.json(newConversation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/:id/message/stream", async (req, res) => {
  try {
    console.log("Conversation Routes: Stream request received");
    const { content } = req.body;
    console.log("Conversation Routes: Content:", content);

    const conversation = await Conversation.findOne({ id: req.params.id });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const userMessage = {
      id: uuidv4(),
      content: content,
      role: "user",
      timestamp: new Date(),
    };
    conversation.messages.push(userMessage);

    if (conversation.messages.length === 1 && conversation.title === "新对话") {
      conversation.title =
        content.length > 30 ? content.substring(0, 30) + "..." : content;
    }

    conversation.updatedAt = new Date();
    await conversation.save();

    const messages = await Promise.all(
      conversation.messages.map(async (msg) => ({
        role: msg.role,
        content:
          msg.role === "user"
            ? await buildMessageWithFiles(msg.content, conversation.id)
            : msg.content,
      })),
    );

    console.log("Conversation Routes: Sending SSE headers");
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
      "Transfer-Encoding": "chunked",
    });

    let fullResponse = "";
    let sentChunks = 0;

    console.log("Conversation Routes: Starting LLM stream...");
    try {
      for await (const chunk of llmService.streamChatCompletion(messages)) {
        fullResponse += chunk;
        sentChunks++;
        console.log(
          "Conversation Routes: Sending chunk",
          sentChunks,
          "- length:",
          chunk.length,
        );
        const data = `data: ${JSON.stringify({ chunk })}\n\n`;
        res.write(data);
      }
    } catch (streamError) {
      console.error(
        "Conversation Routes: Stream error during LLM call:",
        streamError,
      );
      try {
        res.write(
          `data: ${JSON.stringify({ error: streamError.message })}\n\n`,
        );
      } catch (e) {
        console.error("Conversation Routes: Error writing error response:", e);
      }
      res.end();
      return;
    }

    console.log(
      "Conversation Routes: LLM stream completed, total response:",
      fullResponse.length,
      "chars",
    );

    const aiMessage = {
      id: uuidv4(),
      content: fullResponse,
      role: "assistant",
      timestamp: new Date(),
      isStreaming: false,
    };
    conversation.messages.push(aiMessage);
    conversation.updatedAt = new Date();
    await conversation.save();

    console.log("Conversation Routes: Sending finish signal");
    res.write(`data: ${JSON.stringify({ finish: true })}\n\n`);
    res.end();
    console.log("Conversation Routes: Response ended");
  } catch (error) {
    console.error("Conversation Routes: Stream error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/:id/message", async (req, res) => {
  try {
    const { content } = req.body;
    const conversation = await Conversation.findOne({ id: req.params.id });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const userMessage = {
      id: uuidv4(),
      content: content,
      role: "user",
      timestamp: new Date(),
    };
    conversation.messages.push(userMessage);

    if (conversation.messages.length === 1 && conversation.title === "新对话") {
      conversation.title =
        content.length > 30 ? content.substring(0, 30) + "..." : content;
    }

    conversation.updatedAt = new Date();
    await conversation.save();

    const messages = await Promise.all(
      conversation.messages.map(async (msg) => ({
        role: msg.role,
        content:
          msg.role === "user"
            ? await buildMessageWithFiles(msg.content, conversation.id)
            : msg.content,
      })),
    );

    const aiResponse = await llmService.generateResponse(messages);

    const aiMessage = {
      id: uuidv4(),
      content: aiResponse,
      role: "assistant",
      timestamp: new Date(),
    };
    conversation.messages.push(aiMessage);
    conversation.updatedAt = new Date();
    await conversation.save();

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const conversation = await Conversation.findOneAndDelete({
      id: req.params.id,
    });
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    res.json({ message: "Conversation deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id/title", async (req, res) => {
  try {
    const { title } = req.body;
    const conversation = await Conversation.findOne({ id: req.params.id });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    conversation.title = title;
    conversation.updatedAt = new Date();
    await conversation.save();

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id/message/:messageId", async (req, res) => {
  try {
    const conversation = await Conversation.findOne({ id: req.params.id });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    conversation.messages = conversation.messages.filter(
      (msg) => msg.id !== req.params.messageId,
    );
    conversation.updatedAt = new Date();
    await conversation.save();

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/:id/regenerate/stream", async (req, res) => {
  try {
    console.log("Conversation Routes: Regenerate stream request received");

    const conversation = await Conversation.findOne({ id: req.params.id });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    if (conversation.messages.length < 2) {
      return res
        .status(400)
        .json({ error: "Not enough messages to regenerate" });
    }

    conversation.messages.pop();

    const messages = await Promise.all(
      conversation.messages.map(async (msg) => ({
        role: msg.role,
        content:
          msg.role === "user"
            ? await buildMessageWithFiles(msg.content, conversation.id)
            : msg.content,
      })),
    );

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
      "Transfer-Encoding": "chunked",
    });

    let fullResponse = "";
    let sentChunks = 0;

    try {
      for await (const chunk of llmService.streamChatCompletion(messages)) {
        fullResponse += chunk;
        sentChunks++;
        console.log(
          "Conversation Routes: Sending regenerate chunk",
          sentChunks,
          "- length:",
          chunk.length,
        );
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      }
    } catch (streamError) {
      console.error(
        "Conversation Routes: Regenerate stream error:",
        streamError,
      );
      try {
        res.write(
          `data: ${JSON.stringify({ error: streamError.message })}\n\n`,
        );
      } catch (e) {
        console.error(
          "Conversation Routes: Error writing regenerate error response:",
          e,
        );
      }
      res.end();
      return;
    }

    console.log(
      "Conversation Routes: Regenerate stream completed, total response:",
      fullResponse.length,
      "chars",
    );

    const aiMessage = {
      id: uuidv4(),
      content: fullResponse,
      role: "assistant",
      timestamp: new Date(),
      isStreaming: false,
    };
    conversation.messages.push(aiMessage);
    conversation.updatedAt = new Date();
    await conversation.save();

    res.write(`data: ${JSON.stringify({ finish: true })}\n\n`);
    res.end();
    console.log("Conversation Routes: Regenerate response ended");
  } catch (error) {
    console.error("Conversation Routes: Regenerate error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/:id/regenerate", async (req, res) => {
  try {
    const conversation = await Conversation.findOne({ id: req.params.id });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    if (conversation.messages.length < 2) {
      return res
        .status(400)
        .json({ error: "Not enough messages to regenerate" });
    }

    conversation.messages.pop();

    const messages = await Promise.all(
      conversation.messages.map(async (msg) => ({
        role: msg.role,
        content:
          msg.role === "user"
            ? await buildMessageWithFiles(msg.content, conversation.id)
            : msg.content,
      })),
    );

    const aiResponse = await llmService.generateResponse(messages);

    const aiMessage = {
      id: uuidv4(),
      content: aiResponse,
      role: "assistant",
      timestamp: new Date(),
    };
    conversation.messages.push(aiMessage);
    conversation.updatedAt = new Date();
    await conversation.save();

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
