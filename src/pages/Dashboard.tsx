
import { useState } from "react";
import { useAttendees } from "@/context/AttendeeContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UserCheck, User, Users, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ReloadIcon } from "@radix-ui/react-icons";

const Dashboard = () => {
  const { attendees, loading, refreshAttendees } = useAttendees();
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredAttendees = attendees.filter(attendee => 
    attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attendee.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attendee.region.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const checkedInCount = attendees.filter(a => a.isCheckedIn).length;
  const checkedOutCount = attendees.filter(a => a.isCheckedOut).length;

  const formatDateTime = (dateTimeStr?: string) => {
    if (!dateTimeStr) return "—";
    try {
      return format(new Date(dateTimeStr), "MMM d, yyyy h:mm a");
    } catch (error) {
      return "Invalid date";
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary">Attendance Dashboard</h1>
          <p className="text-gray-600">Track and manage attendee check-ins</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            size="icon"
            onClick={() => refreshAttendees()}
            disabled={loading}
            title="Refresh data"
          >
            {loading ? <ReloadIcon className="h-4 w-4 animate-spin" /> : <ReloadIcon className="h-4 w-4" />}
          </Button>
          <Input
            type="search"
            placeholder="Search attendees..."
            className="max-w-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
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
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <ReloadIcon className="h-6 w-6 animate-spin mr-2" />
              <span>Loading attendees...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact Number</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Check-In Time</TableHead>
                    <TableHead>Check-Out Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttendees.length > 0 ? (
                    filteredAttendees.map((attendee) => (
                      <TableRow key={attendee.id}>
                        <TableCell className="font-medium">{attendee.name}</TableCell>
                        <TableCell>{attendee.phone}</TableCell>
                        <TableCell>{attendee.region}</TableCell>
                        <TableCell className="capitalize">{attendee.gender}</TableCell>
                        <TableCell>
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
                        </TableCell>
                        <TableCell>{formatDateTime(attendee.checkInTime)}</TableCell>
                        <TableCell>{formatDateTime(attendee.checkOutTime)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-500 py-6">
                        {searchTerm ? "No attendees found matching your search." : "No attendees registered yet."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
