import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function WebViewPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const url = searchParams.get("url") || "about:blank";

  useEffect(() => {
    if (!url || url === "about:blank") return;
    document.title = `Kids Browser — ${url}`;
  }, [url]);

  return (
    <div className="min-h-screen bg-linear-to-b from-sky-100 to-indigo-100">
      <header className="bg-white/70 backdrop-blur border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 bg-gray-200 rounded"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
          <span className="text-sm text-gray-600 break-all max-w-xs">
            {url}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1 bg-indigo-600 text-white rounded"
          >
            Open external
          </a>
        </div>
      </header>

      <main className="p-4">
        <div className="border rounded overflow-hidden h-[80vh]">
          {/* webview requires webviewTag enabled in BrowserWindow (index.js) */}
          <webview
            src={url}
            style={{ width: "100%", height: "100%" }}
            allowpopups
          />
        </div>
      </main>
    </div>
  );
}
