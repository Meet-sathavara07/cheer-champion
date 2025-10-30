import type { Metadata } from 'next'
import Feeds from './Feeds';
import { openGraphMetaData, twitterMetaData } from '@/app/shared-metadata';

export const metadata: Metadata = {
  title: 'Kudo Feeds',
  description: 'Explore a dynamic feed of Kudos and see gratitude.',
  openGraph: {
    ...openGraphMetaData,
    title: "Kudo Feeds",
    description: "Explore a dynamic feed of Kudos and see gratitude.",
  },
  twitter: {
    ...twitterMetaData,
    title: "Kudo Feeds",
    description: "Explore a dynamic feed of Kudos and see gratitude.",
  },
}

export default function FeedsPage() {
  return (
    <Feeds/>
  );
}
