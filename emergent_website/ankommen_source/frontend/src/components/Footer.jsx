import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="relative z-10 border-t border-border/60 bg-secondary/40">
      <div className="mx-auto max-w-7xl px-5 py-12 md:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground font-display font-extrabold">
                A
              </span>
              <span className="font-display text-lg font-extrabold">Ankommen</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Your calm, step-by-step guide to arriving and settling in Germany —
              tailored to your city and your situation.
            </p>
          </div>
          <div className="flex gap-16 text-sm">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Product
              </span>
              <Link to="/explore" className="text-foreground/80 hover:text-primary transition-colors">Explore</Link>
              <Link to="/register" className="text-foreground/80 hover:text-primary transition-colors">Create account</Link>
              <Link to="/login" className="text-foreground/80 hover:text-primary transition-colors">Log in</Link>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-border/60 pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Ankommen. Informational guidance only — always
          confirm details with official German authorities.
        </div>
      </div>
    </footer>
  );
};
