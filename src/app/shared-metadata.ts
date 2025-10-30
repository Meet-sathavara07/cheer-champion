const baseURL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://www.cheerchampion.com";
const previewImage = `${baseURL}/OpenGraph.png`;
export const openGraphMetaData = {
  type: "website",
  url: baseURL,
  title: "Cheer Champion - Spread Gratitude with Kudos",
  description:
    "Recognize and appreciate acts of kindness with Cheer Champion. Join the movement to spread gratitude!",
  siteName: "Cheer Champion",
  locale: "en_US",
  images: [
    {
      url: previewImage,
      width: 1200,
      height: 630,
      alt: "Cheer Champion Logo",
    },
  ],
};
export const twitterMetaData = {
  card: "summary_large_image", // Large preview card with an image
  site: "@CheerChampion", // Your Twitter handle (replace with actual)
  creator: "@CheerChampion", // Your brand or creator's Twitter handle
  title: "Cheer Champion - Spread Gratitude with Kudos",
  description:
    "Recognize and appreciate acts of kindness with Cheer Champion. Join the movement to spread gratitude!",
  images: [
    {
      url: previewImage, // Use a PNG/JPG image (1200x630 recommended)
      width: 1200,
      height: 630,
      alt: "Cheer Champion Logo",
    },
  ],
};
