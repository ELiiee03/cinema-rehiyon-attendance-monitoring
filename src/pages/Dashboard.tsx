
import { useState } from "react";
import { useAttendees } from "@/context/AttendeeContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, UserCheck, User, Users, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const Dashboard = () => {
  const { attendees, checkInAttendee, checkOutAttendee } = useAttendees();
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredAttendees = attendees.filter(attendee => 
    attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attendee.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attendee.region.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const checkedInCount = attendees.filter(a => a.isCheckedIn).length;
  const checkedOutCount = attendees.filter(a => a.isCheckedOut).length;

  const handleCheckIn = (id: string) => {
    const updatedAttendee = checkInAttendee(id);
    if (updatedAttendee) {
      toast.success(`${updatedAttendee.name} has been checked in`);
    }
  };

  const handleCheckOut = (id: string) => {
    const updatedAttendee = checkOutAttendee(id);
    if (updatedAttendee) {
      toast.success(`${updatedAttendee.name} has been checked out`);
    } else {
      toast.error("Attendee must be checked in before checking out");
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary">Attendance Dashboard</h1>
          <p className="text-gray-600">Track and manage attendee check-ins</p>
        </div>
        
        <Input
          type="search"
          placeholder="Search attendees..."
          className="max-w-xs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-primary text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total Attendees</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{attendees.length}</span>
              <Users className="h-6 w-6 opacity-75" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-secondary text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Checked In</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{checkedInCount}</span>
              <UserCheck className="h-6 w-6 opacity-75" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-tertiary text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Not Checked In</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{attendees.length - checkedInCount}</span>
              <User className="h-6 w-6 opacity-75" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-accent text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Checked Out</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{checkedOutCount}</span>
              <LogOut className="h-6 w-6 opacity-75" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Attendee List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Contact Number</th>
                  <th className="px-4 py-3">Region</th>
                  <th className="px-4 py-3">Gender</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendees.length > 0 ? (
                  filteredAttendees.map((attendee) => (
                    <tr key={attendee.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{attendee.name}</td>
                      <td className="px-4 py-3">{attendee.phone}</td>
                      <td className="px-4 py-3">{attendee.region}</td>
                      <td className="px-4 py-3 capitalize">{attendee.gender}</td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                          attendee.isCheckedOut 
                            ? "bg-blue-100 text-blue-800" 
                            : attendee.isCheckedIn 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                        )}>
                          {attendee.isCheckedOut 
                            ? "Checked Out" 
                            : attendee.isCheckedIn 
                              ? "Checked In" 
                              : "Not Checked In"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          {!attendee.isCheckedIn && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleCheckIn(attendee.id)}
                              className="text-green-600 border-green-600 hover:bg-green-50"
                            >
                              <Check className="h-4 w-4 mr-1" /> Check In
                            </Button>
                          )}
                          {attendee.isCheckedIn && !attendee.isCheckedOut && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleCheckOut(attendee.id)}
                              className="text-blue-600 border-blue-600 hover:bg-blue-50"
                            >
                              <LogOut className="h-4 w-4 mr-1" /> Check Out
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-b">
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                      No attendees found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
