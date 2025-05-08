
import { useState } from "react";
import { useAttendees } from "@/context/AttendeeContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Attendee } from "@/types";
import { RotateCw } from "lucide-react";

const Register = () => {
  const { addAttendee } = useAttendees();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newAttendee, setNewAttendee] = useState<Omit<Attendee, "id" | "qrCode" | "isCheckedIn" | "isCheckedOut">>({
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
        isCheckedIn: false,
        isCheckedOut: false
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

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-3">
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
                {isSubmitting ? (
                  <>
                    <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : "Register Attendee"}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {registeredAttendee && (
          <Card className="mt-6 text-center p-6">
            <CardTitle className="text-lg mb-4">Registration Successful</CardTitle>
            <div className="space-y-2">
              <p className="font-medium">{registeredAttendee.name} has been registered</p>
              <p className="text-sm text-gray-500">{registeredAttendee.email}</p>
              <p className="text-sm text-gray-500">{registeredAttendee.phone}</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Register;
