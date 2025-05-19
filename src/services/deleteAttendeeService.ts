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

export const deleteAllAttendees = async (): Promise<boolean> => {
  try {
    // First, delete all attendance logs
    const { error: logsError } = await supabase
      .from("attendance_logs")
      .delete()
      .gte('id', '0'); // This will match all logs
    
    if (logsError) {
      console.error("Error deleting all attendance logs:", logsError);
      return false;
    }
    
    // Then delete all attendees
    const { error } = await supabase
      .from("attendees")
      .delete()
      .gte('id', '0'); // This will match all attendees
    
    if (error) {
      console.error("Error deleting all attendees:", error);
      return false;
    }
    
    console.log("Successfully deleted all attendees and their logs");
    return true;
  } catch (e) {
    console.error("Unexpected error in deleteAllAttendees:", e);
    return false;
  }
};
