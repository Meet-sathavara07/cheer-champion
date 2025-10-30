"use client";
import { createContext, useState, useEffect, useContext } from "react";

export const FormContext = createContext<FormContextType | null>(null);

const kudo = {
  message: "",
  file: null,
  recipients: [],
  sentiment: "",
  isKudoSent: false,
  isDirectKudo: false,
  previewUrl: "",
  fileType: "pick",
  file_url: "",
  fileName: "",
};

interface FormContextType {
  formData: typeof kudo;
  initialKudo: typeof kudo;
  setFormData: React.Dispatch<React.SetStateAction<typeof kudo>>;
}
export const FormProvider = ({ children }: { children: React.ReactNode }) => {
  const [formData, setFormData] = useState(() => {
    // Retrieve user data from localStorage on initial load
    const savedPost =
      typeof window !== "undefined" ? localStorage?.getItem("postData") : null;
    
    if (savedPost) {
      const parsedData = JSON.parse(savedPost);
      
      // If there's a stored file with base64 preview, reconstruct the File object
      if (parsedData.fileType === "upload" && parsedData.previewUrl && parsedData.fileName) {
        // Note: We can't perfectly reconstruct the File object from localStorage
        // The file object will be recreated when user uploads again
        // But the preview will persist via base64 string
        return {
          ...parsedData,
          file: null, // File object can't be stored in localStorage
        };
      }
      
      return parsedData;
    }
    
    return kudo;
  });

  // Custom serializer to handle File objects in localStorage
  const serializeFormData = (data: any) => {
    const serializable = { ...data };
    
    // Don't store the actual File object in localStorage (it's not serializable)
    // We keep the base64 previewUrl and file metadata instead
    if (serializable.file instanceof File) {
      serializable.file = null; // Remove File object for localStorage
    }
    return JSON.stringify(serializable);
  };

  // Update localStorage whenever form state changes
  useEffect(() => {
    if (formData && typeof window !== "undefined") {
      localStorage.setItem("postData", serializeFormData(formData));
    }
  }, [formData]);

  return (
    <FormContext.Provider value={{ formData, setFormData, initialKudo: kudo }}>
      {children}
    </FormContext.Provider>
  );
};

export const usePostContext = () => {
  const context = useContext(FormContext);
  return context;
};