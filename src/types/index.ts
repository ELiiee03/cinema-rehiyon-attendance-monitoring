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

export interface AttendanceLog {
  id: string;
  attendeeId: string;
  attendeeName: string;
  action: "check_in" | "check_out";
  timestamp: string;
  createdAt: string;
}
