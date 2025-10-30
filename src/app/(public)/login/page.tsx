import type { Metadata } from 'next'
import Login from './Login';
import { openGraphMetaData, twitterMetaData } from "@/app/shared-metadata";

export const metadata: Metadata = {
  title: 'Login to Cheer Champion',
  description: 'Sign in to Cheer Champion and start spreading gratitude.',
  keywords: 'login, cheer champion, gratitude app, sign in, kudo platform',
 
  openGraph: {
    ...openGraphMetaData,
    title: "Login to Cheer Champion",
    description: "Sign in to Cheer Champion and start spreading gratitude.",
  },
  twitter: {
    ...twitterMetaData,
    title: "Login to Cheer Champion",
    description: "Sign in to Cheer Champion and start spreading gratitude.",
  },
}


export default function LoginPage() {
  return (
    <Login/>
  );
}
