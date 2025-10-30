"use client";
import { useState, useEffect, useMemo, useRef } from "react"; // Add useRef
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import adminDB from "@/app/lib/admin/instant";
import { pushNotification } from "@/app/models/kudoPostModel";
import { db } from "../context/InstantProvider";

// Types
interface User {
  id: string;
  userId: string;
  name: string;
  email?: string;
  web_push_token?: string;
  photo_url?: string;
}

interface AnnouncementFormValues {
  title: string;
  message: string;
  sendToAll: boolean;
  selectedUsers: User[];
  selectedImage: File | null;
  previewUrl: string | null;
  fileName: string | null;
}

export async function getAllUserProfiles() {
  try {
    const userProfiles: any = await adminDB.query({
      user_profile: {
        $: {},
        $files: {},
        $users: {},
      },
    });
    return userProfiles?.user_profile || null;
  } catch (error) {
    console.error("Error fetching user profiles:", error);
    throw error;
  }
}

export const AnnouncementViewModel = ({
  announcement,
  onClose,
}: {
  announcement: any;
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [isUserSelectionModalOpen, setIsUserSelectionModalOpen] =
    useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null); // Add ref for file input

  // Initialize form values
  const initValues = {
    title: announcement?.title || "",
    message: announcement?.message || "",
    sendToAll: true,
    selectedUsers: announcement?.user_ids || [],
    selectedImage: null,
    previewUrl:
      announcement?.image_url ||
      localStorage.getItem("announcementImagePreview") ||
      null,
    fileName: null,
  };

  // Validation schema
  const validationSchema = Yup.object({
    title: Yup.string().required(t("admin.announcements.titleRequired")),
    message: Yup.string().required(t("admin.announcements.messageRequired")),
    selectedUsers: Yup.array().when("sendToAll", {
      is: false,
      then: (schema) =>
        schema.min(1, t("admin.announcements.selectAtLeastOneUser")),
      otherwise: (schema) => schema,
    }),
  });

  // Initialize Formik
  const formik = useFormik<AnnouncementFormValues>({
    initialValues: initValues,
    enableReinitialize: true,
    validationSchema,
    onSubmit: (values: AnnouncementFormValues) => {
      handleSubmit(values);
    },
  });

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const profiles = await getAllUserProfiles();
        const userList = profiles.map((p: any) => ({
          id: p.id,
          userId: p.$users.id,
          name: p.name || "User",
          email: p.$users.email,
          web_push_token: p.web_push_token,
          photo_url: p.$files?.url || null,
        }));
        setUsers(userList);
      } catch {
        toast.error(t("admin.announcements.fetchUsersFailed"));
      }
    };
    fetchUsers();
  }, [t]);

  // Sync localStorage with form values
  useEffect(() => {
    if (formik.values.previewUrl) {
      localStorage.setItem(
        "announcementImagePreview",
        formik.values.previewUrl
      );
    } else {
      localStorage.removeItem("announcementImagePreview");
    }
  }, [formik.values.previewUrl]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 3194304) {
        toast.error(t("admin.announcements.imageTooLarge"));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        formik.setValues({
          ...formik.values,
          selectedImage: file,
          fileName: file.name,
          previewUrl: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    formik.setValues({
      ...formik.values,
      selectedImage: null,
      previewUrl: null,
      fileName: null,
    });
    localStorage.removeItem("announcementImagePreview");
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset file input
    }
  };

  // User selection
  const toggleUserSelectionModal = () => {
    setIsUserSelectionModalOpen(!isUserSelectionModalOpen);
  };

  const handleUserSelection = (user: User) => {
    const isSelected = formik.values.selectedUsers.some(
      (u) => u.id === user.id
    );
    const updatedUsers = isSelected
      ? formik.values.selectedUsers.filter((u) => u.id !== user.id)
      : [...formik.values.selectedUsers, user];

    formik.setFieldValue("selectedUsers", updatedUsers);
  };

  const filteredUsers = useMemo(() => {
    const trimmedTerm = searchTerm.trim().toLowerCase();
    if (!trimmedTerm) return users;
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(trimmedTerm) ||
        (user.email && user.email.toLowerCase().includes(trimmedTerm))
    );
  }, [searchTerm, users]);

  const toggleSelectAll = () => {
    const allSelected =
      formik.values.selectedUsers.length === filteredUsers.length;
    formik.setFieldValue("selectedUsers", allSelected ? [] : filteredUsers);
  };

  const handleSubmit = async (values: AnnouncementFormValues) => {
    const errors: string[] = [];

    if (!values.title || !values.message) {
      errors.push(t("admin.announcements.requiredFields"));
    }

    if (
      !values.sendToAll &&
      (!Array.isArray(values.selectedUsers) ||
        values.selectedUsers.length === 0)
    ) {
      errors.push(t("admin.announcements.invalidUsers"));
    }

    if (
      values.selectedImage &&
      (typeof values.fileName !== "string" || !values.selectedImage.arrayBuffer)
    ) {
      errors.push(t("admin.announcements.invalidImage"));
    }

    if (errors.length > 0) {
      const errorMessage = errors.join(", ");
      toast.error(errorMessage);
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("message", values.message);
      formData.append("sendToAll", values.sendToAll.toString());

      if (!values.sendToAll) {
        formData.append("users", JSON.stringify(values.selectedUsers));
      } else {
        formData.append("users", JSON.stringify(users));
      }

      if (values.selectedImage && values.fileName) {
        formData.append("image", values.selectedImage);
        formData.append("fileName", values.fileName);
      }

      if (values.previewUrl && values.fileName && !values.selectedImage) {
        formData.append("existingImageUrl", values.previewUrl);
      }

      const result = await pushNotification(formData);
      console.log("Push notification result:", result);

      if (result?.success) {
        toast.success(t("admin.announcements.sentSuccess"));
        formik.resetForm();
        localStorage.removeItem("announcementImagePreview"); // Clear localStorage
        if (fileInputRef.current) {
          fileInputRef.current.value = ""; // Reset file input after submission
        }
        onClose();
      } else {
        toast.error(result?.message || t("admin.announcements.sendFailed"));
      }
    } catch (error: any) {
      toast.error(error?.message || t("admin.announcements.sendFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formik,
    handleImageChange,
    removeImage,
    fileInputRef, // Expose the ref to the component
    users,
    isUserSelectionModalOpen,
    toggleUserSelectionModal,
    handleUserSelection,
    filteredUsers,
    toggleSelectAll,
    searchTerm,
    setSearchTerm,
    t,
    isLoading,
    handleSubmit: formik.handleSubmit,
  };
};