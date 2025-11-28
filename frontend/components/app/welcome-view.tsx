import { forwardRef } from "react";
import { Button } from "@/components/livekit/button";
import {
  ShoppingCart,
  ClipboardList,
  RefreshCcw,
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
        className="bg-gradient-to-br from-gray-900 via-green-950 to-gray-900
                   text-white min-h-screen overflow-y-auto py-12 px-4"
      >
        <div className="flex flex-col items-center mx-auto max-w-6xl">

          {/* Header */}
          <header className="w-full flex justify-start items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 bg-green-500 rounded-sm"></div>
              <span className="text-lg font-bold text-gray-200">QuickBasket</span>
            </div>
          </header>

          {/* Hero */}
          <section className="flex flex-col items-center text-center w-full max-w-4xl pt-12">
            
            <div className="mb-8 text-green-400">
              <ShoppingCart size={90} className="animate-pulse" />
            </div>

            <h1 className="text-6xl font-extrabold text-white mb-3 tracking-tight">
              QuickBasket Grocery
            </h1>

            <p className="text-xl text-teal-300 max-w-xl font-medium mb-16">
              Your personal AI grocery shopper. Fast, fresh, and delivered.
            </p>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-16">

              {/* Card 1 */}
              <div className="bg-green-700/10 border border-green-600/40 rounded-2xl p-6 
                              flex flex-col items-center text-center backdrop-blur-md shadow-xl
                              hover:scale-[1.03] transition-all cursor-pointer">
                <ClipboardList size={48} className="text-green-300 mb-3" />
                <p className="text-lg font-bold text-white mb-1">Build Your List</p>
                <p className="text-xs text-green-200 max-w-[90%]">
                  Just tell our AI what you need — no typing required.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-teal-700/10 border border-teal-600/40 rounded-2xl p-6 
                              flex flex-col items-center text-center backdrop-blur-md shadow-xl
                              hover:scale-[1.03] transition-all cursor-pointer">
                <ShoppingCart size={48} className="text-teal-300 mb-3" />
                <p className="text-lg font-bold text-white mb-1">Smart Cart</p>
                <p className="text-xs text-teal-200 max-w-[90%]">
                  “Add milk and eggs.” Natural language understood.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-indigo-700/10 border border-indigo-600/40 rounded-2xl p-6 
                              flex flex-col items-center text-center backdrop-blur-md shadow-xl
                              hover:scale-[1.03] transition-all cursor-pointer">
                <RefreshCcw size={48} className="text-indigo-300 mb-3" />
                <p className="text-lg font-bold text-white mb-1">Weekly Repeat</p>
                <p className="text-xs text-indigo-200 max-w-[90%]">
                  Quickly reorder your favourites with one command.
                </p>
              </div>

            </div>

            {/* Categories */}
            <div className="w-full max-w-2xl mb-12">
              <p className="mb-6 font-semibold text-gray-300">Popular departments:</p>
              <div className="flex gap-3 flex-wrap justify-center">
                {[
                  "Produce",
                  "Dairy & Eggs",
                  "Pantry",
                  "Frozen",
                  "Baking",
                  "Household",
                ].map((category) => (
                  <span
                    key={category}
                    className="px-4 py-2 bg-teal-600/30 border border-teal-500/60
                               rounded-full text-sm font-medium text-teal-100 shadow-sm"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <Button
              variant="primary"
              size="lg"
              onClick={onStartCall}
              className="w-full sm:w-96 font-bold text-xl py-4 
                         bg-green-500 hover:bg-green-400 text-gray-900 
                         shadow-2xl shadow-green-500/50 hover:shadow-green-400/70
                         transition-all hover:-translate-y-1 active:translate-y-0"
            >
              {startButtonText}
            </Button>

            {/* Attribution */}
            <div className="mt-10 mb-12 text-gray-400 text-xs sm:text-sm">
              <p>Powered by Murf Falcon TTS • Google Gemini • Deepgram STT</p>
            </div>

          </section>

          {/* Footer */}
          <footer className="w-full py-4 text-center text-gray-600 text-xs max-w-xl px-4">
            <p>
              QuickBasket uses AI to help you shop. Final review happens before checkout.
            </p>
          </footer>

        </div>
      </div>
    );
  }
);

WelcomeView.displayName = "WelcomeView";
