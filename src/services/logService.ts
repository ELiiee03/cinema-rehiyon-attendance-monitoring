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
  const { data, error } = await supabase
    .from("attendance_logs")
    .select("*")
    .order("timestamp", { ascending: false });
  
  if (error) {
    console.error("Error fetching attendance logs:", error);
    return [];
  }
  
  return data.map(log => mapToAttendanceLog(log as SupabaseAttendanceLog));
};

export const getLogsByAttendeeId = async (attendeeId: string): Promise<AttendanceLog[]> => {
  const { data, error } = await supabase
    .from("attendance_logs")
    .select("*")
    .eq("attendee_id", attendeeId)
    .order("timestamp", { ascending: false });
  
  if (error) {
    console.error("Error fetching attendance logs for attendee:", error);
    return [];
  }
  
  return data.map(log => mapToAttendanceLog(log as SupabaseAttendanceLog));
};

export const createLog = async (
  attendeeId: string, 
  attendeeName: string, 
  action: "check_in" | "check_out"
): Promise<AttendanceLog | undefined> => {
  const now = new Date().toISOString();
  
  const logData = {
    attendee_id: attendeeId,
    attendee_name: attendeeName,
    action,
    timestamp: now
  };
  
  const { data, error } = await supabase
    .from("attendance_logs")
    .insert([logData])
    .select()
    .single();
  
  if (error) {
    console.error("Error creating attendance log:", error);
    return undefined;
  }
  
  return mapToAttendanceLog(data as SupabaseAttendanceLog);
}; 