'use client';

import React, { useState, useRef, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  message: string;
  doctorType?: string;
  searchQuery?: string;
  timestamp: Date;
}

export default function DocBotPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => {
    if (typeof window === 'undefined') {
      return 'session_server';
    }
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add welcome message
    setMessages([{
      id: 'welcome',
      type: 'bot',
      message: `Hi! I'm DocBot, your AI healthcare assistant. I can help you find the right type of doctor based on your symptoms. 

What symptoms or health concerns are you experiencing?`,
      timestamp: new Date()
    }]);
  }, []);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      message: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5001/api/docbot/chat', {
        message: inputMessage.trim(),
        sessionId
      });

      const botMessage: ChatMessage = {
        id: `bot_${Date.now()}`,
        type: 'bot',
        message: response.data.message,
        doctorType: response.data.doctorType,
        searchQuery: response.data.searchQuery,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('DocBot error:', error);
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        type: 'bot',
        message: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleBookAppointment = (doctorType: string, searchQuery: string) => {
    const searchUrl = `/search?type=doctor&query=${encodeURIComponent(searchQuery)}&specialization=${encodeURIComponent(doctorType)}`;
    window.open(searchUrl, '_blank');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/">
                  <Button variant="ghost" size="sm">
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Back to Home
                  </Button>
                </Link>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <SparklesIcon className="w-6 h-6 text-primary-500" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">DocBot</h1>
                    <p className="text-sm text-gray-500">AI Healthcare Assistant</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="h-[600px] flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 ${
                      message.type === 'user'
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.message}</div>
                    
                    {message.type === 'bot' && message.doctorType && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Recommended: {message.doctorType}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Disclaimer: This is an AI recommendation only. Consult a licensed doctor before taking action.
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleBookAppointment(message.doctorType!, message.searchQuery!)}
                            className="ml-3"
                          >
                            Book Now
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
                      <span className="text-gray-600">DocBot is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 border-t border-gray-200">
              <div className="flex space-x-3">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Describe your symptoms..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  size="md"
                >
                  <PaperAirplaneIcon className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                DocBot provides recommendations only. Always consult a licensed doctor for medical advice.
              </p>
            </div>
          </Card>

          {/* Info Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ChatBubbleLeftRightIcon className="w-6 h-6 text-primary-500" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">AI-Powered</h3>
                <p className="text-sm text-gray-600">
                  Advanced AI analyzes your symptoms to recommend the right specialist.
                </p>
              </div>
            </Card>

            <Card>
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <SparklesIcon className="w-6 h-6 text-secondary-500" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Verified Doctors</h3>
                <p className="text-sm text-gray-600">
                  Connect with verified healthcare professionals in your area.
                </p>
              </div>
            </Card>

            <Card>
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Safe & Secure</h3>
                <p className="text-sm text-gray-600">
                  Your conversations are private and secure. No medical advice provided.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
