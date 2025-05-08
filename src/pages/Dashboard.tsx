import { useState, useEffect } from "react";
import { useAttendees } from "@/context/AttendeeContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UserCheck, User, Users, LogOut, FileDown, RefreshCw, ClipboardList, X } from "lucide-react";
import { UserCheck, User, Users, LogOut, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import * as XLSX from 'xlsx';
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
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AttendanceLog, Attendee } from "@/types";

const Dashboard = () => {
  const { attendees, logs, loading, logsLoading, refreshAttendees, refreshLogs, getAttendeeLogsById } = useAttendees();
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("attendees");
  const [selectedAttendee, setSelectedAttendee] = useState<string | null>(null);
  const [selectedAttendeeData, setSelectedAttendeeData] = useState<Attendee | null>(null);
  const [attendeeLogs, setAttendeeLogs] = useState<AttendanceLog[]>([]);
  const [loadingAttendeeLogs, setLoadingAttendeeLogs] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredAttendees = attendees.filter(attendee => 
    attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attendee.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attendee.region.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredLogs = logs.filter(log => 
    log.attendeeName.toLowerCase().includes(searchTerm.toLowerCase())
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
  
  const handleAttendeeRowClick = async (attendeeId: string, attendeeName: string) => {
    setSelectedAttendee(attendeeName);
    setLoadingAttendeeLogs(true);
    setIsModalOpen(true);
    
    // Find the full attendee data
    const attendeeData = attendees.find(a => a.id === attendeeId) || null;
    setSelectedAttendeeData(attendeeData);
    
    try {
      let logs = await getAttendeeLogsById(attendeeId);
      
      // If no logs are found but attendee has check-in/check-out data, create synthetic logs
      if (attendeeData) {
        // Initialize an array for complete attendance cycles
        const completeCycles: AttendanceLog[] = [];
        
        // Check if the attendee has both check-in and check-out times
        if (attendeeData.isCheckedOut && attendeeData.checkInTime && attendeeData.checkOutTime) {
          // Only create logs when there's a complete check-in and check-out cycle
          // Create synthetic check-in log
          const checkInLog: AttendanceLog = {
            id: `synthetic-checkin-${attendeeId}`,
            attendeeId: attendeeId,
            attendeeName: attendeeName,
            action: "check_in",
            timestamp: attendeeData.checkInTime,
            createdAt: attendeeData.checkInTime
          };
          
          // Create synthetic check-out log
          const checkOutLog: AttendanceLog = {
            id: `synthetic-checkout-${attendeeId}`,
            attendeeId: attendeeId,
            attendeeName: attendeeName,
            action: "check_out",
            timestamp: attendeeData.checkOutTime,
            createdAt: attendeeData.checkOutTime
          };
          
          // Add both logs to the complete cycles array
          completeCycles.push(checkInLog, checkOutLog);
          
          // If we have no logs from the database but we have complete cycles
          // from the attendee data, use those
          if (logs.length === 0 && completeCycles.length > 0) {
            logs = completeCycles;
          }
        }
      }
      
      setAttendeeLogs(logs);
    } catch (error) {
      console.error("Error fetching attendee logs:", error);
    } finally {
      setLoadingAttendeeLogs(false);
    }
  };

  const exportToExcel = () => {
    // Format data for Excel
    const data = attendees.map(attendee => ({
      Name: attendee.name,
      'Contact Number': attendee.phone,
      Region: attendee.region,
      Gender: attendee.gender,
      Status: attendee.isCheckedOut 
        ? "Checked Out" 
        : attendee.isCheckedIn 
          ? "Checked In" 
          : "Not Checked In",
      'Check-In Time': formatDateTime(attendee.checkInTime),
      'Check-Out Time': formatDateTime(attendee.checkOutTime),
    }));
    
    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendees");
    
    // Generate file name with current date
    const fileName = `attendees_export_${format(new Date(), "yyyy-MM-dd")}.xlsx`;
    
    // Save to file
    XLSX.writeFile(wb, fileName);
  };
  
  const exportLogsToExcel = () => {
    // Format data for Excel
    const data = logs.map(log => ({
      'Attendee Name': log.attendeeName,
      'Check-In Time': log.action === 'check_in' ? formatDateTime(log.timestamp) : '—',
      'Check-Out Time': log.action === 'check_out' ? formatDateTime(log.timestamp) : '—',
    }));
    
    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance Logs");
    
    // Generate file name with current date
    const fileName = `attendance_logs_export_${format(new Date(), "yyyy-MM-dd")}.xlsx`;
    
    // Save to file
    XLSX.writeFile(wb, fileName);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshAttendees();
    await refreshLogs();
    setIsRefreshing(false);
  };

  // Auto-refresh on component mount
  useEffect(() => {
    handleRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
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
            onClick={handleRefresh}
            disabled={loading || isRefreshing}
            title="Refresh data"
            className="relative"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
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
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="attendees" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              Attendees
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-1">
              <ClipboardList className="h-4 w-4" />
              Activity Logs
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={loading || logsLoading || isRefreshing}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {activeTab === 'attendees' ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={exportToExcel}
                disabled={loading || attendees.length === 0}
                className="flex items-center gap-1"
              >
                <FileDown className="h-4 w-4 mr-1" />
                Export Attendees
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={exportLogsToExcel}
                disabled={logsLoading || logs.length === 0}
                className="flex items-center gap-1"
              >
                <FileDown className="h-4 w-4 mr-1" />
                Export Logs
              </Button>
            )}
          </div>
        </div>
        
        <TabsContent value="attendees">
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
                          <TableRow 
                            key={attendee.id} 
                            onClick={() => handleAttendeeRowClick(attendee.id, attendee.name)}
                            className="cursor-pointer hover:bg-gray-50"
                          >
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
        </TabsContent>
        
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Activity Logs</CardTitle>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="flex justify-center items-center py-10">
                  <ReloadIcon className="h-6 w-6 animate-spin mr-2" />
                  <span>Loading logs...</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Attendee</TableHead>
                        <TableHead>Check-In Time</TableHead>
                        <TableHead>Check-Out Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.length > 0 ? (
                        filteredLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="font-medium">{log.attendeeName}</TableCell>
                            <TableCell>
                              {log.action === "check_in" ? formatDateTime(log.timestamp) : "—"}
                            </TableCell>
                            <TableCell>
                              {log.action === "check_out" ? formatDateTime(log.timestamp) : "—"}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-gray-500 py-6">
                            {searchTerm ? "No logs found matching your search." : "No attendance logs recorded yet."}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Attendance Log History Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Attendance History: {selectedAttendee}</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedAttendeeData && (
            <div className="mb-4 p-4 border rounded-md">
              <h3 className="text-lg font-medium mb-2">Current Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">Status:</p>
                  <p className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                    selectedAttendeeData.isCheckedOut 
                      ? "bg-blue-100 text-blue-800" 
                      : selectedAttendeeData.isCheckedIn 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                  )}>
                    {selectedAttendeeData.isCheckedOut 
                      ? "Checked Out" 
                      : selectedAttendeeData.isCheckedIn 
                        ? "Checked In" 
                        : "Not Checked In"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Check-in Time:</p>
                  <p>{formatDateTime(selectedAttendeeData.checkInTime)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Check-out Time:</p>
                  <p>{formatDateTime(selectedAttendeeData.checkOutTime)}</p>
                </div>
              </div>
            </div>
          )}
          
          <h3 className="text-lg font-medium">Attendance History Logs</h3>
          {loadingAttendeeLogs ? (
            <div className="flex justify-center items-center py-10">
              <ReloadIcon className="h-6 w-6 animate-spin mr-2" />
              <span>Loading attendance history...</span>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Attendee</TableHead>
                    <TableHead>Check-In Time</TableHead>
                    <TableHead>Check-Out Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendeeLogs.length > 0 ? (
                    attendeeLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.attendeeName}</TableCell>
                        <TableCell>
                          {log.action === "check_in" ? formatDateTime(log.timestamp) : "—"}
                        </TableCell>
                        <TableCell>
                          {log.action === "check_out" ? formatDateTime(log.timestamp) : "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-gray-500 py-6">
                        No attendance history found for this attendee.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
