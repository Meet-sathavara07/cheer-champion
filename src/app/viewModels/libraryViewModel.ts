"use client";
import { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { usePostContext } from "@/app/context/KudoPostContext";
import { GifsResult, GiphyFetch } from "@giphy/js-fetch-api";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { compressImage, isGifFile, validateGifSize, validateFileSize } from "../utils/imageProcessing";

// Initialize Giphy API
const gf = new GiphyFetch(process.env.NEXT_PUBLIC_GIPHY_API_KEY || "");

const emptyGifsResult: GifsResult = {
  data: [],
  pagination: {
    total_count: 0,
    count: 0,
    offset: 0,
  },
  meta: {
    msg: "Empty result",
    response_id: "",
    status: 200,
  },
};

export const useLibraryViewModel = () => {
  const router = useRouter();
  const { formData, setFormData }: any = usePostContext();
  const [search, setSearch] = useState(formData.sentiment || "Thank You");
  const [debouncedSearch, setDebouncedSearch] = useState(
    formData.sentiment || "Thank You"
  );
  const [isLoadingCards, setLoadingCards] = useState(false);
  const [isLoadingGIFs, setLoadingGIFs] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  // const [processingProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { t } = useTranslation();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // added manual timeout if GIPHY Failed

  const timeout = <T>(
    promise: Promise<T>,
    ms = 7000,
    message: string
  ): Promise<T> => {
    return new Promise((resolve, reject) => {
      const id = setTimeout(() => reject(new Error(message)), ms);
      promise
        .then(resolve)
        .catch(reject)
        .finally(() => clearTimeout(id));
    });
  };

  const fetchGIFs = async (offset: number, search: string) => {
    try {
      if (offset === 0) setLoadingGIFs(true);
      const result = await timeout(
        search
          ? gf.search(search, { offset, limit: 30 })
          : gf.trending({ offset, limit: 30 }),
        7000,
        "Giphy request timed out" // 7 second timeout
      );
      return result;
    } catch (error: any) {
      toast.error(error.message || "Failed to load GIFs");
      return emptyGifsResult; // fallback
    } finally {
      setLoadingGIFs(false);
    }
  };

  const fetchStickers = async (offset: number, search: string) => {
    try {
      if (offset === 0) setLoadingCards(true);
      const result = await timeout(
        search
          ? gf.search(search, { offset, limit: 30, type: "stickers" })
          : gf.trending({ offset, limit: 30, type: "stickers" }),
        7000,
        "Cards request timed out" // 7 second timeout
      );
      return result;
    } catch (error: any) {
      toast.error(error.message || "Failed to load cards");
      return emptyGifsResult; // fallback
    } finally {
      setLoadingCards(false);
    }
  };

const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    setIsUploading(true);

    // Validate file size
    if (!validateFileSize(file)) {
      toast.error("File size must be less than 10MB.");
      return;
    }

    // Handle GIF files
    if (isGifFile(file) && !validateGifSize(file)) {
      toast.error("GIF file size must be less than 3MB.");
      return;
    }

    // Process the file
    const { compressedFile, previewUrl } = await compressImage(file);

    setFormData((prevData: any) => ({
      ...prevData,
      file: compressedFile,
      fileType: "upload",
      previewUrl: previewUrl,
      file_url: "",
      fileName: compressedFile.name,
    }));

    router.push("/kudo/recipients");
  } catch (error: any) {
    toast.error(error.message || "Failed to process file");
    console.error("File processing error:", error);
  } finally {
    setIsUploading(false);
  }
};
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: { selectedFile: formData.file || formData.file_url || "" },
    validationSchema: Yup.object().shape({
      selectedFile: Yup.string().required("Please select an image or GIF."),
    }),
    onSubmit: (values) => {
      setFormData({ ...formData, file: values.selectedFile });
      router.push("/kudo/recipients");
    },
  });

  const handleSelectGif = (gif: any) => {
    const gifUrl = gif.images.original.url;

    formik.setFieldValue("selectedFile", gifUrl);

    setFormData((prevData: any) => ({
      ...prevData,
      file: null, // Clear file object when selecting GIF
      file_url: gifUrl, // Store the URL in file_url
      previewUrl: gifUrl, // Also set as preview
      fileType: "pick",
      sentiment: search
    }));

    // toast.success("GIF selected successfully!");
    router.push("/kudo/recipients");
  };

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return {
    search,
    setSearch,
    debouncedSearch,
    // formik,
    handleSelectGif,
    fetchGIFs,
    fetchStickers,
    handleFileUpload,
    handleUploadClick,
    fileInputRef,
    isUploading,
    // processingProgress,
    goBackHandler: () => router.push("/"),
    windowWidth:
      typeof window !== "undefined" && window.innerWidth > 1024
        ? (window.innerWidth - 190) / 2
        : typeof window !== "undefined"
        ? window.innerWidth - 54
        : 0,
    isLoadingCards,
    isLoadingGIFs,
    t,
    hasMounted,
  };
};
