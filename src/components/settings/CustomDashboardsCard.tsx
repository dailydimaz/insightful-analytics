import { useState } from "react";
import { LayoutDashboard, Plus, Trash2, Star, Edit2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useCustomDashboards, DashboardWidget } from "@/hooks/useCustomDashboards";
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
import { Checkbox } from "@/components/ui/checkbox";

const WIDGET_OPTIONS: { type: DashboardWidget['type']; label: string }[] = [
  { type: 'visitors', label: 'Visitors Chart' },
  { type: 'pageviews', label: 'Page Views' },
  { type: 'top_pages', label: 'Top Pages' },
  { type: 'top_referrers', label: 'Top Referrers' },
  { type: 'devices', label: 'Devices & Browsers' },
  { type: 'geo', label: 'Geographic Data' },
  { type: 'goals', label: 'Goals' },
  { type: 'realtime', label: 'Realtime Stats' },
  { type: 'retention', label: 'Retention' },
];

export function CustomDashboardsCard() {
  const { sites } = useSites();
  const siteId = sites?.[0]?.id;
  const { dashboards, isLoading, createDashboard, updateDashboard, deleteDashboard } = useCustomDashboards(siteId);
  const { plan, isSelfHosted } = useSubscription();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [selectedWidgets, setSelectedWidgets] = useState<DashboardWidget['type'][]>([
    'visitors', 'pageviews', 'top_pages', 'top_referrers'
  ]);

  // Only show for cloud users with Business plan
  if (!isBillingEnabled() || isSelfHosted) {
    return null;
  }

  const planName = plan?.name?.toLowerCase() || 'free';
  const hasCustomDashboards = planName === 'business';

  if (!hasCustomDashboards) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5" />
            Custom Dashboards
          </CardTitle>
          <CardDescription>
            Create personalized dashboard layouts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              Custom dashboards are available on the Business plan
            </p>
            <Button variant="outline" disabled>
              Upgrade to unlock
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleCreate = async () => {
    if (!newName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your dashboard",
        variant: "destructive",
      });
      return;
    }

    const layout: DashboardWidget[] = selectedWidgets.map((type, index) => ({
      id: `${type}-${Date.now()}`,
      type,
      title: WIDGET_OPTIONS.find(w => w.type === type)?.label || type,
      size: type === 'visitors' || type === 'retention' ? 'full' : 'medium',
      position: index,
    }));

    try {
      await createDashboard.mutateAsync({ name: newName, layout });
      toast({
        title: "Created",
        description: "Dashboard created successfully",
      });
      setNewName("");
      setDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create dashboard",
        variant: "destructive",
      });
    }
  };

  const handleSetDefault = async (dashboardId: string) => {
    try {
      await updateDashboard.mutateAsync({ dashboardId, isDefault: true });
      toast({
        title: "Updated",
        description: "Default dashboard updated",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update dashboard",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (dashboardId: string) => {
    try {
      await deleteDashboard.mutateAsync(dashboardId);
      toast({
        title: "Deleted",
        description: "Dashboard deleted",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete dashboard",
        variant: "destructive",
      });
    }
  };

  const toggleWidget = (type: DashboardWidget['type']) => {
    setSelectedWidgets(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5" />
              Custom Dashboards
            </CardTitle>
            <CardDescription>
              Create and manage personalized dashboard layouts
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Dashboard
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Custom Dashboard</DialogTitle>
                <DialogDescription>
                  Choose which widgets to include in your dashboard
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dashboardName">Dashboard Name</Label>
                  <Input
                    id="dashboardName"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g., Executive Overview"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Widgets</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {WIDGET_OPTIONS.map((widget) => (
                      <div
                        key={widget.type}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={widget.type}
                          checked={selectedWidgets.includes(widget.type)}
                          onCheckedChange={() => toggleWidget(widget.type)}
                        />
                        <label
                          htmlFor={widget.type}
                          className="text-sm cursor-pointer"
                        >
                          {widget.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={createDashboard.isPending}>
                  {createDashboard.isPending ? "Creating..." : "Create Dashboard"}
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
        ) : dashboards.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <LayoutDashboard className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No custom dashboards yet</p>
            <p className="text-sm">Create your first dashboard to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {dashboards.map((dashboard) => (
              <div
                key={dashboard.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{dashboard.name}</span>
                    {dashboard.is_default && (
                      <Badge variant="secondary">
                        <Star className="h-3 w-3 mr-1" />
                        Default
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {dashboard.layout.length} widgets • Updated {format(new Date(dashboard.updated_at), "MMM d, yyyy")}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!dashboard.is_default && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSetDefault(dashboard.id)}
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(dashboard.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
