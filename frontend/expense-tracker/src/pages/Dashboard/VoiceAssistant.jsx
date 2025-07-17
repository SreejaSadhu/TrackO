import DashboardLayout from "../../components/Layouts/DashboardLayout";
import { useState } from "react";
import { LuMic } from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";
import VoiceAgent from "../../components/VoiceAgent";

const robotAvatar = (
  <span className="text-5xl" role="img" aria-label="robot">🤖</span>
);

export default function VoiceAssistant() {
  const [tab, setTab] = useState("add");
  const [showAgent, setShowAgent] = useState(false);

  return (
    <DashboardLayout activeMenu="VoiceAssistant">
      <div className="my-8 mx-auto max-w-xl flex flex-col items-center">
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-3 mb-2">
            {robotAvatar}
            <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">TrackO-Bot</h1>
          </div>
          <div className="text-gray-500 text-lg mb-2">Your AI Voice Assistant</div>
        </div>
        <div className="flex w-full justify-center mb-6">
          <button
            className={`px-6 py-2 rounded-l-lg font-semibold transition-all duration-200 ${tab === "add" ? "bg-primary text-white scale-105" : "bg-gray-200 text-gray-700 hover:bg-primary/20"}`}
            onClick={() => setTab("add")}
          >
            Add Income/Expense
          </button>
          <button
            className={`px-6 py-2 rounded-r-lg font-semibold transition-all duration-200 ${tab === "ask" ? "bg-primary text-white scale-105" : "bg-gray-200 text-gray-700 hover:bg-primary/20"}`}
            onClick={() => setTab("ask")}
          >
            Ask TrackO-Bot
          </button>
        </div>
        <div className="w-full">
          <AnimatePresence mode="wait">
            {tab === "add" && (
              <motion.div
                key="add"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center"
              >
                <motion.button
                  className="bg-primary text-white rounded-full p-8 shadow-lg mb-4 flex items-center justify-center"
                  style={{ fontSize: 48 }}
                  whileHover={{ scale: 1.1 }}
                  animate={showAgent ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ repeat: showAgent ? Infinity : 0, duration: 1, repeatType: "reverse" }}
                  onClick={() => setShowAgent(true)}
                  aria-label="Start speaking"
                >
                  <LuMic size={64} className={showAgent ? "animate-pulse" : ""} />
                </motion.button>
                <div className="bg-white/80 rounded-xl p-6 shadow w-full mb-6">
                  <h2 className="text-lg font-semibold mb-2">How to use TrackO-Bot:</h2>
                  <ul className="list-disc pl-6 text-gray-700 text-base space-y-1">
                    <li>Click the <b>mic</b> to start speaking.</li>
                    <li>Say things like <span className="font-mono">&quot;I paid 500 for groceries&quot;</span> or <span className="font-mono">&quot;Received 2000 from freelance&quot;</span>.</li>
                    <li>TrackO-Bot will understand and add your income or expense.</li>
                    <li>You can also type your command if you prefer.</li>
                  </ul>
                </div>
                {showAgent && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="w-full"
                  >
                    <VoiceAgent mode="add" />
                  </motion.div>
                )}
              </motion.div>
            )}
            {tab === "ask" && (
              <motion.div
                key="ask"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.4 }}
                className="w-full"
              >
                <div className="flex items-center gap-2 mb-4">
                  {robotAvatar}
                  <span className="font-bold text-lg text-primary">Ask me anything about your finances!</span>
                </div>
                <VoiceAgent mode="ask" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
} 