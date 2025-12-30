function KidsHome() {
  const links = [
    {
      name: "YouTube Kids",
      url: "https://www.youtubekids.com/",
      emoji: "🎈",
      color: "from-pink-300 to-red-300",
      textColor: "text-red-900",
    },
    {
      name: "Simple Wikipedia",
      url: "https://simple.wikipedia.org/",
      emoji: "📘",
      color: "from-sky-300 to-blue-300",
      textColor: "text-blue-900",
    },
    {
      name: "Nat Geo Kids",
      url: "https://kids.nationalgeographic.com/",
      emoji: "🦁",
      color: "from-yellow-300 to-orange-300",
      textColor: "text-orange-900",
    },
    {
      name: "PBS Kids",
      url: "https://pbskids.org/",
      emoji: "🌈",
      color: "from-green-300 to-emerald-300",
      textColor: "text-emerald-900",
    },
    {
      name: "Khan Academy Kids",
      url: "https://learn.khanacademy.org/khan-academy-kids/",
      emoji: "🧠",
      color: "from-purple-300 to-fuchsia-300",
      textColor: "text-fuchsia-900",
    },
    {
      name: "LEGO Kids",
      url: "https://www.lego.com/en-us/kids",
      emoji: "🧩",
      color: "from-teal-300 to-cyan-300",
      textColor: "text-teal-900",
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-b from-sky-100 to-indigo-100">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur border-b p-4 text-center">
        <h1 className="text-3xl font-extrabold text-indigo-700">
          Welcome to Kids Browser
        </h1>
      </header>

      {/* Cards */}
      <main className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {links.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`group block rounded-2xl bg-linear-to-br ${link.color} p-6 shadow-lg border hover:shadow-xl transition-transform hover:-translate-y-1 focus:outline-none focus:ring-4`}
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">{link.emoji}</span>
              <h2
                className={`text-xl font-extrabold ${link.textColor} group-hover:underline`}
              >
                {link.name}
              </h2>
            </div>
          </a>
        ))}
      </main>
    </div>
  );
}

export default KidsHome;
