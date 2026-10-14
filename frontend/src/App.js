import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { ArrowRight } from "lucide-react";

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);


  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const generate = async () => {
    const text = prompt.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setPrompt("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:3004/generate", { prompt: text });
      setMessages((prev) => [...prev, { role: "ai", text: res.data.text }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: err.response?.data?.error || "Server sathe connect nathi thatu" },
      ]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      generate();
    }
  };

  return (
    <div className="flex h-screen flex-col bg-gray-50 text-gray-900 dark:bg-[#050816] dark:text-white">

      <div className="relative border-b border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-[#050816]">
        <h2 className="text-center text-xl font-semibold">AskBuddy</h2>
        <button
          onClick={() => setDark(!dark)}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          {dark ? "Light" : "Dark"}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-4xl space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2 ${m.role === "user"
                  ? "bg-gradient-to-r from-[#00FF87] to-[#60EFFF] text-black"
                  : "bg-gray-200 text-gray-900 dark:bg-gray-900 dark:text-white shadow dark:font-thin"
                  }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {loading && <div className="text-gray-400">Generating...</div>}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Textbox */}
      <div className="border-t border-gray-200 bg-white p-4 dark:text-black dark:border-gray-800 dark:bg-[#050816] p-4">
        <div className="mx-auto flex max-w-4xl gap-2">
          <textarea
            rows={1}
            className="flex-1 resize-none rounded-lg border p-2 outline-none focus:border-blue-500"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write Something..."
          />
          <button
            onClick={generate}
            disabled={loading}
            className="flex items-center justify-center rounded-lg  bg-gradient-to-r from-[#00FF87] to-[#60EFFF] px-4 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}