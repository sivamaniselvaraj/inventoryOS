/* ── User & Location ────────────────────────────────────────────── */

export interface Location {
  id: string;
  name: string;
  city: string;
  state: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  fullName: string;
  avatarInitials: string;
  role: string[];
  locations: Location[];
}
