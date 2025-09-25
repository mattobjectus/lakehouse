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
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Drawer,
  IconButton,
  Divider,
  Toolbar,
  AppBar,
  TableSortLabel,
} from "@mui/material";
import {
  Add as AddIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
  Work as WorkIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
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

interface Document {
  id: number;
  fileName: string;
  originalFileName: string;
  contentType: string;
  fileSize: number;
  uploadedAt: string;
  uploadedByUsername: string;
  uploadedByName: string;
  description?: string;
}

const drawerWidth = 240;

const Administration: React.FC = () => {
  const { user, token, isAdmin, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("duty");
  const [mobileOpen, setMobileOpen] = useState(false);

  // Data states
  const [duties, setDuties] = useState<Duty[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<DutyAssignment[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);

  // Document upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentDescription, setDocumentDescription] = useState("");

  // Dialog states
  const [openDutyDialog, setOpenDutyDialog] = useState(false);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [openRoleWarningDialog, setOpenRoleWarningDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Sorting states for users table
  const [userSortBy, setUserSortBy] = useState<keyof User>("username");
  const [userSortOrder, setUserSortOrder] = useState<"asc" | "desc">("asc");

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

  const [newUser, setNewUser] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    role: "USER",
    password: "",
    confirmPassword: "",
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

      // Also fetch documents
      fetchDocuments();
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data");
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
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

  const handleCreateUser = async () => {
    setLoading(true);
    setError("");
    try {
      await axios.post("http://localhost:8082/api/users", newUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("User created successfully!");
      setOpenUserDialog(false);
      setNewUser({
        username: "",
        firstName: "",
        lastName: "",
        email: "",
        role: "USER",
        password: "",
        confirmPassword: "",
      });
      fetchData();
    } catch (error: any) {
      const errorMessage =
        error.response?.data ||
        error.response?.data?.message ||
        "Failed to create user";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    // Check if admin is changing their own role to user
    const isCurrentUser = user && editingUser.id === user.id;
    const isChangingToUser =
      editingUser.role === "ADMIN" && newUser.role === "USER";

    if (isCurrentUser && isChangingToUser) {
      setOpenRoleWarningDialog(true);
      return;
    }

    await performUserUpdate();
  };

  const performUserUpdate = async () => {
    if (!editingUser) return;

    setLoading(true);
    setError("");
    try {
      await axios.put(
        `http://localhost:8082/api/users/${editingUser.id}`,
        newUser,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess("User updated successfully!");
      setOpenUserDialog(false);
      setEditingUser(null);
      setNewUser({
        username: "",
        firstName: "",
        lastName: "",
        email: "",
        role: "USER",
        password: "",
        confirmPassword: "",
      });
      fetchData();

      // If admin changed their own role to user, update context and redirect to dashboard
      const isCurrentUser = user && editingUser.id === user.id;
      const isChangingToUser =
        editingUser.role === "ADMIN" && newUser.role === "USER";
      if (isCurrentUser && isChangingToUser) {
        // Update the user context with the new role
        updateUser({
          ...user,
          role: newUser.role,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          username: newUser.username,
        });
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000); // Give time for success message to show
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data ||
        error.response?.data?.message ||
        "Failed to update user";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChangeConfirm = async () => {
    setOpenRoleWarningDialog(false);
    await performUserUpdate();
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    setLoading(true);
    setError("");
    try {
      await axios.delete(`http://localhost:8082/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("User deleted successfully!");
      fetchData();
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setNewUser({
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      password: "",
      confirmPassword: "",
    });
    setOpenUserDialog(true);
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

  // Sorting functions
  const handleUserSort = (column: keyof User) => {
    const isAsc = userSortBy === column && userSortOrder === "asc";
    setUserSortOrder(isAsc ? "desc" : "asc");
    setUserSortBy(column);
  };

  const sortUsers = (users: User[]) => {
    return [...users].sort((a, b) => {
      const aValue = a[userSortBy];
      const bValue = b[userSortBy];

      // Handle string comparison
      if (typeof aValue === "string" && typeof bValue === "string") {
        const comparison = aValue
          .toLowerCase()
          .localeCompare(bValue.toLowerCase());
        return userSortOrder === "asc" ? comparison : -comparison;
      }

      // Handle number comparison
      if (typeof aValue === "number" && typeof bValue === "number") {
        return userSortOrder === "asc" ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  };

  // Get sorted users
  const sortedUsers = sortUsers(users);

  // Document functions
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDocumentUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      if (documentDescription) {
        formData.append("description", documentDescription);
      }

      await axios.post("http://localhost:8082/api/documents/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("Document uploaded successfully!");
      setSelectedFile(null);
      setDocumentDescription("");
      fetchDocuments();
    } catch (error: any) {
      setError(error.response?.data || "Failed to upload document");
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentDownload = async (
    documentId: number,
    fileName: string
  ) => {
    try {
      const response = await axios.get(
        `http://localhost:8082/api/documents/${documentId}/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      setError("Failed to download document");
    }
  };

  const handleDocumentDelete = async (documentId: number) => {
    if (!window.confirm("Are you sure you want to delete this document?"))
      return;

    setLoading(true);
    setError("");
    try {
      await axios.delete(`http://localhost:8082/api/documents/${documentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Document deleted successfully!");
      fetchDocuments();
    } catch (error: any) {
      setError(error.response?.data || "Failed to delete document");
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await axios.get("http://localhost:8082/api/documents", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDocuments(response.data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Administration
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton
            selected={activeTab === "duty"}
            onClick={() => setActiveTab("duty")}
          >
            <ListItemIcon>
              <WorkIcon />
            </ListItemIcon>
            <ListItemText primary="Duties" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            selected={activeTab === "users"}
            onClick={() => setActiveTab("users")}
          >
            <ListItemIcon>
              <PeopleIcon />
            </ListItemIcon>
            <ListItemText primary="Users" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            selected={activeTab === "documents"}
            onClick={() => setActiveTab("documents")}
          >
            <ListItemIcon>
              <DescriptionIcon />
            </ListItemIcon>
            <ListItemText primary="Documents" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  const renderDutyTab = () => (
    <Box>
      {/* Quick Actions */}
      <Card sx={{ mb: 3 }}>
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

      {/* Duties Management */}
      <Card sx={{ mb: 3 }}>
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

      {/* Assignments Overview */}
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
                      {new Date(assignment.assignedDate).toLocaleDateString()}
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
    </Box>
  );

  const renderUsersTab = () => (
    <Box>
      {/* User Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            User Management
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditingUser(null);
                setNewUser({
                  username: "",
                  firstName: "",
                  lastName: "",
                  email: "",
                  role: "USER",
                  password: "",
                  confirmPassword: "",
                });
                setOpenUserDialog(true);
              }}
            >
              Add User
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            All Users
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={userSortBy === "username"}
                      direction={
                        userSortBy === "username" ? userSortOrder : "asc"
                      }
                      onClick={() => handleUserSort("username")}
                    >
                      Username
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={userSortBy === "firstName"}
                      direction={
                        userSortBy === "firstName" ? userSortOrder : "asc"
                      }
                      onClick={() => handleUserSort("firstName")}
                    >
                      Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={userSortBy === "email"}
                      direction={userSortBy === "email" ? userSortOrder : "asc"}
                      onClick={() => handleUserSort("email")}
                    >
                      Email
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={userSortBy === "role"}
                      direction={userSortBy === "role" ? userSortOrder : "asc"}
                      onClick={() => handleUserSort("role")}
                    >
                      Role
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        color={user.role === "ADMIN" ? "primary" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleEditUser(user)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteUser(user.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );

  const renderDocumentsTab = () => (
    <Box>
      {/* Document Upload */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            Upload Document
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <input
              type="file"
              id="document-upload"
              style={{ display: "none" }}
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
            />
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Button
                variant="contained"
                component="label"
                htmlFor="document-upload"
                startIcon={<AddIcon />}
              >
                Select File
              </Button>
              {selectedFile && (
                <Typography variant="body2" color="text.secondary">
                  Selected: {selectedFile.name} (
                  {formatFileSize(selectedFile.size)})
                </Typography>
              )}
            </Box>
            {selectedFile && (
              <TextField
                label="Description (Optional)"
                value={documentDescription}
                onChange={(e) => setDocumentDescription(e.target.value)}
                fullWidth
                multiline
                rows={2}
              />
            )}
            {selectedFile && (
              <Button
                variant="contained"
                onClick={handleDocumentUpload}
                disabled={loading}
                color="primary"
              >
                {loading ? "Uploading..." : "Upload Document"}
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            All Documents
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>File Name</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Uploaded By</TableCell>
                  <TableCell>Upload Date</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documents.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell>{document.originalFileName}</TableCell>
                    <TableCell>{formatFileSize(document.fileSize)}</TableCell>
                    <TableCell>{document.uploadedByName}</TableCell>
                    <TableCell>
                      {new Date(document.uploadedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{document.description || "-"}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleDocumentDownload(
                            document.id,
                            document.originalFileName
                          )
                        }
                        color="primary"
                        title="Download"
                      >
                        <DescriptionIcon />
                      </IconButton>
                      {isAdmin() && (
                        <IconButton
                          size="small"
                          onClick={() => handleDocumentDelete(document.id)}
                          color="error"
                          title="Delete"
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {documents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No documents uploaded yet
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );

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
    <Box sx={{ display: "flex" }}>
      {/* Mobile App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          display: { sm: "none" },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Administration
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar sx={{ display: { sm: "none" } }} />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert
            severity="success"
            sx={{ mb: 2 }}
            onClose={() => setSuccess("")}
          >
            {success}
          </Alert>
        )}

        {activeTab === "duty" && renderDutyTab()}
        {activeTab === "users" && renderUsersTab()}
        {activeTab === "documents" && renderDocumentsTab()}
      </Box>

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

      {/* User Dialog */}
      <Dialog
        open={openUserDialog}
        onClose={() => {
          setOpenUserDialog(false);
          setError(""); // Clear error when closing dialog
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingUser ? "Edit User" : "Create New User"}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Username"
              value={newUser.username}
              onChange={(e) =>
                setNewUser({ ...newUser, username: e.target.value })
              }
              fullWidth
              required
            />
            <TextField
              label="First Name"
              value={newUser.firstName}
              onChange={(e) =>
                setNewUser({ ...newUser, firstName: e.target.value })
              }
              fullWidth
              required
            />
            <TextField
              label="Last Name"
              value={newUser.lastName}
              onChange={(e) =>
                setNewUser({ ...newUser, lastName: e.target.value })
              }
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
              fullWidth
              required
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({ ...newUser, role: e.target.value })
                }
                label="Role"
              >
                <MenuItem value="USER">User</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label={
                editingUser
                  ? "New Password (leave blank to keep current)"
                  : "Password"
              }
              type="password"
              value={newUser.password}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
              fullWidth
              required={!editingUser}
              helperText={
                editingUser
                  ? "Leave blank to keep current password"
                  : "Minimum 6 characters"
              }
            />
            <TextField
              label="Confirm Password"
              type="password"
              value={newUser.confirmPassword}
              onChange={(e) =>
                setNewUser({ ...newUser, confirmPassword: e.target.value })
              }
              fullWidth
              required={!editingUser && newUser.password.length > 0}
              error={
                newUser.password !== newUser.confirmPassword &&
                newUser.confirmPassword.length > 0
              }
              helperText={
                newUser.password !== newUser.confirmPassword &&
                newUser.confirmPassword.length > 0
                  ? "Passwords do not match"
                  : ""
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenUserDialog(false);
              setError(""); // Clear error when canceling
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={editingUser ? handleUpdateUser : handleCreateUser}
            variant="contained"
            disabled={loading}
          >
            {loading
              ? editingUser
                ? "Updating..."
                : "Creating..."
              : editingUser
              ? "Update User"
              : "Create User"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Role Change Warning Dialog */}
      <Dialog
        open={openRoleWarningDialog}
        onClose={() => setOpenRoleWarningDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Warning: Role Change</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            You are about to change your own role from Admin to User.
          </Alert>
          <Typography variant="body1" sx={{ mb: 2 }}>
            This action will:
          </Typography>
          <Typography variant="body2" component="ul" sx={{ pl: 2, mb: 2 }}>
            <li>Remove your administrative privileges</li>
            <li>Prevent you from accessing the administration panel</li>
            <li>Redirect you to the dashboard</li>
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Are you sure you want to continue?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRoleWarningDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleRoleChangeConfirm}
            variant="contained"
            color="warning"
          >
            Yes, Change Role
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Administration;
