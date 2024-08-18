"use client";

import { chat, processDocs } from "@/lib/actions";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import React, { useEffect, useState } from "react";
import Chat, { type ChatMessage } from "./chat";
import Preview from "./preview";
import FileUpload from "./file-upload";

const Homepage = () => {
  const [page, setPage] = useState<number>(1); // Manages the current page of the PDF being viewed
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // Stores the selected PDF file
  const [isLoading, setIsLoading] = useState<boolean>(false); // Indicates if the app is processing something
  const [loadingMessage, setLoadingMessage] = useState<string>(""); // Message to show during loading
  const [messages, setMessages] = useState<ChatMessage[]>([]); // Stores the chat messages

  // Function to handle the chat interaction
  const startChat = async (input: string) => {
    setLoadingMessage("AI is thinking...");
    setIsLoading(true);

    try {
      const updatedMessages: ChatMessage[] = [
        ...messages,
        { role: "human", statement: input },
      ];

      setMessages(updatedMessages);
      const chatResponse = await chat(input);

      if (!chatResponse) {
        setLoadingMessage("Failed to get a response from AI");
        return;
      }

      const { response, metadata } = chatResponse;

      const aiMessage: ChatMessage = { role: "ai", statement: response };
      setMessages([...updatedMessages, aiMessage]);

      if (metadata?.length) {
        setPage(metadata[0].loc.pageNumber); // Update the page based on the metadata from the AI response
      }

      setLoadingMessage("Got a response from AI");
    } catch (error) {
      console.error("Error during chat:", error);
      setLoadingMessage("");
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to process the PDF file once it's selected
  useEffect(() => {
    const processPdfAsync = async () => {
      if (!selectedFile) return;

      setLoadingMessage("Processing PDF...");
      setIsLoading(true);

      try {
        const loader = new WebPDFLoader(selectedFile, {
          parsedItemSeparator: " ",
        });
        const loadedDocs = await loader.load();

        const lcDocs = loadedDocs.map((item) => ({
          pageContent: item.pageContent,
          metadata: item.metadata,
        }));

        await processDocs(lcDocs); // Process the loaded PDF documents
        setLoadingMessage("PDF processed successfully");
      } catch (error) {
        console.error("Error processing PDF:", error);
        setLoadingMessage("Failed to process PDF");
      } finally {
        setIsLoading(false);
      }
    };

    processPdfAsync();
  }, [selectedFile]); // Runs whenever a new file is selected

  return (
    <main className="container mx-auto">
      {selectedFile ? (
        <div className="flex my-12 justify-evenly gap-2 h-[90vh]">
          {/* Chat Component */}
          <Chat
            isLoading={isLoading}
            loadingMessage={loadingMessage}
            messages={messages}
            setMessages={setMessages}
            startChat={startChat}
            setPage={setPage}
            setSelectedFile={setSelectedFile}
          />
          {/* Preview Component */}
          <Preview fileToPreview={selectedFile} page={page} />
        </div>
      ) : (
        <div className="min-h-screen flex flex-col items-center justify-center">
          {/* FileUpload Component */}
          <FileUpload setPage={setPage} setSelectFile={setSelectedFile} />
        </div>
      )}
    </main>
  );
};

export default Homepage;
