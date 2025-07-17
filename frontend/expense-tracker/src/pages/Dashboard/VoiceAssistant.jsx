import DashboardLayout from "../../components/Layouts/DashboardLayout";
import { useState } from "react";
import { LuMic } from "react-icons/lu";
import VoiceAgent from "../../components/VoiceAgent";

export default function VoiceAssistant() {
  const [showAgent, setShowAgent] = useState(false);

  return (
    <DashboardLayout activeMenu="VoiceAssistant">
      <div className="my-8 mx-auto max-w-xl flex flex-col items-center">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-primary/10 rounded-full p-6 mb-2 shadow-lg flex items-center justify-center">
            <button
              className="bg-primary text-white rounded-full p-8 shadow-lg hover:bg-primary/90 transition-all duration-200 focus:outline-none"
              style={{ fontSize: 48 }}
              onClick={() => setShowAgent(true)}
              aria-label="Start speaking"
            >
              <LuMic size={64} />
            </button>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-800 mb-1 tracking-tight">TrackO-Bot</h1>
          <div className="text-gray-500 text-lg mb-2">Your AI Voice Assistant</div>
        </div>
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
          <div className="w-full">
            <VoiceAgent />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 