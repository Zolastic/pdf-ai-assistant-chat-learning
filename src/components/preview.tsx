"use client";

import { embed } from "pdfobject";
import { useEffect, useState } from "react";

interface PreviewProps {
  fileToPreview: File; // The PDF file that you want to preview
  page?: number; // Optional: The page number to display
}

const Preview: React.FC<PreviewProps> = ({ fileToPreview, page = 1 }) => {
  const [base64, setBase64] = useState<string | null>(null); // State to store the base64 representation of the PDF

  useEffect(() => {
    const options = {
      title: fileToPreview.name, // Set the title of the PDF viewer
      pdfOpenParams: {
        view: "fitH", // Fit the PDF horizontally
        page: page, // Display the specified page number
        zoom: "scale,left,top", // Set the zoom level
        pageMode: "none", // Hide page mode features
      },
    };

    // Read the file as a Data URL (base64)
    const reader = new FileReader();
    reader.onload = () => {
      setBase64(reader.result as string); // Store the base64 string in state
    };
    reader.readAsDataURL(fileToPreview); // Start reading the file

    // Embed the PDF into the specified HTML element
    if (base64) {
      embed(base64, "#pdfobject", options);
    }
  }, [page, base64, fileToPreview]); // Re-run the effect when page number or base64 changes

  return <div className="flex-grow rounded-xl" id="pdfobject"></div>; // Render the PDF viewer
};

export default Preview;
