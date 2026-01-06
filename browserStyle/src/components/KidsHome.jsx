import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const DEFAULT_LINKS = [
  {
    name: "YouTube Kids",
    url: "https://www.youtubekids.com/",
    emoji: "🎈",
    color: "from-pink-300 to-red-300",
    textColor: "text-red-900",
    hoverColor: "hover:from-pink-400 hover:to-red-400",
  },
  {
    name: "Simple Wikipedia",
    url: "https://simple.wikipedia.org/",
    emoji: "📘",
    color: "from-sky-300 to-blue-300",
    textColor: "text-blue-900",
    hoverColor: "hover:from-sky-400 hover:to-blue-400",
  },
  {
    name: "Nat Geo Kids",
    url: "https://kids.nationalgeographic.com/",
    emoji: "🦁",
    color: "from-yellow-300 to-orange-300",
    textColor: "text-orange-900",
    hoverColor: "hover:from-yellow-400 hover:to-orange-400",
  },
  {
    name: "PBS Kids",
    url: "https://pbskids.org/",
    emoji: "🌈",
    color: "from-green-300 to-emerald-300",
    textColor: "text-emerald-900",
    hoverColor: "hover:from-green-400 hover:to-emerald-400",
  },
  {
    name: "Khan Academy Kids",
    url: "https://learn.khanacademy.org/khan-academy-kids/",
    emoji: "🧠",
    color: "from-purple-300 to-fuchsia-300",
    textColor: "text-fuchsia-900",
    hoverColor: "hover:from-purple-400 hover:to-fuchsia-400",
  },
  {
    name: "LEGO Kids",
    url: "https://www.lego.com/en-us/kids",
    emoji: "🧩",
    color: "from-teal-300 to-cyan-300",
    textColor: "text-teal-900",
    hoverColor: "hover:from-teal-400 hover:to-cyan-400",
  },
  {
    name: "Ask a question",
    url: null,
    emoji: "❓",
    color: "from-indigo-300 to-purple-300",
    textColor: "text-indigo-900",
    hoverColor: "hover:from-indigo-400 hover:to-purple-400",
  },
];

const COLORS = [
  { label: "Red", from: "from-pink-300", to: "to-red-300", text: "text-red-900", hover: "hover:from-pink-400 hover:to-red-400" },
  { label: "Blue", from: "from-sky-300", to: "to-blue-300", text: "text-blue-900", hover: "hover:from-sky-400 hover:to-blue-400" },
  { label: "Green", from: "from-green-300", to: "to-emerald-300", text: "text-emerald-900", hover: "hover:from-green-400 hover:to-emerald-400" },
  { label: "Orange", from: "from-yellow-300", to: "to-orange-300", text: "text-orange-900", hover: "hover:from-yellow-400 hover:to-orange-400" },
  { label: "Purple", from: "from-purple-300", to: "to-fuchsia-300", text: "text-fuchsia-900", hover: "hover:from-purple-400 hover:to-fuchsia-400" },
  { label: "Teal", from: "from-teal-300", to: "to-cyan-300", text: "text-teal-900", hover: "hover:from-teal-400 hover:to-cyan-400" },
];

function KidsHome() {
  const [links, setLinks] = useState(() => {
    const saved = localStorage.getItem("kids_browser_links");
    return saved ? JSON.parse(saved) : DEFAULT_LINKS;
  });

  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isRemoveMode, setIsRemoveMode] = useState(false);
  const [mathProblem, setMathProblem] = useState({ q: "", a: 0 });
  const [userAnswer, setUserAnswer] = useState("");
  const [newSite, setNewSite] = useState({ name: "", url: "", emoji: "🌟", colorIndex: 0 });
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("kids_browser_links", JSON.stringify(links));
  }, [links]);

  useEffect(() => {
    if (window.api) {
      window.api.receive('cmd:toggle-remove-mode', () => {
        setIsRemoveMode(prev => !prev);
      });
    }
  }, []);

  function openAsk() {
    navigate("/ask");
  }

  function openInApp(url) {
    const u = encodeURIComponent(url);
    navigate(`/open?url=${u}`);
  }

  function handleAddClick() {
    generateMathProblem();
    setIsVerificationOpen(true);
    setError("");
    setUserAnswer("");
  }

  function generateMathProblem() {
    const type = Math.random() > 0.5 ? 'multiplication' : 'mixed';

    if (type === 'multiplication') {
      // Two digit (11-19) * Single digit (3-9)
      const a = Math.floor(Math.random() * 9) + 11;
      const b = Math.floor(Math.random() * 7) + 3;
      setMathProblem({ q: `${a} x ${b} = ?`, a: a * b });
    } else {
      // Mixed: (A x B) + C
      const a = Math.floor(Math.random() * 8) + 2;
      const b = Math.floor(Math.random() * 8) + 2;
      const c = Math.floor(Math.random() * 20) + 1;
      setMathProblem({ q: `(${a} x ${b}) + ${c} = ?`, a: (a * b) + c });
    }
  }

  function verifyParent(e) {
    e.preventDefault();
    if (parseInt(userAnswer) === mathProblem.a) {
      setIsVerificationOpen(false);
      setIsAddFormOpen(true);
      setError("");
    } else {
      setError("Incorrect. Please try again.");
      generateMathProblem();
      setUserAnswer("");
    }
  }

  function saveNewSite(e) {
    e.preventDefault();
    if (!newSite.name || !newSite.url) {
      setError("Please fill in all fields.");
      return;
    }
    const color = COLORS[newSite.colorIndex];
    if (!color) return;

    // Basic URL validation/fix
    let formattedUrl = newSite.url;
    if (!formattedUrl.startsWith("http")) {
      formattedUrl = "https://" + formattedUrl;
    }

    const newLink = {
      name: newSite.name,
      url: formattedUrl,
      emoji: newSite.emoji,
      color: `${color.from} ${color.to}`,
      textColor: color.text,
      hoverColor: color.hover,
    };

    setLinks([...links, newLink]);
    setIsAddFormOpen(false);
    setNewSite({ name: "", url: "", emoji: "🌟", colorIndex: 0 });
    setError("");
  }

  return (
    <div className="min-h-screen background-image flex flex-col relative">
      {/* Header */}
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/10 backdrop-blur-xl border-b border-white/20 p-4 shadow-md">
        <h1 className="text-4xl font-black text-indigo-700 text-center drop-shadow-lg">
          🌟 Welcome to Kids Browser
        </h1>
        <p className="text-center text-indigo-600 mt-1 font-semibold text-sm">
          Explore safe and fun websites!
        </p>
      </header>

      {/* Remove Mode Banner */}
      {isRemoveMode && (
        <div className="bg-red-500 text-white text-center py-2 font-bold animate-pulse sticky top-[89px] z-40 shadow-md">
          🗑️ REMOVE MODE ACTIVE - Click "X" to delete websites.
          <button
            onClick={() => setIsRemoveMode(false)}
            className="ml-4 bg-white text-red-600 px-3 py-1 rounded-full text-sm hover:bg-red-100 transition-colors"
          >
            Done
          </button>
        </div>
      )}

      {/* Cards */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
        {links.map((link, idx) => (
          <div key={`${link.name}-${idx}`} className="h-full relative group-wrapper">
            <button
              onClick={() => (link.url ? openInApp(link.url) : openAsk())}
              disabled={isRemoveMode} // Disable navigation in remove mode
              className={`w-full h-full min-h-[160px] bg-linear-to-br ${link.color} ${link.hoverColor} p-6 rounded-2xl shadow-lg border-2 border-white/40 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-offset-2 active:scale-95 group flex flex-col items-center justify-center ${isRemoveMode ? 'animate-shake' : ''}`}
            >
              <div className="flex flex-col items-center gap-3 text-center h-full justify-center">
                <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
                  {link.emoji}
                </span>
                <h2 className={`text-xl font-black ${link.textColor} group-hover:underline leading-tight`}>
                  {link.name}
                </h2>
              </div>
            </button>
            {/* Delete Button (Except Ask a question) */}
            {isRemoveMode && link.name !== "Ask a question" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const newLinks = links.filter((_, i) => i !== idx);
                  setLinks(newLinks);
                }}
                className="absolute -top-3 -right-3 bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg border-2 border-white hover:bg-red-700 hover:scale-110 transition-all z-10"
                title="Remove Website"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        {/* Add Button */}
        <div className="h-full">
          <button
            onClick={handleAddClick}
            className="w-full h-full min-h-[160px] bg-white/30 hover:bg-white/50 p-6 rounded-2xl shadow-lg border-2 border-dashed border-white/60 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-offset-2 active:scale-95 group flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="text-5xl text-white/80 group-hover:scale-110 transition-transform duration-300">
                ➕
              </span>
              <h2 className="text-xl font-black text-white/80 group-hover:underline leading-tight">
                Add Website
              </h2>
            </div>
          </button>
        </div>
      </main>

      {/* Parent Verification Modal */}
      {isVerificationOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-fade-in">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Parent Verification</h3>
            <p className="text-gray-600 mb-6 text-center">Please solve this to continue:</p>
            <div className="text-4xl font-mono text-center mb-6 text-indigo-600 font-bold">{mathProblem.q}</div>
            <form onSubmit={verifyParent}>
              <input
                type="number"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="w-full p-4 text-center text-2xl border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all mb-4"
                placeholder="?"
                autoFocus
              />
              {error && <p className="text-red-500 text-center mb-4">{error}</p>}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsVerificationOpen(false)}
                  className="flex-1 py-3 px-6 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-6 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                >
                  Verify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Website Form Modal */}
      {isAddFormOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-fade-in overflow-y-auto max-h-[90vh]">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Add New Website</h3>
            <form onSubmit={saveNewSite} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Website Name</label>
                <input
                  type="text"
                  value={newSite.name}
                  onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                  placeholder="e.g. PBS Kids"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">URL</label>
                <input
                  type="url"
                  value={newSite.url}
                  onChange={(e) => setNewSite({ ...newSite, url: e.target.value })}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                  placeholder="https://..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Emoji Icon</label>
                <input
                  type="text"
                  value={newSite.emoji}
                  onChange={(e) => setNewSite({ ...newSite, emoji: e.target.value })}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                  placeholder="Choose an emoji"
                  maxLength="2"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Color Theme</label>
                <div className="grid grid-cols-3 gap-2">
                  {COLORS.map((c, i) => (
                    <button
                      key={c.label}
                      type="button"
                      onClick={() => setNewSite({ ...newSite, colorIndex: i })}
                      className={`p-2 rounded-lg border-2 transition-all ${newSite.colorIndex === i ? "border-indigo-600 scale-105 shadow-md" : "border-transparent hover:border-gray-200"
                        }`}
                    >
                      <div className={`h-8 rounded-md bg-linear-to-r ${c.from} ${c.to}`}></div>
                      <span className="text-xs font-semibold text-gray-600">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-red-500 text-center">{error}</p>}

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddFormOpen(false)}
                  className="flex-1 py-3 px-6 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-6 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                >
                  Save Website
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default KidsHome;
