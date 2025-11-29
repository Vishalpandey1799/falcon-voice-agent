import { forwardRef } from "react";
import { Button } from "@/components/livekit/button";
import {
  Swords,
  Map,
  ScrollText,
  Flame,
  Shield,
  Sparkles,
} from "lucide-react";

interface WelcomeViewProps {
  startButtonText: string;
  onStartCall: () => void;
}

export const WelcomeView = forwardRef<HTMLDivElement, WelcomeViewProps>(
  ({ startButtonText, onStartCall }, ref) => {
    return (
      <div
        ref={ref}
        className="bg-gradient-to-b from-black via-gray-900 to-black
                   text-gray-200 min-h-screen overflow-y-auto py-12 px-4"
      >
        <div className="flex flex-col items-center mx-auto max-w-5xl">

          {/* Header */}
          <header className="w-full flex justify-start items-center py-4">
            <div className="flex items-center space-x-2">
              <Flame className="text-red-500" size={26} />
              <span className="text-lg font-bold text-gray-300">
                Eldoria Realms
              </span>
            </div>
          </header>

          {/* Hero Section */}
          <section className="flex flex-col items-center text-center w-full max-w-4xl pt-10">

            <div className="mb-8 text-yellow-300">
              <Sparkles size={80} className="animate-pulse" />
            </div>

            <h1 className="text-5xl sm:text-6xl font-extrabold text-white mb-3 tracking-tight">
              Enter the Whisperwood
            </h1>

            <p className="text-lg sm:text-xl text-gray-300 max-w-xl font-medium mb-16">
              A voice-driven fantasy RPG. Explore ancient ruins, battle dark creatures,
              and carve your legend — all by speaking.
            </p>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-16">

              {/* Card 1 */}
              <div className="bg-gray-800/40 border border-gray-700/60 rounded-2xl p-6 
                              flex flex-col items-center text-center backdrop-blur-md shadow-xl
                              hover:scale-[1.03] transition-all cursor-pointer">
                <Map size={48} className="text-teal-300 mb-3" />
                <p className="text-lg font-bold text-white mb-1">Explore the World</p>
                <p className="text-xs text-teal-200 max-w-[90%]">
                  Venture through forests, ruins, mountains, and magical realms.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-gray-800/40 border border-gray-700/60 rounded-2xl p-6 
                              flex flex-col items-center text-center backdrop-blur-md shadow-xl
                              hover:scale-[1.03] transition-all cursor-pointer">
                <Swords size={48} className="text-rose-300 mb-3" />
                <p className="text-lg font-bold text-white mb-1">Battle & Survive</p>
                <p className="text-xs text-rose-200 max-w-[90%]">
                  Fight goblins, spirits, and shadow beasts using your voice.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-gray-800/40 border border-gray-700/60 rounded-2xl p-6 
                              flex flex-col items-center text-center backdrop-blur-md shadow-xl
                              hover:scale-[1.03] transition-all cursor-pointer">
                <ScrollText size={48} className="text-blue-300 mb-3" />
                <p className="text-lg font-bold text-white mb-1">Dynamic Story</p>
                <p className="text-xs text-blue-200 max-w-[90%]">
                  Your choices shape the world. Every session is unique.
                </p>
              </div>

            </div>

            {/* Categories */}
            <div className="w-full max-w-2xl mb-12">
              <p className="mb-6 font-semibold text-gray-400">Paths Awaiting You:</p>
              <div className="flex gap-3 flex-wrap justify-center">
                {[
                  "Whisperwood Forest",
                  "Eldoria Village",
                  "Ancient Ruins",
                  "Crystal Caves",
                  "Dark Mountains",
                  "Sorcerer’s Keep",
                ].map((path) => (
                  <span
                    key={path}
                    className="px-4 py-2 bg-gray-700/50 border border-gray-600/70
                               rounded-full text-sm font-medium text-gray-200 shadow-sm"
                  >
                    {path}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <Button
              variant="primary"
              size="lg"
              onClick={onStartCall}
              className="w-full sm:w-80 font-bold text-xl py-4 
                         bg-yellow-400 hover:bg-yellow-300 text-black 
                         shadow-2xl shadow-yellow-500/40 hover:shadow-yellow-400/70
                         transition-all hover:-translate-y-1 active:translate-y-0"
            >
              {startButtonText}
            </Button>

            {/* Attribution */}
            <div className="mt-10 mb-12 text-gray-500 text-xs sm:text-sm">
              <p>Powered by Murf Falcon TTS • Gemini • Deepgram • LiveKit Agents</p>
            </div>

          </section>

          {/* Footer */}
          <footer className="w-full py-4 text-center text-gray-600 text-xs max-w-xl px-4">
            <p>
              This is an interactive voice adventure. Speak clearly when prompted. 
              Your journey awaits.
            </p>
          </footer>

        </div>
      </div>
    );
  }
);

WelcomeView.displayName = "WelcomeView";
