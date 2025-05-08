
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Attendee } from "@/types";
import { getAttendees, createAttendee, updateAttendeeStatus } from "@/services/attendeeService";

interface AttendeeContextType {
  attendees: Attendee[];
  addAttendee: (attendee: Omit<Attendee, "id" | "qrCode">) => Promise<Attendee>;
  toggleAttendeeStatus: (id: string) => Attendee | undefined;
  checkInAttendee: (id: string) => Attendee | undefined;
  checkOutAttendee: (id: string) => Attendee | undefined;
}

const AttendeeContext = createContext<AttendeeContextType | undefined>(undefined);

export function useAttendees() {
  const context = useContext(AttendeeContext);
  if (context === undefined) {
    throw new Error("useAttendees must be used within an AttendeeProvider");
  }
  return context;
}

interface AttendeeProviderProps {
  children: ReactNode;
}

export function AttendeeProvider({ children }: AttendeeProviderProps) {
  const [attendees, setAttendees] = useState<Attendee[]>([]);

  useEffect(() => {
    // Load initial attendee data
    const initialAttendees = getAttendees();
    setAttendees(initialAttendees);
  }, []);

  const addAttendee = async (attendeeData: Omit<Attendee, "id" | "qrCode">) => {
    const newAttendee = await createAttendee(attendeeData);
    setAttendees([...attendees, newAttendee]);
    return newAttendee;
  };

  const toggleAttendeeStatus = (id: string) => {
    const attendee = attendees.find(a => a.id === id);
    if (!attendee) return undefined;
    
    const updatedAttendee = updateAttendeeStatus(id, !attendee.isCheckedIn);
    
    if (updatedAttendee) {
      setAttendees(attendees.map(a => a.id === id ? updatedAttendee : a));
    }
    
    return updatedAttendee;
  };

  const checkInAttendee = (id: string) => {
    const attendee = attendees.find(a => a.id === id);
    if (!attendee) return undefined;
    
    const updatedAttendee = updateAttendeeStatus(id, true);
    
    if (updatedAttendee) {
      setAttendees(attendees.map(a => a.id === id ? updatedAttendee : a));
    }
    
    return updatedAttendee;
  };

  const checkOutAttendee = (id: string) => {
    const attendee = attendees.find(a => a.id === id);
    if (!attendee || !attendee.isCheckedIn) return undefined;
    
    // First ensure they're checked in, then check them out
    let updatedAttendee = updateAttendeeStatus(id, true);
    if (updatedAttendee) {
      updatedAttendee = {
        ...updatedAttendee,
        isCheckedOut: true,
        checkOutTime: new Date().toISOString()
      };
      
      setAttendees(attendees.map(a => a.id === id ? updatedAttendee! : a));
    }
    
    return updatedAttendee;
  };

  const value = {
    attendees,
    addAttendee,
    toggleAttendeeStatus,
    checkInAttendee,
    checkOutAttendee
  };

  return <AttendeeContext.Provider value={value}>{children}</AttendeeContext.Provider>;
}
