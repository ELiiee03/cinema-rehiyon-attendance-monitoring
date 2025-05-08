
import { Attendee } from "@/types";
import QRCode from "qrcode";

// Mock data storage (would be replaced with API calls in a real app)
let mockAttendees: Attendee[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    phone: "+1234567890",
    gender: "male",
    region: "North",
    isCheckedIn: true,
    checkInTime: "2025-05-08T09:30:00",
    qrCode: ""
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+1987654321",
    gender: "female",
    region: "South",
    isCheckedIn: false,
    qrCode: ""
  },
  {
    id: "3",
    name: "Alex Johnson",
    email: "alex@example.com",
    phone: "+1122334455",
    gender: "other",
    region: "East",
    isCheckedIn: true,
    checkInTime: "2025-05-08T10:15:00",
    qrCode: ""
  }
];

// Generate QR codes for mock data
(async () => {
  for (const attendee of mockAttendees) {
    attendee.qrCode = await QRCode.toDataURL(attendee.id);
  }
})();

export const getAttendees = (): Attendee[] => {
  return mockAttendees;
};

export const getAttendeeById = (id: string): Attendee | undefined => {
  return mockAttendees.find(attendee => attendee.id === id);
};

export const createAttendee = async (attendee: Omit<Attendee, "id" | "qrCode">): Promise<Attendee> => {
  const newId = Date.now().toString();
  const qrCode = await QRCode.toDataURL(newId);
  
  const newAttendee: Attendee = {
    ...attendee,
    id: newId,
    qrCode
  };
  
  mockAttendees.push(newAttendee);
  return newAttendee;
};

export const updateAttendeeStatus = (id: string, isCheckedIn: boolean): Attendee | undefined => {
  const attendee = mockAttendees.find(a => a.id === id);
  if (!attendee) return undefined;

  const now = new Date().toISOString();
  
  if (isCheckedIn) {
    attendee.isCheckedIn = true;
    attendee.checkInTime = now;
    attendee.checkOutTime = undefined;
  } else {
    attendee.isCheckedIn = false;
    attendee.checkOutTime = now;
  }
  
  return attendee;
};
