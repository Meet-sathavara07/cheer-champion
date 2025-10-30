import type { Metadata } from 'next'
import { openGraphMetaData, twitterMetaData } from '@/app/shared-metadata';
import UpdateProfile from './UpdateProfile';
export const metadata: Metadata = {
  title: 'Update Profile',
  description: 'Update your profile  on Cheer Champion.',
  openGraph: {
    ...openGraphMetaData,
    title: "Update Profile",
    description: "Update your profile  on Cheer Champion.",
  },
  twitter: {
    ...twitterMetaData,
    title: "Update Profile",
    description: "Update your profile  on Cheer Champion.",
  },
}


export default function ViewProfilePage() {
  return (
    <UpdateProfile/>
  );
}
