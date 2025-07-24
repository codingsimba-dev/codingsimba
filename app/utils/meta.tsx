import { slogan } from "~/utils/constants";
import { getImgSrc } from "./misc";

interface MetadataProps {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
  keywords?: string;
}

export function generateMetadata({
  title = "TekBreed",
  description = slogan,
  url = "https://tekbreed.com",
  image = getImgSrc({ path: "assets", fileKey: "icon.png" }),
  imageAlt = "TekBreed",
  type = "website",
  keywords,
}: MetadataProps) {
  title =
    title.toLowerCase() !== "tekbreed" ? `${title} | TekBreed` : "TekBreed";
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Christopher S. Aondona (The Coding Simba)" />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={`https://tekbreed.com/${url}`} />
      <meta property="og:image" content={image} />
      <meta property="og:image:alt" content={imageAlt} />
      <meta property="og:type" content={type} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@tekbreed" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </>
  );
}
