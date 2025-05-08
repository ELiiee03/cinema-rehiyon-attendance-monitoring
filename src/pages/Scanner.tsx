
import { useState, useEffect } from "react";
import { QrReader } from "react-qr-reader";
import { useAttendees } from "@/context/AttendeeContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const Scanner = () => {
  const [isScanning, setIsScanning] = useState(true);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const { attendees, toggleAttendeeStatus } = useAttendees();

  const handleScan = (result: any) => {
    if (!result || !isScanning) return;

    const scannedData = result.text;
    
    if (scannedData === lastScanned) return;
    
    setLastScanned(scannedData);
    setIsScanning(false);
    
    // Find attendee by ID (which is stored in QR code)
    const attendee = attendees.find(a => a.id === scannedData);
    
    if (attendee) {
      const updated = toggleAttendeeStatus(scannedData);
      
      if (updated) {
        toast.success(
          updated.isCheckedIn 
            ? `${attendee.name} successfully checked in!` 
            : `${attendee.name} checked out!`
        );
      }
    } else {
      toast.error("Invalid QR code. Attendee not found.");
    }
    
    // Re-enable scanning after a short delay
    setTimeout(() => setIsScanning(true), 2000);
  };

  const toggleCamera = () => {
    setFacingMode(facingMode === "environment" ? "user" : "environment");
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-primary">QR Code Scanner</h1>
        <p className="text-gray-600 mt-1">Scan attendee QR codes to check-in or check-out</p>
      </div>
      
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="relative">
            <QrReader
              constraints={{ facingMode }}
              onResult={handleScan}
              containerStyle={{ width: "100%" }}
              videoStyle={{ width: "100%" }}
            />
            <div className={cn(
              "absolute inset-0 border-2 border-white/50 transition-opacity",
              isScanning ? "opacity-100" : "opacity-0"
            )}>
              <div className="w-full h-full flex items-center justify-center">
                <div className={cn(
                  "w-64 h-64 border-2 border-secondary rounded-lg",
                  isScanning && "animate-pulse-scale"
                )}></div>
              </div>
            </div>
          </div>
        </CardContent>
        <div className="p-4 bg-muted/20 text-center">
          <button 
            onClick={toggleCamera}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Switch Camera
          </button>
        </div>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Scan Instructions</CardTitle>
          <CardDescription>Position the QR code within the frame to scan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">
            1. Allow camera access if prompted
          </p>
          <p className="text-sm">
            2. Point your device's camera at the attendee's QR code
          </p>
          <p className="text-sm">
            3. Hold steady until the code is recognized
          </p>
          <p className="text-sm">
            4. You'll see a confirmation message when the scan is successful
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Scanner;
