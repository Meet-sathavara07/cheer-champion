"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePostContext } from "@/app/context/KudoPostContext";
import * as Yup from "yup";
import { useFormik } from "formik";
import { generateMessageFromAI } from "../models/kudoPostModel";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../context/LanguageContext";

const sentimentPrompt = (
  message: string,
  selectedLanguage: { label: string }
) => `
You will receive a Kudo message.
Suggest exactly ONE unique GIPHY search keyword or short phrase (2–3 words) that matches the message’s tone, context, and sentiment, and will return a GIF that is:
- Funny
- Relatable
- Relevant to the message

Rules:
- 2–3 words only
- Be creative and avoid reusing phrases from earlier messages
- No quotes, no explanation
- Specific enough to match the vibe, broad enough for many results
- give me in there language of the message: ${selectedLanguage.label}

Message: ${message}
`;

const messagePrompt = (
  selectedLanguage: { label: string },
  userMessage: string
) => `
${
  userMessage
    ? `Generate a relatable and relevant message in the language of the user-provided message with exactly 80 words, based on the user-provided message: "${userMessage}".

Rules:
- Match the language of the user’s message (e.g., whatever user wrote in their language, message should write in that language)
- Enhance the user's message while preserving its original tone, style, and personality (e.g., if it’s casual, keep it casual; if it’s formal, keep it formal)
- Make it sound like a natural, human-written continuation or improvement of the user's message
- Use simple, clear, familiar words for easy understanding
- Maintain a genuine, positive tone that aligns with the user's message sentiment
- Incorporate key details, themes, or context from the user's message to ensure relevance
- Avoid generic praise or unrelated appreciation; focus on extending the user's intent
- Avoid clichés, overly polished language, or robotic phrasing
- Keep the original meaning and intent intact
- Ensure the message is exactly 80 words`
    : `Write a heartfelt appreciation message in ${selectedLanguage.label} language with exactly 80 words.

Rules:
- Keep the tone genuine, positive, and warm
- Make it relatable and meaningful, suitable for a general gesture of appreciation
- Use simple, clear, familiar words for easy understanding
- Avoid generic compliments or clichés; focus on a sincere, human-written message
- Highlight positive qualities, actions, or impact in a broad, versatile way
- Ensure the message is exactly 80 words`
}
`;

const randomNumber = Math.floor(Math.random() * 3) + 1;
export default function useKudoMessageViewModel() {
  const { selectedLanguage } = useLanguage();
  const { formData, setFormData, initialKudo }: any = usePostContext();
  const [textGenerateByAI, setTextGenerateByAI] = useState("");
  const [isLoading, setLoading] = useState(false);
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const { t } = useTranslation();

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: { message: formData.message },
    validationSchema: Yup.object({
      message: Yup.string()
        .min(3, "Too short!")
        .max(1000, "Too long!")
        .required("Message is required"),
    }),
    onSubmit: async (values) => {
      try {
        let sentimentGenerateByAI = "Thank You";
        if (process.env.NODE_ENV === "production") {
          setLoading(true);
          sentimentGenerateByAI = await generateMessageFromAI(
            sentimentPrompt(values.message, selectedLanguage),
            false
          );
        }
        setFormData({
          ...formData,
          message: values.message,
          sentiment: sentimentGenerateByAI,
        });
        router.push("/kudo/library");
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (formData.isKudoSent) {
      setFormData(initialKudo);
    }
  }, [formData]);

  const generateAIMessageHandler = async (e: any) => {
    e.preventDefault();
    if (isLoading) return;
    try {
      setLoading(true);
      const message = await generateMessageFromAI(
        messagePrompt(selectedLanguage, formik.values.message),
        true
      );
      setTextGenerateByAI(message);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUseAIText = (e: any) => {
    e.preventDefault();
    formik.setFieldValue("message", textGenerateByAI);
    setTextGenerateByAI("");
  };

  return {
    formik,
    textGenerateByAI,
    generateAIMessageHandler,
    handleUseAIText,
    isLoading,
    randomNumber: randomNumber,
    isClient,
    t,
  };
}
