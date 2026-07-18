import Image from "next/image";
import { Landmark } from "lucide-react";

/**
 * The media layer for a city (card thumbnail or hub header). Renders a
 * verifiably-licensed photo when one is set, otherwise a branded flag-palette
 * placeholder — so the site never ships an image of unknown provenance. The
 * caller owns the surrounding `relative` container plus any dark overlay and
 * text; this only fills that container.
 */
export function CityPhoto({
  image,
  alt,
  sizes,
  priority,
}: {
  image: string | null;
  alt: string;
  sizes: string;
  priority?: boolean;
}) {
  if (image) {
    return (
      <Image
        src={image}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
    );
  }

  return (
    <div
      aria-hidden
      className="absolute inset-0 bg-gradient-to-br from-primary via-primary-hover to-gold/70"
    >
      <Landmark
        className="absolute -bottom-3 -right-3 h-28 w-28 text-white/10"
        strokeWidth={1}
      />
    </div>
  );
}
