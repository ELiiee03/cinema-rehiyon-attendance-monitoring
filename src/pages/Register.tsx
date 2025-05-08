
import { useState } from "react";
import { useAttendees } from "@/context/AttendeeContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Attendee } from "@/types";

const Register = () => {
  const { addAttendee } = useAttendees();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newAttendee, setNewAttendee] = useState<Omit<Attendee, "id" | "qrCode" | "isCheckedIn">>({
    name: "",
    email: "",
    phone: "",
    gender: "male",
    region: "",
  });
  const [registeredAttendee, setRegisteredAttendee] = useState<Attendee | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAttendee(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewAttendee(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAttendee.name || !newAttendee.email || !newAttendee.region) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    try {
      setIsSubmitting(true);
      const attendee = await addAttendee({
        ...newAttendee,
        isCheckedIn: false
      });
      
      setRegisteredAttendee(attendee);
      setNewAttendee({
        name: "",
        email: "",
        phone: "",
        gender: "male",
        region: "",
      });
      
      toast.success(`${attendee.name} has been successfully registered`);
    } catch (error) {
      toast.error("Failed to register attendee");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const downloadQRCode = () => {
    if (!registeredAttendee?.qrCode) return;
    
    const link = document.createElement('a');
    link.href = registeredAttendee.qrCode;
    link.download = `${registeredAttendee.name.replace(/\s+/g, '_')}_qrcode.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-6">Register New Attendee</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Attendee Information</CardTitle>
            <CardDescription>Enter the details of the new attendee</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={newAttendee.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={newAttendee.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={newAttendee.phone}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select 
                    value={newAttendee.gender} 
                    onValueChange={(value) => handleSelectChange("gender", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="region">Region/City *</Label>
                  <Input
                    id="region"
                    name="region"
                    value={newAttendee.region}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full mt-6 bg-secondary hover:bg-secondary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Registering..." : "Register Attendee"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold text-primary mb-6">Generated QR Code</h2>
        
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-sm">Scan to Check-In</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pb-6">
            {registeredAttendee ? (
              <>
                <div className="bg-white p-3 rounded-md inline-block mx-auto">
                  <img 
                    src={registeredAttendee.qrCode} 
                    alt="Attendee QR Code"
                    className="w-48 h-48 mx-auto"
                  />
                </div>
                
                <div className="space-y-1 text-left">
                  <p className="text-sm font-medium">{registeredAttendee.name}</p>
                  <p className="text-xs text-gray-500">{registeredAttendee.email}</p>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={downloadQRCode}
                >
                  Download QR Code
                </Button>
              </>
            ) : (
              <div className="h-48 flex items-center justify-center">
                <p className="text-gray-500 text-sm">
                  QR code will appear here after registration
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              1. Complete the registration form
            </p>
            <p>
              2. Download or share the generated QR code with the attendee
            </p>
            <p>
              3. The attendee can use this QR code for check-in at the event
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
