import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function WebViewPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const url = searchParams.get("url") || "about:blank";
  const webviewRef = useRef(null);

  useEffect(() => {
    if (!url || url === "about:blank") return;
    document.title = `Kids Browser — ${url}`;
  }, [url]);

  useEffect(() => {
    const webview = webviewRef.current;
    if (!webview) return;

    const handleLoadStart = () => setIsLoading(true);
    const handleLoadStop = () => setIsLoading(false);

    webview.addEventListener("did-start-loading", handleLoadStart);
    webview.addEventListener("did-stop-loading", handleLoadStop);

    return () => {
      webview.removeEventListener("did-start-loading", handleLoadStart);
      webview.removeEventListener("did-stop-loading", handleLoadStop);
    };
  }, []);

  return (
    <div className="h-screen w-screen background-image relative flex flex-col p-1">
      <button className="back-button w-fit absolute z-10 top-1 left-1" onClick={() => navigate(-1)}>Back</button>
      <main className="w-full h-full absolute z-0 top-0 left-0">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-20">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
              </div>
              <p className="text-white text-lg font-semibold">Loading adventure...</p>
            </div>
          </div>
        )}
        <webview
          ref={webviewRef}
          src={url}
          className="w-full h-full"
          allowpopups
        />
      </main>
    </div>
  );
}
