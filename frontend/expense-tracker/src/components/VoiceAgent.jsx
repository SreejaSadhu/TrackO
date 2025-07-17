import { useState } from "react";
import axios from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;

// Helper to convert number words to digits (basic)
const numberWords = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
  thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90
};
function wordsToNumber(str) {
  // Only supports up to 99 for simplicity
  if (!str) return null;
  str = str.toLowerCase();
  if (numberWords[str] !== undefined) return numberWords[str];
  const parts = str.split(" ");
  if (parts.length === 2 && numberWords[parts[0]] && numberWords[parts[1]]) {
    return numberWords[parts[0]] + numberWords[parts[1]];
  }
  return null;
}

function parseVoiceCommand(text) {
  // Try to match numbers as digits
  let expenseMatch = text.match(/add expense (\d+)(?: dollars)?(?: for| on)? (.+)/i);
  if (expenseMatch) {
    return { type: "expense", amount: expenseMatch[1], description: expenseMatch[2] };
  }
  let incomeMatch = text.match(/add income (\d+)(?: dollars)?(?: from| for)? (.+)/i);
  if (incomeMatch) {
    return { type: "income", amount: incomeMatch[1], description: incomeMatch[2] };
  }
  // Try to match numbers as words
  expenseMatch = text.match(/add expense ([a-z\- ]+)(?: dollars)?(?: for| on)? (.+)/i);
  if (expenseMatch) {
    const num = wordsToNumber(expenseMatch[1]);
    if (num !== null) {
      return { type: "expense", amount: num, description: expenseMatch[2] };
    }
  }
  incomeMatch = text.match(/add income ([a-z\- ]+)(?: dollars)?(?: from| for)? (.+)/i);
  if (incomeMatch) {
    const num = wordsToNumber(incomeMatch[1]);
    if (num !== null) {
      return { type: "income", amount: num, description: incomeMatch[2] };
    }
  }
  return null;
}

export default function VoiceAgent() {
  const [listening, setListening] = useState(false);
  const [recognized, setRecognized] = useState("");
  const [parsed, setParsed] = useState(null);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [manual, setManual] = useState(false);
  const [manualText, setManualText] = useState("");

  const startListening = () => {
    setError("");
    setRecognized("");
    setParsed(null);
    setSuccess("");
    setConfirming(false);
    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser. Please use Chrome or Edge, or use manual input.");
      return;
    }
    setListening(true);
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setRecognized(transcript);
      const data = parseVoiceCommand(transcript);
      if (!data) {
        setError("Sorry, I couldn't understand. Please try again or use manual input.");
        setListening(false);
        return;
      }
      setParsed(data);
      setConfirming(true);
      setListening(false);
    };
    recognition.onerror = (event) => {
      setError("Speech recognition error: " + event.error);
      setListening(false);
    };
    recognition.onend = () => {
      setListening(false);
    };
    recognition.start();
  };

  const handleConfirm = async () => {
    if (!parsed) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const endpoint = parsed.type === "expense" ? API_PATHS.EXPENSE.ADD_EXPENSE : API_PATHS.INCOME.ADD_INCOME;
      const today = new Date().toISOString().split("T")[0];
      const payload = parsed.type === "expense"
        ? { category: parsed.description, amount: parsed.amount, date: today }
        : { source: parsed.description, amount: parsed.amount, date: today };
      await axios.post(endpoint, payload);
      setSuccess(`${parsed.type === "expense" ? "Expense" : "Income"} added: $${parsed.amount} for ${parsed.description}`);
      setParsed(null);
      setConfirming(false);
    } catch (err) {
      setError("Error adding entry: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = () => {
    setRecognized(manualText);
    const data = parseVoiceCommand(manualText);
    if (!data) {
      setError("Could not parse your input. Try: 'Add expense 50 for groceries'.");
      return;
    }
    setParsed(data);
    setConfirming(true);
    setManual(false);
    setManualText("");
  };

  return (
    <div className="p-4 border rounded max-w-md mx-auto my-4 bg-white shadow">
      <h2 className="text-lg font-bold mb-2">Add Income/Expense by Voice</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}
      {listening && <div className="text-blue-600 mb-2">Listening... Please speak your command.</div>}
      {!listening && !confirming && (
        <div className="flex gap-2 mb-2">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={startListening}
            disabled={loading}
          >
            {SpeechRecognition ? "🎤 Speak" : "🎤 Not Supported"}
          </button>
          <button
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            onClick={() => { setManual(true); setError(""); setSuccess(""); }}
            disabled={loading}
          >
            Type Instead
          </button>
        </div>
      )}
      {manual && (
        <div className="mb-2">
          <input
            className="border px-2 py-1 rounded w-full mb-1"
            type="text"
            placeholder="e.g. Add expense 50 for groceries"
            value={manualText}
            onChange={e => setManualText(e.target.value)}
            disabled={loading}
          />
          <button
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handleManualSubmit}
            disabled={loading || !manualText.trim()}
          >
            Parse
          </button>
        </div>
      )}
      {recognized && <div className="mb-2">Heard: <span className="font-mono">{recognized}</span></div>}
      {confirming && parsed && (
        <div className="mb-2">
          <div>Confirm to add <b>{parsed.type}</b>:</div>
          <div className="mb-1">Amount: <b>${parsed.amount}</b></div>
          <div className="mb-1">Description: <b>{parsed.description}</b></div>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              onClick={handleConfirm}
              disabled={loading}
            >
              Confirm
            </button>
            <button
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              onClick={() => { setParsed(null); setConfirming(false); setRecognized(""); }}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      <div className="text-xs text-gray-500 mt-2">
        Example: <span className="font-mono">Add expense 50 for groceries</span> or <span className="font-mono">Add income 1000 from salary</span>.<br/>
        Your voice is never recorded or sent to third parties.
      </div>
    </div>
  );
} 