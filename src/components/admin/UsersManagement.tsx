
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, UserRole } from '@/types';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Trash2, Pencil, UserCog } from 'lucide-react';

interface UsersManagementProps {
  users: User[];
}

const UsersManagement: React.FC<UsersManagementProps> = ({ users: initialUsers }) => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'donor' as UserRole,
  });
  
  const toggleUserSelection = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };
  
  const handleEditUser = (user: User) => {
    setCurrentUser(user);
    setIsEditUserOpen(true);
  };
  
  const handleDeleteUser = (user: User) => {
    setCurrentUser(user);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteUser = () => {
    if (currentUser) {
      setUsers(users.filter(user => user.id !== currentUser.id));
      setIsDeleteConfirmOpen(false);
      setCurrentUser(null);
      toast.success(`User ${currentUser.name} deleted successfully`);
    }
  };

  const handleDeleteSelected = () => {
    setUsers(users.filter(user => !selectedUsers.includes(user.id)));
    toast.success(`${selectedUsers.length} users deleted successfully`);
    setSelectedUsers([]);
  };

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) {
      toast.error('Name and email are required');
      return;
    }

    const newUserComplete: User = {
      id: `user-${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      createdAt: new Date(),
      hasCompletedProfile: false
    };

    setUsers([...users, newUserComplete]);
    setNewUser({
      name: '',
      email: '',
      role: 'donor' as UserRole,
    });
    setIsAddUserOpen(false);
    toast.success('User added successfully');
  };

  const handleUpdateUser = () => {
    if (!currentUser) return;

    setUsers(
      users.map(user => 
        user.id === currentUser.id ? { ...user, ...currentUser } : user
      )
    );
    setIsEditUserOpen(false);
    setCurrentUser(null);
    toast.success(`User ${currentUser.name} updated successfully`);
  };
  
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-500">Admin</Badge>;
      case 'donor':
        return <Badge className="bg-blue-500">Donor</Badge>;
      case 'recipient':
        return <Badge className="bg-green-500">Recipient</Badge>;
      case 'hospital':
        return <Badge className="bg-yellow-500">Hospital</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <div className="space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsAddUserOpen(true)}
            className="flex items-center"
          >
            <UserPlus className="h-4 w-4 mr-1" /> Add User
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            disabled={selectedUsers.length === 0}
            onClick={handleDeleteSelected}
            className="flex items-center"
          >
            <Trash2 className="h-4 w-4 mr-1" /> Delete Selected
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox 
                  checked={selectedUsers.length === users.length && users.length > 0}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedUsers(users.map(user => user.id));
                    } else {
                      setSelectedUsers([]);
                    }
                  }}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Sign-up Date</TableHead>
              <TableHead>Profile Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={() => toggleUserSelection(user.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {getRoleBadge(user.role)}
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {user.hasCompletedProfile ? 
                      <Badge variant="outline" className="bg-green-100 text-green-800">Complete</Badge> : 
                      <Badge variant="outline" className="bg-amber-100 text-amber-800">Incomplete</Badge>
                    }
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEditUser(user)}
                      className="inline-flex items-center"
                    >
                      <Pencil className="h-3 w-3 mr-1" /> Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDeleteUser(user)}
                      className="inline-flex items-center"
                    >
                      <Trash2 className="h-3 w-3 mr-1" /> Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add User Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <UserPlus className="h-5 w-5 mr-2" /> Add New User
            </DialogTitle>
            <DialogDescription>
              Create a new user account in the system.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Full Name
              </label>
              <Input
                id="name"
                placeholder="Enter full name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium">
                User Role
              </label>
              <Select
                value={newUser.role}
                onValueChange={(value: UserRole) => setNewUser({ ...newUser, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="donor">Donor</SelectItem>
                  <SelectItem value="recipient">Recipient</SelectItem>
                  <SelectItem value="hospital">Hospital</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-bloodlink-red hover:bg-bloodlink-red/80" onClick={handleAddUser}>
              Add User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <UserCog className="h-5 w-5 mr-2" /> Edit User
            </DialogTitle>
            <DialogDescription>
              Update user information in the system.
            </DialogDescription>
          </DialogHeader>
          {currentUser && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="edit-name" className="text-sm font-medium">
                  Full Name
                </label>
                <Input
                  id="edit-name"
                  placeholder="Enter full name"
                  value={currentUser.name}
                  onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="edit-email"
                  type="email"
                  placeholder="user@example.com"
                  value={currentUser.email}
                  onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-role" className="text-sm font-medium">
                  User Role
                </label>
                <Select
                  value={currentUser.role}
                  onValueChange={(value: UserRole) => setCurrentUser({ ...currentUser, role: value as UserRole })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="donor">Donor</SelectItem>
                    <SelectItem value="recipient">Recipient</SelectItem>
                    <SelectItem value="hospital">Hospital</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <Checkbox
                    checked={currentUser.hasCompletedProfile || false}
                    onCheckedChange={(checked) => 
                      setCurrentUser({ ...currentUser, hasCompletedProfile: !!checked })
                    }
                    className="mr-2"
                  />
                  Profile Completed
                </label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-bloodlink-red hover:bg-bloodlink-red/80" onClick={handleUpdateUser}>
              Update User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Confirm Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {currentUser && (
            <div className="py-4">
              <p><strong>Name:</strong> {currentUser.name}</p>
              <p><strong>Email:</strong> {currentUser.email}</p>
              <p><strong>Role:</strong> {currentUser.role}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteUser}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersManagement;
