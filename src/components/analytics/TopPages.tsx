import { FileText } from "lucide-react";
import { TopPage } from "@/hooks/useAnalytics";

interface TopPagesProps {
  pages: TopPage[] | undefined;
  isLoading: boolean;
}

export function TopPages({ pages, isLoading }: TopPagesProps) {
  return (
    <div className="card bg-base-200">
      <div className="card-body">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-base-content/70" />
          <h3 className="card-title text-sm font-medium">Top Pages</h3>
        </div>
        
        {isLoading ? (
          <div className="space-y-3 mt-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="skeleton h-4 w-40"></div>
                <div className="skeleton h-4 w-12"></div>
              </div>
            ))}
          </div>
        ) : pages && pages.length > 0 ? (
          <div className="overflow-x-auto mt-4">
            <table className="table table-sm">
              <thead>
                <tr className="text-base-content/60">
                  <th className="font-medium">Page</th>
                  <th className="font-medium text-right">Views</th>
                  <th className="font-medium text-right">Visitors</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((page, index) => (
                  <tr key={index} className="hover:bg-base-300/50">
                    <td className="font-mono text-sm truncate max-w-[200px]" title={page.url}>
                      {page.url}
                    </td>
                    <td className="text-right">{page.pageviews}</td>
                    <td className="text-right text-base-content/70">{page.uniqueVisitors}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-base-content/50">
            <FileText className="h-8 w-8 mb-2" />
            <p>No page data yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
