'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/livekit/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/livekit/alert';
import { ShieldCheckIcon, PhoneIcon, CreditCardIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export function FraudWelcomeView({ onStart }: { onStart: () => void }) {
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting'>('idle');

  const fraudCases = [
    {
      id: 'john-doe',
      name: 'John Doe',
      cardEnding: '4242',
      amount: 150.00,
      merchant: 'Amazon',
      time: '2 hours ago',
      location: 'New York, NY',
      risk: 'high'
    },
    {
      id: 'jane-smith',
      name: 'Jane Smith',
      cardEnding: '1234',
      amount: 25.50,
      merchant: 'Uber',
      time: '1 hour ago',
      location: 'San Francisco, CA',
      risk: 'medium'
    },
    {
      id: 'bob-johnson',
      name: 'Bob Johnson',
      cardEnding: '5678',
      amount: 5.75,
      merchant: 'Starbucks',
      time: '30 minutes ago',
      location: 'Chicago, IL',
      risk: 'low'
    },
  ];

  const handleCaseSelect = (caseId: string) => {
    setSelectedCase(caseId);
  };

  const handleStartCall = () => {
    if (selectedCase) {
      setCallStatus('connecting');
      setTimeout(() => {
        onStart();
      }, 2000);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <ShieldCheckIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">SecureBank Fraud Protection</h1>
                <p className="text-blue-200">Advanced Voice AI Fraud Detection</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm font-medium">System Active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alert Banner */}
        <Alert className="mb-8 bg-yellow-900/50 border-yellow-600 text-yellow-200">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Security Alert Active</AlertTitle>
          <AlertDescription>
            Our AI system has detected suspicious transactions. Voice verification required for security.
          </AlertDescription>
        </Alert>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Fraud Cases Panel */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <CreditCardIcon className="w-6 h-6 text-red-400" />
              <h2 className="text-xl font-semibold text-white">Suspicious Transactions</h2>
            </div>

            <div className="space-y-4">
              {fraudCases.map((case_) => (
                <div
                  key={case_.id}
                  className={`cursor-pointer rounded-lg border p-4 transition-all duration-200 ${
                    selectedCase === case_.id
                      ? 'border-red-400 bg-red-900/30 shadow-lg shadow-red-500/20'
                      : 'border-white/20 bg-white/5 hover:border-white/30 hover:bg-white/10'
                  }`}
                  onClick={() => handleCaseSelect(case_.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-white">{case_.name}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRiskColor(case_.risk)}`}>
                          {case_.risk.toUpperCase()} RISK
                        </span>
                      </div>
                      <div className="text-sm text-gray-300 space-y-1">
                        <p>Card ending in •••• {case_.cardEnding}</p>
                        <p>${case_.amount} at {case_.merchant}</p>
                        <p>{case_.time} • {case_.location}</p>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">${case_.amount}</div>
                        <div className="text-sm text-gray-400">{case_.time}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Call Panel */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <PhoneIcon className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Voice Verification</h2>
            </div>

            <div className="space-y-6">
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-3">Verification Process:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-300">
                  <li>Agent introduces as SecureBank fraud department</li>
                  <li>Identity verification with security question</li>
                  <li>Review suspicious transaction details</li>
                  <li>Confirm if transaction was authorized</li>
                  <li>Automatic case resolution and card protection</li>
                </ol>
              </div>

              {callStatus === 'connecting' && (
                <div className="bg-blue-900/50 border border-blue-600 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
                    <span className="text-blue-200">Connecting to fraud detection agent...</span>
                  </div>
                </div>
              )}

              <Button
                onClick={handleStartCall}
                disabled={!selectedCase || callStatus === 'connecting'}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                size="lg"
              >
                {callStatus === 'connecting' ? 'Connecting...' :
                 selectedCase ? 'Start Fraud Alert Call' : 'Select a case to investigate'}
              </Button>

              <div className="text-xs text-gray-400 text-center">
                <p>🔒 All conversations are encrypted and monitored for security</p>
                <p>📞 This is a demo system using AI voice technology</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
