import { useState } from "react";
import { Users, Plus, UserMinus, Mail, Crown, Edit2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTeam } from "@/hooks/useTeam";
import { useSubscription } from "@/hooks/useSubscription";
import { useSites } from "@/hooks/useSites";
import { useToast } from "@/hooks/use-toast";
import { isBillingEnabled } from "@/lib/billing";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function TeamCard() {
  const { sites } = useSites();
  const siteId = sites?.[0]?.id;
  const { members, invitations, isLoading, inviteMember, updateMemberRole, removeMember, cancelInvitation } = useTeam(siteId);
  const { plan, isSelfHosted } = useSubscription();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"viewer" | "editor" | "admin">("viewer");

  // Only show for cloud users with Business plan
  if (!isBillingEnabled() || isSelfHosted) {
    return null;
  }

  const planName = plan?.name?.toLowerCase() || 'free';
  const hasTeamAccess = planName === 'business';

  if (!hasTeamAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Collaboration
          </CardTitle>
          <CardDescription>
            Invite team members to view and manage analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              Team collaboration is available on the Business plan
            </p>
            <Button variant="outline" disabled>
              Upgrade to unlock
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast({
        title: "Email required",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    try {
      await inviteMember.mutateAsync({
        email: inviteEmail,
        role: inviteRole,
      });
      toast({
        title: "Invitation sent",
        description: `Invitation sent to ${inviteEmail}`,
      });
      setInviteEmail("");
      setDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation",
        variant: "destructive",
      });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await removeMember.mutateAsync(memberId);
      toast({
        title: "Removed",
        description: "Team member has been removed",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove member",
        variant: "destructive",
      });
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      await cancelInvitation.mutateAsync(invitationId);
      toast({
        title: "Cancelled",
        description: "Invitation has been cancelled",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel invitation",
        variant: "destructive",
      });
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'default';
      case 'editor':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Collaboration
            </CardTitle>
            <CardDescription>
              Manage team members who can access your analytics
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join your analytics team
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={inviteRole} onValueChange={(v: any) => setInviteRole(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Viewer - Can view analytics</SelectItem>
                      <SelectItem value="editor">Editor - Can manage goals & funnels</SelectItem>
                      <SelectItem value="admin">Admin - Full access</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleInvite} disabled={inviteMember.isPending}>
                  {inviteMember.isPending ? "Sending..." : "Send Invitation"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Current Members */}
            {members.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Members</h4>
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {member.full_name?.charAt(0) || member.email?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {member.full_name || member.email}
                        </div>
                        {member.full_name && (
                          <div className="text-sm text-muted-foreground">{member.email}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getRoleBadgeVariant(member.role)}>
                        {member.role}
                      </Badge>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pending Invitations */}
            {invitations.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Pending Invitations</h4>
                {invitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between p-3 border rounded-lg border-dashed"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium">{invitation.email}</div>
                        <div className="text-sm text-muted-foreground">
                          Expires {format(new Date(invitation.expires_at), "MMM d, yyyy")}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{invitation.role}</Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCancelInvitation(invitation.id)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {members.length === 0 && invitations.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No team members yet</p>
                <p className="text-sm">Invite your first team member to get started</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
