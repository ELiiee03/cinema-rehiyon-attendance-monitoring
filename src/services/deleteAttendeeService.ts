import { supabase } from "@/integrations/supabase/client";

export const deleteAttendee = async (id: string): Promise<boolean> => {
  try {
    // First, delete all related attendance logs
    const { error: logsError } = await supabase
      .from("attendance_logs")
      .delete()
      .match({ attendee_id: id });
    
    if (logsError) {
      console.error("Error deleting attendance logs for attendee:", logsError);
      return false;
    }
    
    // Then delete the attendee
    const { error } = await supabase
      .from("attendees")
      .delete()
      .match({ id });
    
    if (error) {
      console.error("Error deleting attendee:", error);
      return false;
    }
    
    console.log(`Successfully deleted attendee with ID: ${id} and their logs`);
    return true;
  } catch (e) {
    console.error("Unexpected error in deleteAttendee:", e);
    return false;
  }
};
