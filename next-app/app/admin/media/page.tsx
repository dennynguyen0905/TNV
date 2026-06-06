import type { Metadata } from "next";
import { Badge } from "@/components/ui/Badge";
import { MOCK_MEDIA_ASSETS } from "@/data/mock/media-assets";

export const metadata: Metadata = { title: "Admin — Media" };

function mediaTypeColor(type: string): "blue" | "green" {
  return type.startsWith("audio") ? "blue" : "green";
}

function mediaTypeLabel(type: string): string {
  if (type.startsWith("audio")) return "Audio";
  if (type === "application/pdf") return "PDF";
  return type;
}

export default function AdminMediaPage() {
  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-n-900">Media</h1>
          <p className="text-sm text-n-500 mt-1">{MOCK_MEDIA_ASSETS.length} assets</p>
        </div>
      </div>

      <div className="bg-white rounded-card shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-n-200 bg-n-50">
            <tr>
              <th className="px-5 py-3 text-left font-medium text-n-500">File</th>
              <th className="px-5 py-3 text-left font-medium text-n-500">Type</th>
              <th className="px-5 py-3 text-left font-medium text-n-500">Lesson</th>
              <th className="px-5 py-3 text-left font-medium text-n-500">Size</th>
              <th className="px-5 py-3 text-left font-medium text-n-500">Uploaded</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-n-100">
            {MOCK_MEDIA_ASSETS.map((asset) => (
              <tr key={asset.id} className="hover:bg-n-50 transition-colors">
                <td className="px-5 py-3">
                  <p className="font-medium text-n-800">{asset.fileName}</p>
                  <p className="text-xs text-n-400 truncate max-w-xs">{asset.url}</p>
                </td>
                <td className="px-5 py-3">
                  <Badge color={mediaTypeColor(asset.type)}>{mediaTypeLabel(asset.type)}</Badge>
                </td>
                <td className="px-5 py-3 text-n-600">{asset.lessonTitle}</td>
                <td className="px-5 py-3 text-n-400">{asset.size}</td>
                <td className="px-5 py-3 text-n-400">{asset.uploadedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
