import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dispatch, SetStateAction, useState, DragEvent } from "react";

interface FileUploadProps {
  setSelectFile: Dispatch<SetStateAction<File | null>>;
  setPage: Dispatch<SetStateAction<number>>;
}

const FileUpload: React.FC<FileUploadProps> = ({ setSelectFile, setPage }) => {
  const [status, setStatus] = useState<string | null>(null);

  // Handle file change from drag-and-drop or file selection
  const handleFileChange = (event: DragEvent<HTMLInputElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectFile(file);
      setPage(1);
      setStatus(null); // Reset status after successful file selection
    } else {
      setStatus("No file selected"); // Show error if no file is selected
    }
  };

  return (
    <div className="text-center space-y-6 w-full max-w-md">
      <h1 className="text-4xl font-bold">
        Get knowledge from your PDF with AI
      </h1>
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="pdf-upload">Upload PDF file</Label>
        <Input
          id="pdf-upload"
          type="file"
          accept=".pdf"
          onDragOver={() => setStatus("Drop PDF file")} // Update status on drag over
          onDragLeave={() => setStatus("")} // Clear status on drag leave
          className="cursor-pointer"
          onChange={(e) => {
            if (e.target.files) {
              setSelectFile(e.target.files[0]);
              setPage(1);
              setStatus(null); // Reset status after file selection
            }
          }}
        />
        <div className="text-lg font-medium">{status}</div>{" "}
        {/* Display status messages */}
      </div>
    </div>
  );
};

export default FileUpload;
