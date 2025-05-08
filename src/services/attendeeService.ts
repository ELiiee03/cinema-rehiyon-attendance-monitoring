
import { Attendee } from "@/types";
import QRCode from "qrcode";
import { supabase } from "@/integrations/supabase/client";

export const getAttendees = async (): Promise<Attendee[]> => {
  const { data, error } = await supabase.from("attendees").select("*");
  
  if (error) {
    console.error("Error fetching attendees:", error);
    return [];
  }
  
  // Generate QR codes for each attendee
  const attendeesWithQR = await Promise.all(
    data.map(async (attendee) => {
      const qrCode = await QRCode.toDataURL(attendee.id);
      return { ...attendee, qrCode };
    })
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
  
  // Generate QR code
  const qrCode = await QRCode.toDataURL(data.id);
  
  return { ...data, qrCode };
};

export const createAttendee = async (attendee: Omit<Attendee, "id" | "qrCode">): Promise<Attendee> => {
  const { data, error } = await supabase
    .from("attendees")
    .insert([attendee])
    .select()
    .single();
  
  if (error) {
    console.error("Error creating attendee:", error);
    throw new Error("Failed to create attendee");
  }
  
  // Generate QR code
  const qrCode = await QRCode.toDataURL(data.id);
  
  return { ...data, qrCode };
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
  
  // Generate QR code
  const qrCode = await QRCode.toDataURL(data.id);
  
  return { ...data, qrCode };
};
