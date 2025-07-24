import { cn } from "~/utils/misc";

export function Img({
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      className={cn(
        "mx-auto my-6 max-w-full rounded-md border object-cover shadow-sm",
        className,
      )}
      loading="lazy"
      {...props}
    />
  );
}

interface MDXIframeProps {
  videoId: string;
  type: "youtube" | "bunny";
}

export function Iframe({ videoId, type = "youtube" }: MDXIframeProps) {
  const srcUrls = {
    youtube: `https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0&modestbranding=1&iv_load_policy=3`,
    bunny: `https://iframe.mediadelivery.net/embed/${parseInt(window.env.LIBRARY_ID)}/${videoId}?autoplay=0`,
  } as const;

  const srcTitle = {
    youtube: `YouTube video player`,
    bunny: `Bunny CDN video player`,
  };

  return (
    <div
      className={cn("no-pre w-full", {
        "relative pt-[56.25%]": type === "bunny",
      })}
    >
      <iframe
        src={srcUrls[type]}
        title={srcTitle[type]}
        allowFullScreen
        loading="lazy"
        className={cn({
          "aspect-video w-full border-0": type === "youtube",
          "absolute top-0 h-full w-full border-none": type === "bunny",
        })}
        allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  );
}
