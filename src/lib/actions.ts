"use server";

import { Document } from "@llamaindex/core/schema";
import { VectorStoreIndex } from "llamaindex/indices/vectorStore/index";
import { ContextChatEngine } from "llamaindex/engines/chat/ContextChatEngine";
import { OllamaEmbedding } from "llamaindex/embeddings/OllamaEmbedding";
import { serviceContextFromDefaults } from "llamaindex/ServiceContext";
import { Ollama } from "llamaindex/llm/ollama";

interface LCDoc {
  pageContent: string;
  metadata: any;
}

// Initialize the embedding model and language model (LLM)
const embedModel = new OllamaEmbedding({
  model: "nomic-embed-text", // install ollama locally and then run `ollama pull nomic-embed-text`
});

const llm = new Ollama({
  model: "llama3.1", // install ollama locally and then run `ollama pull llama3.1`
  options: {
    maxTokens: 100,
    temperature: 0.5,
  },
});

let chatEngine: ContextChatEngine | null = null;

// Function to process and index documents
export async function processDocs(lcDocs: LCDoc[]) {
  if (lcDocs.length == 0) return;

  // Convert LCDoc objects to Document instances
  const docs = lcDocs.map(
    (lcDoc) =>
      new Document({
        text: lcDoc.pageContent,
        metadata: lcDoc.metadata,
      })
  );

  // Create a vector store index from the documents
  const index = await VectorStoreIndex.fromDocuments(docs, {
    // Set up the service context with default values
    serviceContext: serviceContextFromDefaults({
      chunkSize: 300,
      chunkOverlap: 20,
      embedModel,
      llm,
    }),
  });

  // Set up a retriever to find the most similar documents
  const retriever = index.asRetriever({
    similarityTopK: 2, // the lower the number the more similar the results will be to the query. the higher the number the more diverse the results will be to the query.
  });

  // Reset the chat engine if it already exists
  if (chatEngine) {
    chatEngine.reset();
  }

  // Initialize the chat engine with the retriever and LLM
  chatEngine = new ContextChatEngine({
    retriever,
    chatModel: llm,
  });
}

// Function to handle chat queries
export async function chat(query: string) {
  if (chatEngine) {
    // Send the query to the chat engine and get the response
    const queryResult = await chatEngine.chat({
      message: query,
    });
    const response = queryResult.response;

    const metadata = queryResult.sourceNodes?.map((node) => node.node.metadata);

    return { response, metadata };
  }
}

// Function to reset the chat engine
export async function resetChatEngine() {
  if (chatEngine) chatEngine.reset();
}
