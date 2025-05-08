
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Attendee } from "@/types";
import { getAttendees, createAttendee, updateAttendeeStatus } from "@/services/attendeeService";

interface AttendeeContextType {
  attendees: Attendee[];
  loading: boolean;
  error: Error | null;
  addAttendee: (attendee: Omit<Attendee, "id" | "qrCode">) => Promise<Attendee>;
  toggleAttendeeStatus: (id: string) => Promise<Attendee | undefined>;
  checkInAttendee: (id: string) => Promise<Attendee | undefined>;
  checkOutAttendee: (id: string) => Promise<Attendee | undefined>;
  refreshAttendees: () => Promise<void>;
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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const refreshAttendees = async () => {
    try {
      setLoading(true);
      const data = await getAttendees();
      setAttendees(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch attendees"));
      console.error("Failed to fetch attendees:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load initial attendee data
    refreshAttendees();
  }, []);

  const addAttendee = async (attendeeData: Omit<Attendee, "id" | "qrCode">) => {
    try {
      const defaultAttendee = {
        ...attendeeData,
        isCheckedIn: false,
        isCheckedOut: false,
      };
      
      const newAttendee = await createAttendee(defaultAttendee);
      setAttendees(prev => [...prev, newAttendee]);
      return newAttendee;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to add attendee"));
      throw err;
    }
  };

  const toggleAttendeeStatus = async (id: string): Promise<Attendee | undefined> => {
    const attendee = attendees.find(a => a.id === id);
    if (!attendee) return undefined;
    
    try {
      const updatedAttendee = await updateAttendeeStatus(id, !attendee.isCheckedIn);
      
      if (updatedAttendee) {
        setAttendees(attendees.map(a => a.id === id ? updatedAttendee : a));
      }
      
      return updatedAttendee;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to update attendee status"));
      return undefined;
    }
  };

  const checkInAttendee = async (id: string): Promise<Attendee | undefined> => {
    try {
      const updatedAttendee = await updateAttendeeStatus(id, true);
      
      if (updatedAttendee) {
        setAttendees(attendees.map(a => a.id === id ? updatedAttendee : a));
      }
      
      return updatedAttendee;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to check in attendee"));
      return undefined;
    }
  };

  const checkOutAttendee = async (id: string): Promise<Attendee | undefined> => {
    const attendee = attendees.find(a => a.id === id);
    if (!attendee || !attendee.isCheckedIn) return undefined;
    
    try {
      // Always set to false for check out
      const updatedAttendee = await updateAttendeeStatus(id, false);
      
      if (updatedAttendee) {
        setAttendees(attendees.map(a => a.id === id ? updatedAttendee : a));
      }
      
      return updatedAttendee;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to check out attendee"));
      return undefined;
    }
  };

  const value = {
    attendees,
    loading,
    error,
    addAttendee,
    toggleAttendeeStatus,
    checkInAttendee,
    checkOutAttendee,
    refreshAttendees
  };

  return <AttendeeContext.Provider value={value}>{children}</AttendeeContext.Provider>;
}
