'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import DocBot from './DocBot';
import ClientOnly from '@/components/ui/ClientOnly';
import { ChatBubbleLeftRightIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface DocBotButtonProps {
  variant?: 'floating' | 'inline';
  className?: string;
}

const DocBotButton: React.FC<DocBotButtonProps> = ({ variant = 'floating', className }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (variant === 'floating') {
    return (
      <ClientOnly>
        <Button
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-6 right-6 z-40 rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200 ${className}`}
          size="lg"
        >
          <ChatBubbleLeftRightIcon className="w-6 h-6" />
        </Button>
        <DocBot isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </ClientOnly>
    );
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className={`flex items-center space-x-2 ${className}`}
      >
        <SparklesIcon className="w-5 h-5" />
        <span>Ask DocBot</span>
      </Button>
      <DocBot isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default DocBotButton;
