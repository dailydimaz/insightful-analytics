import { useState } from "react";
import { Key, Plus, Copy, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useApiKeys } from "@/hooks/useApiKeys";
import { useSubscription } from "@/hooks/useSubscription";
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

export function ApiKeysCard() {
  const { apiKeys, isLoading, createApiKey, deleteApiKey, toggleApiKey } = useApiKeys();
  const { plan, isSelfHosted } = useSubscription();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [expiresIn, setExpiresIn] = useState("never");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Only show for cloud users with Pro or Business plan
  if (!isBillingEnabled() || isSelfHosted) {
    return null;
  }

  const planName = plan?.name?.toLowerCase() || 'free';
  const hasApiAccess = planName === 'pro' || planName === 'business';

  if (!hasApiAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Access
          </CardTitle>
          <CardDescription>
            Access your analytics data programmatically
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              API access is available on Pro and Business plans
            </p>
            <Button variant="outline" disabled>
              Upgrade to unlock
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your API key",
        variant: "destructive",
      });
      return;
    }

    try {
      const expiresInDays = expiresIn === "never" ? undefined : parseInt(expiresIn);
      const result = await createApiKey.mutateAsync({
        name: newKeyName,
        expiresInDays,
      });
      setGeneratedKey(result.key);
      setNewKeyName("");
      setExpiresIn("never");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create API key",
        variant: "destructive",
      });
    }
  };

  const handleCopyKey = async () => {
    if (generatedKey) {
      await navigator.clipboard.writeText(generatedKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied",
        description: "API key copied to clipboard",
      });
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setGeneratedKey(null);
    setCopied(false);
  };

  const handleDeleteKey = async (keyId: string) => {
    try {
      await deleteApiKey.mutateAsync(keyId);
      toast({
        title: "Deleted",
        description: "API key has been deleted",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete API key",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Access
            </CardTitle>
            <CardDescription>
              Manage API keys for programmatic access to your analytics data
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Key
              </Button>
            </DialogTrigger>
            <DialogContent>
              {generatedKey ? (
                <>
                  <DialogHeader>
                    <DialogTitle>Your new API key</DialogTitle>
                    <DialogDescription>
                      Copy this key now. You won't be able to see it again.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-3 bg-muted rounded-md text-sm font-mono break-all">
                        {generatedKey}
                      </code>
                      <Button size="icon" variant="outline" onClick={handleCopyKey}>
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleCloseDialog}>Done</Button>
                  </DialogFooter>
                </>
              ) : (
                <>
                  <DialogHeader>
                    <DialogTitle>Create API Key</DialogTitle>
                    <DialogDescription>
                      Create a new API key to access your analytics data
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="keyName">Key Name</Label>
                      <Input
                        id="keyName"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        placeholder="e.g., Production API"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expiresIn">Expires</Label>
                      <Select value={expiresIn} onValueChange={setExpiresIn}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="never">Never</SelectItem>
                          <SelectItem value="30">30 days</SelectItem>
                          <SelectItem value="90">90 days</SelectItem>
                          <SelectItem value="365">1 year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateKey} disabled={createApiKey.isPending}>
                      {createApiKey.isPending ? "Creating..." : "Create Key"}
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : apiKeys.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No API keys created yet</p>
            <p className="text-sm">Create your first API key to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {apiKeys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{key.name}</span>
                    {!key.is_active && (
                      <Badge variant="secondary">Disabled</Badge>
                    )}
                    {key.expires_at && new Date(key.expires_at) < new Date() && (
                      <Badge variant="destructive">Expired</Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <code>{key.key_prefix}...</code>
                    {key.last_used_at && (
                      <span className="ml-2">
                        Last used: {format(new Date(key.last_used_at), "MMM d, yyyy")}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => toggleApiKey.mutate({ keyId: key.id, isActive: !key.is_active })}
                  >
                    {key.is_active ? (
                      <X className="h-4 w-4" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteKey(key.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-sm font-medium">API Endpoint</p>
          <code className="text-xs text-muted-foreground">
            GET /api/v1/sites/:site_id/stats
          </code>
        </div>
      </CardContent>
    </Card>
  );
}
