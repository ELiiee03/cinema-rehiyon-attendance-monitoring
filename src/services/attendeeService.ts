
import { Attendee, SupabaseAttendee } from "@/types";
import QRCode from "qrcode";
import { supabase } from "@/integrations/supabase/client";

// Helper function to map from Supabase format to our application format
const mapToAttendee = async (supabaseAttendee: SupabaseAttendee): Promise<Attendee> => {
  // Generate QR code
  const qrCode = await QRCode.toDataURL(supabaseAttendee.id);
  
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

export const getAttendees = async (): Promise<Attendee[]> => {
  const { data, error } = await supabase.from("attendees").select("*");
  
  if (error) {
    console.error("Error fetching attendees:", error);
    return [];
  }
  
  // Generate QR codes for each attendee
  const attendeesWithQR = await Promise.all(
    data.map(attendee => mapToAttendee(attendee as SupabaseAttendee))
  );
  
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
    return undefined;
  }
  
  let updateData: any = {};
  
  if (isCheckedIn) {
    // Checking in
    updateData = {
      is_checked_in: true,
      check_in_time: now
    };
  } else {
    // Checking out
    updateData = {
      is_checked_out: true,
      check_out_time: now
    };
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
  
  return mapToAttendee(data as SupabaseAttendee);
};
