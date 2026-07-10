import {
  Plane, Shield, Home, MapPin, Landmark, FileDigit, Stethoscope, IdCard,
  Smartphone, GraduationCap, Briefcase, LifeBuoy, Languages, Flag, Users,
  HeartHandshake, CircleDot, Banknote, VolumeX, Recycle, CalendarCheck,
  Store, MessageSquare, Tv, ShieldAlert,
} from "lucide-react";

const MAP = {
  plane: Plane,
  shield: Shield,
  home: Home,
  "map-pin": MapPin,
  landmark: Landmark,
  "file-digit": FileDigit,
  stethoscope: Stethoscope,
  "id-card": IdCard,
  smartphone: Smartphone,
  "graduation-cap": GraduationCap,
  briefcase: Briefcase,
  "life-buoy": LifeBuoy,
  languages: Languages,
  flag: Flag,
  users: Users,
  "heart-handshake": HeartHandshake,
  banknote: Banknote,
  "volume-x": VolumeX,
  recycle: Recycle,
  "calendar-check": CalendarCheck,
  store: Store,
  "message-square": MessageSquare,
  tv: Tv,
  "shield-alert": ShieldAlert,
};

export function getIcon(name) {
  return MAP[name] || CircleDot;
}
