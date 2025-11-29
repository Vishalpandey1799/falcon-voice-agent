'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import type { AppConfig } from '@/app-config';
import { ChatTranscript } from '@/components/app/chat-transcript';
import { PreConnectMessage } from '@/components/app/preconnect-message';
import { TileLayout } from '@/components/app/tile-layout';
import {
  AgentControlBar,
  type ControlBarControls,
} from '@/components/livekit/agent-control-bar/agent-control-bar';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useConnectionTimeout } from '@/hooks/useConnectionTimout';
import { useDebugMode } from '@/hooks/useDebug';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../livekit/scroll-area/scroll-area';

const MotionBottom = motion.create('div');

const IN_DEVELOPMENT = process.env.NODE_ENV !== 'production';
const BOTTOM_VIEW_MOTION_PROPS = {
  variants: {
    visible: {
      opacity: 1,
      translateY: '0%',
    },
    hidden: {
      opacity: 0,
      translateY: '100%',
    },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
  transition: {
    duration: 0.3,
    delay: 0.5,
    ease: 'easeOut',
  },
};

interface FadeProps {
  top?: boolean;
  bottom?: boolean;
  className?: string;
}

export function Fade({ top = false, bottom = false, className }: FadeProps) {
  return (
    <div
      className={cn(
        'from-background pointer-events-none h-4 bg-linear-to-b to-transparent',
        top && 'bg-linear-to-b',
        bottom && 'bg-linear-to-t',
        className
      )}
    />
  );
}
interface SessionViewProps {
  appConfig: AppConfig;
}

export const SessionView = ({
  appConfig,
  ...props
}: React.ComponentProps<'section'> & SessionViewProps) => {
  useConnectionTimeout(200_000);
  useDebugMode({ enabled: IN_DEVELOPMENT });

  const messages = useChatMessages();
  const [chatOpen, setChatOpen] = useState(true);
  const [tutorMode, setTutorMode] = useState<string>('select');
  const [tutorConcept, setTutorConcept] = useState<string>('');
  const [tutorVoice, setTutorVoice] = useState<string>('matthew');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const controls: ControlBarControls = {
    leave: true,
    microphone: true,
    chat: appConfig.supportsChatInput,
    camera: appConfig.supportsVideoInput,
    screenShare: appConfig.supportsVideoInput,
  };

  // Parse messages to detect tutor mode changes
  useEffect(() => {
    const lastMessage = messages.at(-1);
    if (lastMessage?.content) {
      const content = lastMessage.content.toLowerCase();
      
      // Detect mode switches - more aggressive matching
      if (content.includes('learn') && !content.includes('learning')) {
        setTutorMode('learn');
      }
      if (content.includes('quiz')) {
        setTutorMode('quiz');
      }
      if (content.includes('teach') || content.includes('explain')) {
        setTutorMode('teach_back');
      }
      
      // Detect voice switches
      if (content.includes('matthew')) setTutorVoice('matthew');
      if (content.includes('alicia')) setTutorVoice('alicia');
      if (content.includes('ken')) setTutorVoice('ken');
      
      // Detect concept mentions - case insensitive
      const concepts = ['variables', 'loops', 'functions', 'arrays', 'conditionals'];
      for (const concept of concepts) {
        if (content.includes(concept)) {
          setTutorConcept(concept);
          break;
        }
      }
    }
  }, [messages]);

  useEffect(() => {
    const lastMessage = messages.at(-1);
    const lastMessageIsLocal = lastMessage?.from?.isLocal === true;

    if (scrollAreaRef.current && lastMessageIsLocal) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'learn':
        return 'bg-blue-500/20 border-blue-500';
      case 'quiz':
        return 'bg-amber-500/20 border-amber-500';
      case 'teach_back':
        return 'bg-green-500/20 border-green-500';
      default:
        return 'bg-purple-500/20 border-purple-500';
    }
  };

  const getModeEmoji = (mode: string) => {
    switch (mode) {
      case 'learn':
        return '📖';
      case 'quiz':
        return '❓';
      case 'teach_back':
        return '💬';
      default:
        return '🎯';
    }
  };

  const getVoiceEmoji = (voice: string) => {
    if (voice.includes('alicia')) return '👩‍💼';
    if (voice.includes('ken')) return '👨‍💻';
    return '👨‍🏫';
  };

  const getVoiceName = (voice: string) => {
    if (voice.includes('alicia')) return 'Alicia';
    if (voice.includes('ken')) return 'Ken';
    return 'Matthew';
  };

  return (
    <section className="bg-background relative z-10 h-full w-full overflow-hidden" {...props}>
      {/* Tutor Status Bar */}
      {tutorMode !== 'select' && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-linear-to-r from-slate-900/95 to-blue-900/95 border-b border-blue-500/30 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Mode Badge */}
              <div className={`px-3 py-1 rounded-full border ${getModeColor(tutorMode)} flex items-center gap-2`}>
                <span className="text-lg">{getModeEmoji(tutorMode)}</span>
                <span className="text-white font-semibold text-sm capitalize">
                  {tutorMode === 'teach_back' ? 'Teach Back' : tutorMode}
                </span>
              </div>

              {/* Concept Badge */}
              {tutorConcept && (
                <div className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500 text-white font-semibold text-sm capitalize">
                  📚 {tutorConcept}
                </div>
              )}

              {/* Voice Badge */}
              <div className="px-3 py-1 rounded-full bg-pink-500/20 border border-pink-500 text-white font-semibold text-sm flex items-center gap-1">
                <span>{getVoiceEmoji(tutorVoice)}</span>
                <span>{getVoiceName(tutorVoice)}</span>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-300">Active</span>
            </div>
          </div>
        </div>
      )}

      {/* Chat Transcript - with offset for status bar */}
      <div
        className={cn(
          'fixed inset-0 grid grid-cols-1 grid-rows-1',
          !chatOpen && 'pointer-events-none',
          tutorMode !== 'select' && 'top-16'
        )}
      >
        <Fade top className="absolute inset-x-4 top-0 h-40" />
        <ScrollArea ref={scrollAreaRef} className="px-4 pt-40 pb-[150px] md:px-6 md:pb-[180px]">
          <ChatTranscript
            hidden={!chatOpen}
            messages={messages}
            className="mx-auto max-w-2xl space-y-3 transition-opacity duration-300 ease-out"
          />
        </ScrollArea>
      </div>

      {/* Tile Layout */}
      <TileLayout chatOpen={chatOpen} />

      {/* Bottom */}
      <MotionBottom
        {...BOTTOM_VIEW_MOTION_PROPS}
        className="fixed inset-x-3 bottom-0 z-50 md:inset-x-12"
      >
        {appConfig.isPreConnectBufferEnabled && (
          <PreConnectMessage messages={messages} className="pb-4" />
        )}
        <div className="bg-background relative mx-auto max-w-2xl pb-3 md:pb-12">
          <Fade bottom className="absolute inset-x-0 top-0 h-4 -translate-y-full" />
          <AgentControlBar controls={controls} />
        </div>
      </MotionBottom>
    </section>
  );
};
