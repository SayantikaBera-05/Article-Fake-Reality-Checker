/**
 * FraudDetection — SSE Stream Consumer Component
 * ────────────────────────────────────────────────
 * Connects to the backend SSE stream, receives real-time pipeline
 * stage events, and passes them to FraudDetectionLoading for display.
 *
 * The backend is the source of truth for timing — this component
 * simply reacts to events as they arrive.
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  fraudAPI,
  type FraudCheckPayload,
  type FraudResult,
  type FraudStageEvent,
  type FraudStreamEvent,
} from '../services/api';
import { FraudDetectionLoading } from './FraudDetectionLoading';

interface FraudDetectionProps {
  payload: FraudCheckPayload;
  onCompleted?: (result: FraudResult) => void;
  onError?: (message: string) => void;
}

export function FraudDetection({ payload, onCompleted, onError }: FraudDetectionProps) {
  const [stages, setStages] = useState<FraudStageEvent[]>([]);

  // Use refs for callbacks to avoid re-triggering the effect
  const onCompletedRef = useRef(onCompleted);
  const onErrorRef = useRef(onError);
  onCompletedRef.current = onCompleted;
  onErrorRef.current = onError;

  const handleEvent = useCallback((event: FraudStreamEvent) => {
    if (event.type === 'stage') {
      setStages((current) => {
        // Deduplicate stages by name
        if (current.some((s) => s.stage === event.stage)) return current;
        return [...current, event].sort((a, b) => a.sequence - b.sequence);
      });
      return;
    }

    if (event.type === 'completed') {
      onCompletedRef.current?.(event.result);
      return;
    }

    if (event.type === 'error') {
      onErrorRef.current?.(event.message);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setStages([]);

    fraudAPI
      .checkStream(payload, handleEvent, controller.signal)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        console.error('[FraudDetection] Stream error:', error);
        onErrorRef.current?.('Analysis failed. Please try again.');
      });

    return () => controller.abort();
  }, [payload, handleEvent]);

  return <FraudDetectionLoading stages={stages} />;
}
