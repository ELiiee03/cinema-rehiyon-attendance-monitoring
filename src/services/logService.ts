import { AttendanceLog } from "@/types";
import { SupabaseAttendanceLog } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";

// Helper function to map from Supabase format to our application format
const mapToAttendanceLog = (supabaseLog: SupabaseAttendanceLog): AttendanceLog => {
  return {
    id: supabaseLog.id,
    attendeeId: supabaseLog.attendee_id,
    attendeeName: supabaseLog.attendee_name,
    action: supabaseLog.action as "check_in" | "check_out",
    timestamp: supabaseLog.timestamp,
    createdAt: supabaseLog.created_at
  };
};

export const getLogs = async (): Promise<AttendanceLog[]> => {
  try {
    const { data, error } = await supabase
      .from("attendance_logs")
      .select("*")
      .order("timestamp", { ascending: false });
    
    if (error) {
      console.error("Error fetching attendance logs:", error.message);
      console.error("Error details:", JSON.stringify(error));
      return [];
    }
    
    return data.map(log => mapToAttendanceLog(log as SupabaseAttendanceLog));
  } catch (e) {
    console.error("Unexpected error in getLogs:", e);
    return [];
  }
};

export const getLogsByAttendeeId = async (attendeeId: string): Promise<AttendanceLog[]> => {
  try {
    // Fetch logs from the attendance_logs table where attendee_id matches
    const { data, error } = await supabase
      .from("attendance_logs")
      .select("*")
      .eq("attendee_id", attendeeId)
      .order("timestamp", { ascending: false });
    
    if (error) {
      console.error("Error fetching attendance logs for attendee:", error.message);
      console.error("Error details:", JSON.stringify(error));
      return [];
    }
    
    console.log(`Retrieved ${data.length} logs for attendee ID ${attendeeId}`);
    
    // Map the Supabase data format to our application format
    return data.map(log => mapToAttendanceLog(log as SupabaseAttendanceLog));
  } catch (e) {
    console.error("Unexpected error in getLogsByAttendeeId:", e);
    return [];
  }
};

export const createLog = async (
  attendeeId: string, 
  attendeeName: string, 
  action: "check_in" | "check_out"
): Promise<AttendanceLog | undefined> => {
  try {
    const now = new Date().toISOString();
    
    const logData = {
      attendee_id: attendeeId,
      attendee_name: attendeeName,
      action,
      timestamp: now
    };
    
    console.log("Attempting to create log entry:", logData);
    
    const { data, error } = await supabase
      .from("attendance_logs")
      .insert([logData])
      .select()
      .single();
    
    if (error) {
      console.error("Error creating attendance log:", error.message);
      console.error("Error details:", JSON.stringify(error));
      console.error("Failed log data:", JSON.stringify(logData));
      return undefined;
    }
    
    console.log("Successfully created log entry:", data);
    return mapToAttendanceLog(data as SupabaseAttendanceLog);
  } catch (e) {
    console.error("Unexpected error in createLog:", e);
    console.error("Error details:", JSON.stringify(e, Object.getOwnPropertyNames(e)));
    return undefined;
  }
}; 