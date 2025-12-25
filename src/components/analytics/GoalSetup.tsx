import { useState } from "react";
import { X, Target } from "lucide-react";
import { useCreateGoal } from "@/hooks/useGoals";
import { useToast } from "@/hooks/use-toast";

interface GoalSetupProps {
  siteId: string;
  onClose: () => void;
}

export function GoalSetup({ siteId, onClose }: GoalSetupProps) {
  const [name, setName] = useState("");
  const [eventName, setEventName] = useState("pageview");
  const [urlMatch, setUrlMatch] = useState("");
  const [matchType, setMatchType] = useState<"exact" | "contains" | "starts_with" | "regex">("contains");
  
  const createGoal = useCreateGoal();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for this goal.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createGoal.mutateAsync({
        site_id: siteId,
        name: name.trim(),
        event_name: eventName,
        url_match: urlMatch.trim() || null,
        match_type: matchType,
      });
      
      toast({
        title: "Goal created",
        description: `"${name}" is now tracking conversions.`,
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create goal. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-base-300">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-accent" />
            <h2 className="font-semibold">Create Goal</h2>
          </div>
          <button className="btn btn-ghost btn-sm btn-circle" onClick={onClose}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Goal Name */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Goal Name</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              placeholder="e.g., Sign Up Completed"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Event Type */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Event Type</span>
            </label>
            <select
              className="select select-bordered"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
            >
              <option value="pageview">Pageview</option>
              <option value="click">Click</option>
              <option value="signup">Sign Up</option>
              <option value="purchase">Purchase</option>
              <option value="download">Download</option>
              <option value="form_submit">Form Submit</option>
            </select>
            <label className="label">
              <span className="label-text-alt text-base-content/60">
                Select the event type to track as a conversion
              </span>
            </label>
          </div>

          {/* URL Match (optional) */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">URL Pattern (optional)</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              placeholder="e.g., /thank-you"
              value={urlMatch}
              onChange={(e) => setUrlMatch(e.target.value)}
            />
          </div>

          {/* Match Type */}
          {urlMatch && (
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Match Type</span>
              </label>
              <select
                className="select select-bordered"
                value={matchType}
                onChange={(e) => setMatchType(e.target.value as typeof matchType)}
              >
                <option value="contains">Contains</option>
                <option value="exact">Exact Match</option>
                <option value="starts_with">Starts With</option>
                <option value="regex">Regex</option>
              </select>
            </div>
          )}

          {/* Preview */}
          <div className="bg-base-200 rounded-lg p-3">
            <p className="text-sm text-base-content/70">
              <strong>Goal will track:</strong>{" "}
              {eventName === "pageview" ? "page views" : `${eventName} events`}
              {urlMatch && ` where URL ${matchType.replace("_", " ")} "${urlMatch}"`}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={createGoal.isPending}
            >
              {createGoal.isPending ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "Create Goal"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
