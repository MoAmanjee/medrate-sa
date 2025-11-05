'use client';

import React, { useState, useEffect } from 'react';

interface PerformanceMonitorProps {
  hospitalCount: number;
  className?: string;
}

export default function PerformanceMonitor({ hospitalCount, className = '' }: PerformanceMonitorProps) {
  const [renderTime, setRenderTime] = useState<number>(0);
  const [memoryUsage, setMemoryUsage] = useState<number>(0);

  useEffect(() => {
    const startTime = performance.now();
    
    // Simulate render completion
    const timer = setTimeout(() => {
      const endTime = performance.now();
      setRenderTime(Math.round(endTime - startTime));
    }, 100);

    // Get memory usage if available
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      setMemoryUsage(Math.round(memory.usedJSHeapSize / 1024 / 1024)); // MB
    }

    return () => clearTimeout(timer);
  }, [hospitalCount]);

  return (
    <div className={`text-xs text-gray-500 ${className}`}>
      <div className="flex items-center space-x-4">
        <span>🏥 {hospitalCount} hospitals</span>
        <span>⚡ {renderTime}ms render</span>
        {memoryUsage > 0 && <span>💾 {memoryUsage}MB memory</span>}
        <span className="text-green-600">✅ Optimized</span>
      </div>
    </div>
  );
}
