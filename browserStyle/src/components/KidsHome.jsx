import { useNavigate } from "react-router-dom";

function KidsHome() {
  const links = [
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

  const navigate = useNavigate();
  
  function openAsk() {
    navigate("/ask");
  }

  function openInApp(url) {
    const u = encodeURIComponent(url);
    navigate(`/open?url=${u}`);
  }

  return (
    <div className="min-h-screen background-image flex flex-col">
      {/* Header */}
      <header className="backdrop-blur-md border-b border-white/20 p-6 shadow-md">
        <h1 className="text-5xl font-black text-indigo-700 text-center drop-shadow-lg">
          🌟 Welcome to Kids Browser
        </h1>
        <p className="text-center text-indigo-600 mt-2 font-semibold">
          Explore safe and fun websites!
        </p>
      </header>

      {/* Cards */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
        {links.map((link) => (
          <div key={link.name} className="h-full">
            <button
              onClick={() => (link.url ? openInApp(link.url) : openAsk())}
              className={`w-full h-full bg-gradient-to-br ${link.color} ${link.hoverColor} p-8 rounded-3xl shadow-xl border-2 border-white/40 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 focus:outline-none focus:ring-4 focus:ring-offset-2 active:scale-95 group`}
            >
              <div className="flex flex-col items-center gap-4 text-center h-full justify-center">
                <span className="text-6xl group-hover:scale-125 transition-transform duration-300">
                  {link.emoji}
                </span>
                <h2 className={`text-2xl font-black ${link.textColor} group-hover:underline`}>
                  {link.name}
                </h2>
              </div>
            </button>
          </div>
        ))}
      </main>
    </div>
  );
}

export default KidsHome;
