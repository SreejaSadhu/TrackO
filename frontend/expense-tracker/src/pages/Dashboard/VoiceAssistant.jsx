import DashboardLayout from "../../components/Layouts/DashboardLayout";
import { useState } from "react";
import { LuMic, LuMicOff, LuPlus, LuBrain } from "react-icons/lu";
import { AiOutlineMessage, AiOutlineQuestionCircle } from "react-icons/ai";
import { motion, AnimatePresence } from "framer-motion";
import VoiceAgent from "../../components/VoiceAgent";

const robotAvatar = (
  <span className="text-5xl" role="img" aria-label="robot">🤖</span>
);

const suggestedQuestions = [
  "How much did I spend this month?",
  "What's my biggest expense category?",
  "How much did I earn this month?",
  "What's my current balance?",
  "Show me my spending trends",
  "Which day do I spend the most?",
  "How much did I save this month?",
  "What's my average monthly expense?"
];

export default function VoiceAssistant() {
  const [tab, setTab] = useState("add");
  const [showAgent, setShowAgent] = useState(false);

  return (
    <DashboardLayout activeMenu="VoiceAssistant">
      <div className="my-8 mx-auto max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            {robotAvatar}
            <div>
              <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">TrackO-Bot</h1>
              <p className="text-gray-500 text-lg">Your Intelligent Financial Assistant</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 p-1 rounded-xl">
            <button
              className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                tab === "add" 
                  ? "bg-primary text-white shadow-lg scale-105" 
                  : "text-gray-600 hover:text-primary hover:bg-white"
              }`}
              onClick={() => setTab("add")}
            >
              <LuPlus size={20} />
              Add Transactions
            </button>
            <button
              className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                tab === "ask" 
                  ? "bg-primary text-white shadow-lg scale-105" 
                  : "text-gray-600 hover:text-primary hover:bg-white"
              }`}
              onClick={() => setTab("ask")}
            >
              <LuBrain size={20} />
              Ask Questions
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            {tab === "add" && (
              <motion.div
                key="add"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.4 }}
                className="max-w-2xl mx-auto"
              >
                {/* Voice Input Section */}
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 mb-6">
                  <div className="text-center">
                    <motion.button
                      className={`rounded-full p-12 shadow-2xl mb-6 flex items-center justify-center mx-auto transition-all duration-300 ${
                        showAgent 
                          ? "bg-gradient-to-r from-primary to-primary/80 text-white scale-110" 
                          : "bg-white text-primary hover:shadow-xl"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowAgent(!showAgent)}
                      aria-label="Toggle voice input"
                    >
                      {showAgent ? <LuMicOff size={80} /> : <LuMic size={80} />}
                    </motion.button>
                    
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      {showAgent ? "Listening..." : "Start Speaking"}
                    </h2>
                    <p className="text-gray-600 mb-4">
                      {showAgent 
                        ? "Speak your transaction details" 
                        : "Click the mic to add income or expenses with your voice"
                      }
                    </p>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <AiOutlineQuestionCircle className="text-primary" />
                    How to Use Voice Input
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">For Expenses:</h4>
                      <ul className="space-y-1 text-gray-600">
                        <li>• &quot;I spent $50 on groceries&quot;</li>
                        <li>• &quot;Add $25 for coffee&quot;</li>
                        <li>• &quot;Paid $100 for gas&quot;</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">For Income:</h4>
                      <ul className="space-y-1 text-gray-600">
                        <li>• &quot;Received $2000 from salary&quot;</li>
                        <li>• &quot;Got $500 from freelance&quot;</li>
                        <li>• &quot;Earned $100 from side job&quot;</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Voice Agent Component */}
                {showAgent && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
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
                className="max-w-4xl mx-auto"
              >
                {/* Ask Section Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 mb-6">
                  <div className="flex items-center gap-4 mb-4">
                    {robotAvatar}
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">Ask TrackO-Bot</h2>
                      <p className="text-gray-600">Get insights about your financial data</p>
                    </div>
                  </div>
                </div>

                {/* Suggested Questions */}
                <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <AiOutlineMessage className="text-primary" />
                    Try These Questions
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {suggestedQuestions.map((question, index) => (
                      <motion.button
                        key={index}
                        className="text-left p-3 bg-gray-50 hover:bg-primary/10 rounded-lg transition-colors duration-200 border border-gray-200 hover:border-primary/30"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          // This will be handled by the VoiceAgent component
                          const event = new CustomEvent('suggestedQuestion', { detail: question });
                          window.dispatchEvent(event);
                        }}
                      >
                        <span className="text-gray-700 text-sm">{question}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Voice Agent for Questions */}
                <VoiceAgent mode="ask" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
} 