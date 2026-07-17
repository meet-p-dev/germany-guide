import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

/** Renders trusted CMS markdown with the site's typographic style. */
export function Markdown({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "prose prose-neutral max-w-none dark:prose-invert",
        "prose-headings:font-display prose-headings:tracking-tight",
        "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
        "prose-strong:text-foreground prose-p:text-foreground/85 prose-li:text-foreground/85",
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
