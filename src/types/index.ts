
export interface Attendee {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: "male" | "female" | "other";
  region: string;
  isCheckedIn: boolean;
  isCheckedOut: boolean;
  checkInTime?: string;
  checkOutTime?: string;
  qrCode: string;
}

// Interface to match Supabase database structure
export interface SupabaseAttendee {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  region: string;
  is_checked_in: boolean;
  is_checked_out: boolean;
  check_in_time?: string;
  check_out_time?: string;
  created_at: string;
}
