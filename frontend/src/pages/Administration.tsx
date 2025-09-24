import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface Duty {
  id: number;
  name: string;
  description: string;
  estimatedHours: number;
  priority: string;
  isActive: boolean;
}

interface DutyAssignment {
  id: number;
  assignedDate: string;
  completedDate?: string;
  status: string;
  notes?: string;
  user: User;
  duty: Duty;
}

const Administration: React.FC = () => {
  const { user, token, isAdmin } = useAuth();
  const [duties, setDuties] = useState<Duty[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<DutyAssignment[]>([]);
  const [openDutyDialog, setOpenDutyDialog] = useState(false);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [selectedDuty, setSelectedDuty] = useState<Duty | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [newDuty, setNewDuty] = useState({
    name: "",
    description: "",
    estimatedHours: 1,
    priority: "MEDIUM",
  });

  const [newAssignment, setNewAssignment] = useState({
    dutyId: "",
    userId: "",
    assignedDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [dutiesRes, usersRes, assignmentsRes] = await Promise.all([
        axios.get("http://localhost:8082/api/duties", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:8082/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:8082/api/duties/assignments", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setDuties(dutiesRes.data);
      setUsers(usersRes.data);
      setAssignments(assignmentsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data");
    }
  };

  const handleCreateDuty = async () => {
    setLoading(true);
    setError("");
    try {
      await axios.post("http://localhost:8082/api/duties", newDuty, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Duty created successfully!");
      setOpenDutyDialog(false);
      setNewDuty({
        name: "",
        description: "",
        estimatedHours: 1,
        priority: "MEDIUM",
      });
      fetchData();
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to create duty");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDuty = async () => {
    setLoading(true);
    setError("");
    try {
      await axios.post(
        `http://localhost:8082/api/duties/${newAssignment.dutyId}/assign`,
        {
          assignedDate: newAssignment.assignedDate,
          assignedUserId: newAssignment.userId,
          notes: newAssignment.notes,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess("Duty assigned successfully!");
      setOpenAssignDialog(false);
      setNewAssignment({
        dutyId: "",
        userId: "",
        assignedDate: new Date().toISOString().split("T")[0],
        notes: "",
      });
      fetchData();
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to assign duty");
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "LOW":
        return "success";
      case "MEDIUM":
        return "warning";
      case "HIGH":
        return "error";
      case "URGENT":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ASSIGNED":
        return "info";
      case "IN_PROGRESS":
        return "warning";
      case "COMPLETED":
        return "success";
      case "CANCELLED":
        return "error";
      default:
        return "default";
    }
  };

  if (!isAdmin()) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          Access denied. This page is only accessible to administrators.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Administration
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenDutyDialog(true)}
                >
                  Create Duty
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<AssignmentIcon />}
                  onClick={() => setOpenAssignDialog(true)}
                >
                  Assign Duty
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Duties Management */}
        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Duties Management
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Est. Hours</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {duties.map((duty) => (
                      <TableRow key={duty.id}>
                        <TableCell>{duty.name}</TableCell>
                        <TableCell>{duty.description}</TableCell>
                        <TableCell>{duty.estimatedHours}h</TableCell>
                        <TableCell>
                          <Chip
                            label={duty.priority}
                            color={getPriorityColor(duty.priority) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={duty.isActive ? "Active" : "Inactive"}
                            color={duty.isActive ? "success" : "default"}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Assignments Overview */}
        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Duty Assignments
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Duty</TableCell>
                      <TableCell>Assigned To</TableCell>
                      <TableCell>Assigned Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Completed Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell>{assignment.duty.name}</TableCell>
                        <TableCell>
                          {assignment.user.firstName} {assignment.user.lastName}
                        </TableCell>
                        <TableCell>
                          {new Date(
                            assignment.assignedDate
                          ).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={assignment.status}
                            color={getStatusColor(assignment.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {assignment.completedDate
                            ? new Date(
                                assignment.completedDate
                              ).toLocaleDateString()
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Create Duty Dialog */}
      <Dialog
        open={openDutyDialog}
        onClose={() => setOpenDutyDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Duty</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Duty Name"
              value={newDuty.name}
              onChange={(e) => setNewDuty({ ...newDuty, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={newDuty.description}
              onChange={(e) =>
                setNewDuty({ ...newDuty, description: e.target.value })
              }
              fullWidth
              multiline
              rows={3}
              required
            />
            <TextField
              label="Estimated Hours"
              type="number"
              value={newDuty.estimatedHours}
              onChange={(e) =>
                setNewDuty({
                  ...newDuty,
                  estimatedHours: parseInt(e.target.value),
                })
              }
              fullWidth
              required
              inputProps={{ min: 1 }}
            />
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={newDuty.priority}
                onChange={(e) =>
                  setNewDuty({ ...newDuty, priority: e.target.value })
                }
                label="Priority"
              >
                <MenuItem value="LOW">Low</MenuItem>
                <MenuItem value="MEDIUM">Medium</MenuItem>
                <MenuItem value="HIGH">High</MenuItem>
                <MenuItem value="URGENT">Urgent</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDutyDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateDuty}
            variant="contained"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Duty"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Duty Dialog */}
      <Dialog
        open={openAssignDialog}
        onClose={() => setOpenAssignDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Assign Duty to User</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Select Duty</InputLabel>
              <Select
                value={newAssignment.dutyId}
                onChange={(e) =>
                  setNewAssignment({ ...newAssignment, dutyId: e.target.value })
                }
                label="Select Duty"
              >
                {duties
                  .filter((duty) => duty.isActive)
                  .map((duty) => (
                    <MenuItem key={duty.id} value={duty.id}>
                      {duty.name} ({duty.priority})
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Assign to User</InputLabel>
              <Select
                value={newAssignment.userId}
                onChange={(e) =>
                  setNewAssignment({ ...newAssignment, userId: e.target.value })
                }
                label="Assign to User"
              >
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} ({user.username})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Assigned Date"
              type="date"
              value={newAssignment.assignedDate}
              onChange={(e) =>
                setNewAssignment({
                  ...newAssignment,
                  assignedDate: e.target.value,
                })
              }
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Notes (Optional)"
              value={newAssignment.notes}
              onChange={(e) =>
                setNewAssignment({ ...newAssignment, notes: e.target.value })
              }
              fullWidth
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAssignDialog(false)}>Cancel</Button>
          <Button
            onClick={handleAssignDuty}
            variant="contained"
            disabled={loading}
          >
            {loading ? "Assigning..." : "Assign Duty"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Administration;
