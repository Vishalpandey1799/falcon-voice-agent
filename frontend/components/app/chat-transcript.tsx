'use client';

import { AnimatePresence, type HTMLMotionProps, motion } from 'motion/react';
import { type ReceivedChatMessage } from '@livekit/components-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChatEntry } from '@/components/livekit/chat-entry';
import OrderSummaryTable from '@/components/order/OrderSummaryTable';

const MotionContainer = motion.create('div');
const MotionChatEntry = motion.create(ChatEntry);

const CONTAINER_MOTION_PROPS = {
  variants: {
    hidden: {
      opacity: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
        staggerDirection: -1,
      },
    },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.2,
        duration: 0.3,
        staggerChildren: 0.1,
        staggerDirection: 1,
      },
    },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
};

const MESSAGE_MOTION_PROPS = {
  variants: {
    hidden: {
      opacity: 0,
      translateY: 10,
    },
    visible: {
      opacity: 1,
      translateY: 0,
    },
  },
};

interface ChatTranscriptProps {
  hidden?: boolean;
  messages?: ReceivedChatMessage[];
}

export function ChatTranscript({
  hidden = false,
  messages = [],
  ...props
}: ChatTranscriptProps & Omit<HTMLMotionProps<'div'>, 'ref'>) {
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [showOrderTable, setShowOrderTable] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);

  // Check if order completion message is present
  useEffect(() => {
    if (!messages || messages.length === 0 || showOrderTable) return;

    const lastMessage = messages[messages.length - 1];
    const messageText = lastMessage?.message?.toLowerCase() ?? '';

    // Detect order completion keywords
    if (
      messageText.includes('order placed successfully') ||
      messageText.includes('ready in 5 minutes') ||
      messageText.includes('coffee will be ready')
    ) {
      // Fetch the order data from the API
      fetchOrder();
    }
  }, [messages, showOrderTable]);

  // Auto-redirect when order is shown
  useEffect(() => {
    if (showOrderTable && order && !hasRedirected) {
      setHasRedirected(true);
      const redirectTimer = setTimeout(() => {
        console.log('Auto-redirecting to /order-complete...');
        router.push('/order-complete');
      }, 2000);

      return () => clearTimeout(redirectTimer);
    }
  }, [showOrderTable, order, hasRedirected, router]);

  const fetchOrder = async () => {
    try {
      const res = await fetch('/api/order-summary');
      if (res.ok) {
        const data = await res.json();
        console.log('Order fetched:', data);
        setOrder(data);
        setShowOrderTable(true);
      } else {
        console.warn('Failed to fetch order, status:', res.status);
      }
    } catch (error) {
      console.error('Failed to fetch order:', error);
    }
  };

  return (
    <AnimatePresence>
      {!hidden && (
        <MotionContainer {...CONTAINER_MOTION_PROPS} {...props}>
          {messages.map(({ id, timestamp, from, message, editTimestamp }: ReceivedChatMessage) => {
            const locale = navigator?.language ?? 'en-US';
            const messageOrigin = from?.isLocal ? 'local' : 'remote';
            const hasBeenEdited = !!editTimestamp;

            return (
              <MotionChatEntry
                key={id}
                locale={locale}
                timestamp={timestamp}
                message={message}
                messageOrigin={messageOrigin}
                hasBeenEdited={hasBeenEdited}
                {...MESSAGE_MOTION_PROPS}
              />
            );
          })}
          {/* Show order summary table after order is placed */}
          {showOrderTable && order && (
            <motion.div
              key="order-summary"
              variants={{
                hidden: { opacity: 0, translateY: 10 },
                visible: { opacity: 1, translateY: 0 },
              }}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.5, duration: 0.4 }}
              className="mt-6"
            >
              <OrderSummaryTable order={order} />
            </motion.div>
          )}
        </MotionContainer>
      )}
    </AnimatePresence>
  );
}
