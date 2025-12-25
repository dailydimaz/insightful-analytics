import { Target, TrendingUp, Plus, Trash2 } from "lucide-react";
import { useGoalStats, useDeleteGoal, GoalStats } from "@/hooks/useGoals";
import { DateRange } from "@/hooks/useAnalytics";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface GoalsCardProps {
  siteId: string;
  dateRange: DateRange;
  onCreateGoal: () => void;
}

function GoalRow({ goalStats, onDelete }: { goalStats: GoalStats; onDelete: () => void }) {
  return (
    <div className="flex items-center justify-between p-3 bg-base-200/50 rounded-lg group">
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{goalStats.goal.name}</p>
        <div className="flex items-center gap-2 text-xs text-base-content/60">
          <span>{goalStats.goal.event_name}</span>
          {goalStats.goal.url_match && (
            <>
              <span>•</span>
              <span className="truncate">{goalStats.goal.url_match}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="font-bold text-lg">{goalStats.conversions}</p>
          <p className="text-xs text-base-content/60">conversions</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-success">
            <TrendingUp className="h-4 w-4" />
            <span className="font-bold">{goalStats.conversionRate.toFixed(1)}%</span>
          </div>
          <p className="text-xs text-base-content/60">rate</p>
        </div>
        <button 
          className="btn btn-ghost btn-xs opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4 text-error" />
        </button>
      </div>
    </div>
  );
}

export function GoalsCard({ siteId, dateRange, onCreateGoal }: GoalsCardProps) {
  const { data: goalStats, isLoading } = useGoalStats({ siteId, dateRange });
  const deleteGoal = useDeleteGoal();
  const { toast } = useToast();

  const handleDelete = async (goalId: string, goalName: string) => {
    if (window.confirm(`Delete goal "${goalName}"?`)) {
      try {
        await deleteGoal.mutateAsync({ id: goalId, siteId });
        toast({
          title: "Goal deleted",
          description: `"${goalName}" has been removed.`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete goal.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-accent" />
            <h3 className="font-semibold">Goals & Conversions</h3>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onCreateGoal}>
            <Plus className="h-4 w-4" />
            Add Goal
          </button>
        </div>

        <div className="space-y-2">
          {isLoading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))
          ) : goalStats && goalStats.length > 0 ? (
            goalStats.map((stats) => (
              <GoalRow 
                key={stats.goal.id} 
                goalStats={stats} 
                onDelete={() => handleDelete(stats.goal.id, stats.goal.name)}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-base-content/20 mx-auto mb-3" />
              <p className="text-sm text-base-content/60 mb-3">
                Track conversions by creating goals
              </p>
              <button className="btn btn-primary btn-sm" onClick={onCreateGoal}>
                <Plus className="h-4 w-4" />
                Create First Goal
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
