'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import DocBot from './DocBot';
import {
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const DocBotSection: React.FC = () => {
  const [isDocBotOpen, setIsDocBotOpen] = useState(false);

  return (
    <>
      <section className="py-20 bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
              <SparklesIcon className="w-8 h-8 text-primary-500" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Not sure which doctor you need?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Ask <span className="font-semibold text-primary-500">DocBot</span> about your symptoms 
              to find the right specialist!
            </p>
            <Button
              onClick={() => setIsDocBotOpen(true)}
              size="lg"
              className="inline-flex items-center space-x-2"
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5" />
              <span>Chat with DocBot</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChatBubbleLeftRightIcon className="w-6 h-6 text-primary-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Recommendations</h3>
                <p className="text-gray-600">
                  DocBot analyzes your symptoms and suggests the most appropriate type of doctor for your needs.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserGroupIcon className="w-6 h-6 text-secondary-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Find Verified Specialists</h3>
                <p className="text-gray-600">
                  Get connected to verified doctors and specialists in your area with just a few clicks.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ClockIcon className="w-6 h-6 text-accent-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Booking</h3>
                <p className="text-gray-600">
                  Book appointments directly with recommended doctors through our secure platform.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">How DocBot Works</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <span>Describe your symptoms</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <span>Get AI recommendations</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  <span>Book with verified doctors</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 max-w-3xl mx-auto">
              <strong>Important:</strong> DocBot provides AI-powered recommendations only and cannot replace 
              professional medical advice. Always consult a licensed doctor for proper diagnosis and treatment.
            </p>
          </div>
        </div>
      </section>

      <DocBot isOpen={isDocBotOpen} onClose={() => setIsDocBotOpen(false)} />
    </>
  );
};

export default DocBotSection;
