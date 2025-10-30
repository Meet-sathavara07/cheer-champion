"use client";
import { useRef, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { contactUS } from "../models/constactModel";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

interface FormData {
  name: string;
  message: string;
  email: string;
  attachment: any;
}
const formData = {
  name: "",
  email: "",
  message: "",
  attachment: "",
};
export const useContactViewModel = () => {
  const router = useRouter();
  const fileInputRef = useRef<any>(null);
  const [isLoading, setLoading] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = async (values: FormData) => {
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("message", values.message);
    formData.append("email", values.email);
    formData.append("attachment", values.attachment ? values.attachment : "");
    setLoading(true);
    const response = await contactUS(formData);
    if (response.status === 200) {
      toast.success(response.data.message);
      router.back();
    }
    setLoading(false);
  };

  const handleUploadFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      formik.setFieldValue("attachment", file);
    }
  };

  const formik: any = useFormik({
    enableReinitialize: true,
    initialValues: formData,
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email address")
        .required("Email address Required"),
      name: Yup.string()
        .min(3, "Name must be at least 3 characters")
        .max(50, "Name must be at most 50 characters")
        .required("Name is required"),
      message: Yup.string()
        .min(10, "Message must be at least 10 characters")
        .max(500, "Message must be at most 500 characters")
        .required("Message is required"),
    }),
    onSubmit: (values: FormData) => handleSubmit(values),
  });

  return {
    redirectToProfile: () => router.back(),
    formik,
    handleUploadFile,
    fileInputRef: fileInputRef,
    isLoading,
    goBackHandler: () => router.back(),
    isSidebarOpen,
     setSidebarOpen,
     t
  };
};
