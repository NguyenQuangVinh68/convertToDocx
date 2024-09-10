import Tesseract from "tesseract.js";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";

import "./App.css";
import { useRef, useState } from "react";

function App() {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [language, setLanguage] = useState<string>("eng"); // Default language

  // Function to recognize text from image using Tesseract
  const recognizeTextFromImage = async (file: File): Promise<string> => {
    const reader = new FileReader();

    return new Promise<string>((resolve, reject) => {
      reader.onload = async (event) => {
        const imageUrl = event.target?.result as string;

        Tesseract.recognize(
          imageUrl,
          language, // Change the language based on the text in the image
          {
            logger: (info) => console.log(info), // Log the recognition progress
          }
        )
          .then(({ data: { text } }) => resolve(text))
          .catch((error) => {
            console.error("OCR failed: ", error);
            reject(error);
          });
      };
      reader.readAsDataURL(file); // Convert image file to a data URL for Tesseract
    });
  };

  // Function to create a DOCX file and trigger download
  const createAndDownloadDocx = (text: string): void => {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [new TextRun(text)],
            }),
          ],
        },
      ],
    });

    Packer.toBlob(doc)
      .then((blob) => {
        saveAs(blob, "output.docx");
      })
      .catch((error) => {
        console.error("Failed to create DOCX: ", error);
      });
  };

  // Function to handle file conversion
  const handleConvert = () => {
    if (file) {
      recognizeTextFromImage(file).then((text) => {
        createAndDownloadDocx(text);
      });
    } else {
      console.log("No file selected.");
    }
  };

  // Function to handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile); // Save the selected file to state
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value); // Update selected language
  };

  return (
    <div>
      <input
        type="file"
        onChange={handleFileChange}
        ref={fileInputRef}
        id="fileUpload"
        accept="image/*"
      />
      <select id="language" onChange={handleLanguageChange} value={language}>
        <option value="eng">English</option>
        <option value="vie">Vietnamese</option>
        <option value="spa">Spanish</option>
        <option value="fra">French</option>
      </select>
      <button onClick={handleConvert}>Convert Image to DOCX</button>
    </div>
  );
}

export default App;
