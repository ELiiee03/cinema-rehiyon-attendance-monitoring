import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Attendee, AttendanceLog } from "@/types";
import { getAllAttendees, createAttendee, updateAttendeeStatus, deleteAttendee, deleteAllAttendees } from "@/services/attendeeService";
import { getLogs, getLogsByAttendeeId } from "@/services/logService";

interface AttendeeContextType {
  attendees: Attendee[];
  logs: AttendanceLog[];
  loading: boolean;
  logsLoading: boolean;
  error: Error | null;
  addAttendee: (attendee: Omit<Attendee, "id" | "qrCode">) => Promise<Attendee>;
  toggleAttendeeStatus: (id: string) => Promise<Attendee | undefined>;
  checkInAttendee: (id: string) => Promise<Attendee | undefined>;
  checkOutAttendee: (id: string) => Promise<Attendee | undefined>;
  deleteAttendee: (id: string) => Promise<boolean>;
  deleteAllAttendees: () => Promise<boolean>;
  refreshAttendees: () => Promise<void>;
  refreshLogs: () => Promise<void>;
  getAttendeeLogsById: (id: string) => Promise<AttendanceLog[]>;
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
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [logsLoading, setLogsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const refreshAttendees = async () => {
    try {
      setLoading(true);
      const data = await getAllAttendees();
      setAttendees(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch attendees"));
      console.error("Failed to fetch attendees:", err);
    } finally {
      setLoading(false);
    }
  };
  
  const refreshLogs = async () => {
    try {
      setLogsLoading(true);
      const data = await getLogs();
      setLogs(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch logs"));
      console.error("Failed to fetch logs:", err);
    } finally {
      setLogsLoading(false);
    }
  };
  
  const getAttendeeLogsById = async (id: string): Promise<AttendanceLog[]> => {
    try {
      return await getLogsByAttendeeId(id);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch attendee logs"));
      console.error("Failed to fetch attendee logs:", err);
      return [];
    }
  };

  useEffect(() => {
    // Load initial attendee data and logs
    refreshAttendees();
    refreshLogs();
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
  const handleDeleteAttendee = async (id: string): Promise<boolean> => {
    try {
      const success = await deleteAttendee(id);
      
      if (success) {
        // Remove the attendee from the local state
        setAttendees(attendees.filter(a => a.id !== id));
        
        // Also filter out logs associated with this attendee
        setLogs(logs.filter(log => log.attendeeId !== id));
      }
      
      return success;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to delete attendee"));
      return false;
    }
  };

  const handleDeleteAllAttendees = async (): Promise<boolean> => {
    try {
      const success = await deleteAllAttendees();
      
      if (success) {
        // Clear all attendees and logs from the local state
        setAttendees([]);
        setLogs([]);
      }
      
      return success;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to delete all attendees"));
      return false;
    }
  };  const value = {
    attendees,
    logs,
    loading,
    logsLoading,
    error,
    addAttendee,
    toggleAttendeeStatus,
    checkInAttendee,
    checkOutAttendee,
    deleteAttendee: handleDeleteAttendee,
    deleteAllAttendees: handleDeleteAllAttendees,
    refreshAttendees,
    refreshLogs,
    getAttendeeLogsById
  };

  return <AttendeeContext.Provider value={value}>{children}</AttendeeContext.Provider>;
}
