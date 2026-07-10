import {
  GraduationCap,
  Briefcase,
  HandHeart,
  Globe,
  Users,
  type LucideIcon,
} from "lucide-react";

/**
 * Presentation-only metadata per persona (keyed by persona slug in
 * lib/persona-copy.ts). Icon + one-line blurb used on the landing page, the
 * /explore wizard, and the /roadmap header. Blurbs are neutral framing of the
 * persona's path — never bureaucratic facts (those come from the DB).
 */
export const PERSONA_UI: Record<string, { icon: LucideIcon; blurb: string }> = {
  student: {
    icon: GraduationCap,
    blurb: "Enrolment, the essentials, and staying on the right footing.",
  },
  "skilled-worker": {
    icon: Briefcase,
    blurb: "Get set up to be paid and have your qualifications recognised.",
  },
  refugee: {
    icon: HandHeart,
    blurb: "The same steps, laid out gently and at your own pace.",
  },
  "eu-citizen": {
    icon: Globe,
    blurb: "One of the shortest paths — mostly getting set up and settling in.",
  },
  "joining-family": {
    icon: Users,
    blurb: "Settle your own status, then the essentials of daily life.",
  },
};

export const FALLBACK_PERSONA_ICON = Users;
