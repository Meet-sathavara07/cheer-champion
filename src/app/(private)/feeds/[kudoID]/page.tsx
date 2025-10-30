import Kudo from "./Kudo";
import { openGraphMetaData, twitterMetaData } from "@/app/shared-metadata";
import { getKudoDetails } from "@/app/actions/kudo";
import * as Sentry from "@sentry/nextjs";
import { KudoMetaTemplates } from "@/app/utils/metaCardTemplates";

type Props = {
  params: Promise<{ kudoID: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props) {
  try {
    const baseURL =
      process.env.NEXT_PUBLIC_BASE_URL || "https://www.cheerchampion.com";

    const { kudoID } = await params;
    const kudoDetails = await getKudoDetails(kudoID);
    if (!kudoDetails) {
      return {
        title: "Kudo Not Found",
        description: "This kudo does not exist or has been removed.",
        openGraph: {
          title: "Kudo Not Found | Cheer Champion",
          description: "This kudo does not exist or has been removed.",
          url: `${baseURL}/feeds/${kudoID}`,
          siteName: "Cheer Champion",
        },
      };
    }

    const receivers = (receivers: any[]) => {
      const receiversArray = () => {
        return receivers.map(
          (receiver) => receiver.$users[0]?.user_profile.name
        );
      };
      return receiversArray().join(", ");
    };

    const senderName = kudoDetails.$users[0].user_profile.name;
    const kudoReceivers = receivers(kudoDetails.kudo_receiver);
    // Randomly select a template
    const randomTemplate = KudoMetaTemplates[Math.floor(Math.random() * KudoMetaTemplates.length)];

    return {
      title: randomTemplate.title(kudoReceivers),
      description: randomTemplate.description(kudoReceivers),
      openGraph: {
        ...openGraphMetaData,
        type: "article",
        url: `${baseURL}/feeds/${kudoID}`,
        title: randomTemplate.title(kudoReceivers),
        description: randomTemplate.description(kudoReceivers),
        images: [
          {
            url: kudoDetails.file_url,
            width: 1200,
            height: 630,
            alt: "Kudo Image",
          },
        ],
      },
      twitter: {
        ...twitterMetaData,
        title: randomTemplate.title(kudoReceivers),
        description: randomTemplate.description(kudoReceivers),
        images: [
          {
            url: kudoDetails.file_url,
            width: 1200,
            height: 630,
            alt: "Kudo Image",
          },
        ],
      },
    };
  } catch (error) {
    Sentry.captureException(error);
    console.log(error, "error");
  }
}

export default function KudoPage({
  params,
}: {
  params: Promise<{ kudoID: string }>;
}) {
  return <Kudo params={params} />;
}
