import { Attendee } from "@/types";
import QRCode from "qrcode";

// Define SupabaseAttendee interface locally
interface SupabaseAttendee {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  region: string;
  is_checked_in: boolean;
  is_checked_out: boolean;
  check_in_time: string | null;
  check_out_time: string | null;
}
import { supabase } from "@/integrations/supabase/client";
import { createLog } from "./logService";

// Helper function to map from Supabase format to our application format
const mapToAttendee = async (supabaseAttendee: SupabaseAttendee): Promise<Attendee> => {
  // Generate QR code
  const qrCode = await QRCode.toDataURL(supabaseAttendee.id);
  
  // Debug logging to see raw data coming from Supabase
  console.log(`Raw Supabase data for ${supabaseAttendee.name}:`, {
    id: supabaseAttendee.id,
    is_checked_in: supabaseAttendee.is_checked_in,
    is_checked_out: supabaseAttendee.is_checked_out,
    check_in_time: supabaseAttendee.check_in_time,
    check_out_time: supabaseAttendee.check_out_time,
  });
  
  return {
    id: supabaseAttendee.id,
    name: supabaseAttendee.name,
    email: supabaseAttendee.email,
    phone: supabaseAttendee.phone,
    gender: supabaseAttendee.gender as "male" | "female" | "other",
    region: supabaseAttendee.region,
    isCheckedIn: supabaseAttendee.is_checked_in,
    isCheckedOut: supabaseAttendee.is_checked_out,
    checkInTime: supabaseAttendee.check_in_time,
    checkOutTime: supabaseAttendee.check_out_time,
    qrCode
  };
};

export const getAllAttendees = async (): Promise<Attendee[]> => {
  const { data, error } = await supabase
    .from("attendees")
    .select("*");
  
  if (error) {
    console.error("Error fetching attendees:", error);
    return [];
  }
  
  console.log("Raw data from Supabase:", data);
  
  // Generate QR codes for each attendee
  const attendeesWithQR = await Promise.all(
    data.map(attendee => mapToAttendee(attendee as SupabaseAttendee))
  );
  
  console.log("Mapped attendees after processing:", attendeesWithQR);
  
  return attendeesWithQR;
};

export const getAttendeeById = async (id: string): Promise<Attendee | undefined> => {
  const { data, error } = await supabase
    .from("attendees")
    .select("*")
    .eq("id", id)
    .single();
  
  if (error) {
    console.error("Error fetching attendee by ID:", error);
    return undefined;
  }
  
  // Use the mapToAttendee function for consistent mapping
  return mapToAttendee(data as SupabaseAttendee);
};

export const createAttendee = async (attendeeData: Omit<Attendee, "id" | "qrCode">): Promise<Attendee> => {
  // Transform from our app format to Supabase format
  const supabaseAttendee = {
    name: attendeeData.name,
    email: attendeeData.email,
    phone: attendeeData.phone,
    gender: attendeeData.gender,
    region: attendeeData.region,
    is_checked_in: attendeeData.isCheckedIn,
    is_checked_out: attendeeData.isCheckedOut
  };
  
  const { data, error } = await supabase
    .from("attendees")
    .insert([supabaseAttendee])
    .select()
    .single();
  
  if (error) {
    console.error("Error creating attendee:", error);
    throw new Error("Failed to create attendee");
  }
  
  // Use the mapToAttendee function for consistent mapping
  return mapToAttendee(data as SupabaseAttendee);
};

export const updateAttendeeStatus = async (id: string, isCheckedIn: boolean): Promise<Attendee | undefined> => {
  const now = new Date().toISOString();
  
  // First get the current attendee to check their status
  const { data: currentAttendee } = await supabase
    .from("attendees")
    .select("*")
    .eq("id", id)
    .single();
    
  if (!currentAttendee) {
    console.error("Attendee not found:", id);
    return undefined;
  }
  
  let updateData: any = {};
  let action: "check_in" | "check_out";
  
  if (isCheckedIn) {
    // Checking in
    updateData = {
      is_checked_in: true,
      check_in_time: now
    };
    action = "check_in";
  } else {
    // Checking out
    updateData = {
      is_checked_out: true,
      check_out_time: now
    };
    action = "check_out";
  }
  
  const { data, error } = await supabase
    .from("attendees")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating attendee status:", error);
    return undefined;
  }
  
  // Create a log entry for this action
  try {
    console.log(`Creating log entry for ${currentAttendee.name}, action: ${action}`);
    const logEntry = await createLog(id, currentAttendee.name, action);
    
    if (logEntry) {
      console.log(`Successfully created log entry:`, logEntry);
    } else {
      console.error(`Failed to create log entry for ${currentAttendee.name}, action: ${action}`);
    }
  } catch (e) {
    console.error(`Error creating log entry for ${currentAttendee.name}:`, e);
  }
  
  // Use the mapToAttendee function for consistent mapping
  return mapToAttendee(data as SupabaseAttendee);
};
