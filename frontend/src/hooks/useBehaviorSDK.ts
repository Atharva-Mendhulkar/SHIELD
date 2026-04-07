import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import type { ScoreResponse } from '../types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

interface KeyEvent {
  type: string;
  key: string;
  timestamp: number;
}

interface ClickEvent {
  x: number;
  y: number;
  timestamp: number;
}

export const useBehaviorSDK = (userId: number, sessionId: string | null) => {
  const [currentScore, setCurrentScore] = useState<number | null>(null);
  const [riskLevel, setRiskLevel] = useState<string>('LOW');
  const [action, setAction] = useState<string>('ALLOW');
  const [anomalies, setAnomalies] = useState<string[]>([]);
  
  const eventsRef = useRef<{
    keyEvents: KeyEvent[];
    clickEvents: ClickEvent[];
    screenLog: string[];
    startTime: number;
    lastEventTime: number;
  }>({
    keyEvents: [],
    clickEvents: [],
    screenLog: [],
    startTime: Date.now(),
    lastEventTime: Date.now()
  });


  useEffect(() => {
    if (!sessionId) return;

    const extractFeatures = () => {
      const events = eventsRef.current;
      if (events.keyEvents.length < 2 && events.clickEvents.length < 2) return null;

      const now = Date.now();
      const duration = now - events.startTime;

      // 1. Typing Biometrics
      const keys = events.keyEvents;
      const ikds: number[] = [];
      const dwells: number[] = [];
      for (let i = 1; i < keys.length; i++) {
          if (keys[i].type === 'keydown' && keys[i-1].type === 'keydown') {
              ikds.push(keys[i].timestamp - keys[i-1].timestamp);
          }
          if (keys[i].type === 'keyup') {
              const down = keys.slice(0, i).reverse().find(k => k.type === 'keydown' && k.key === keys[i].key);
              if (down) dwells.push(keys[i].timestamp - down.timestamp);
          }
      }

      const ikd_mean = ikds.length ? ikds.reduce((a, b) => a + b) / ikds.length : 180;
      const dwell_mean = dwells.length ? dwells.reduce((a, b) => a + b) / dwells.length : 95;

      // 2. Touch (Click) Dynamics
      const clicks = events.clickEvents;
      const click_speeds: number[] = [];
      for (let i = 1; i < clicks.length; i++) {
          click_speeds.push(clicks[i].timestamp - clicks[i-1].timestamp);
      }
      const click_speed_mean = click_speeds.length ? click_speeds.reduce((a, b) => a + b) / click_speeds.length : 400;

      // Construct the 47-feature snapshot (simplified for demo but structurally correct)
      const snapshot: Record<string, number> = {
          "inter_key_delay_mean": ikd_mean,
          "dwell_time_mean": dwell_mean,
          "click_speed_mean": click_speed_mean,
          "session_duration_ms": duration,
          "error_rate": Math.random() * 0.05,
          "hand_stability_score": 0.8 + Math.random() * 0.1,
          "swipe_velocity_mean": 450 + Math.random() * 50,
          "is_new_device": 0,
          "device_fingerprint_delta": 0.05,
          "user_id_context": userId
      };

      return snapshot;
    };

    const handleKey = (e: KeyboardEvent) => {
      eventsRef.current.keyEvents.push({ type: e.type, key: e.key, timestamp: Date.now() });
      eventsRef.current.lastEventTime = Date.now();
    };
    
    const handleClick = (e: MouseEvent) => {
      eventsRef.current.clickEvents.push({ x: e.clientX, y: e.clientY, timestamp: Date.now() });
      eventsRef.current.lastEventTime = Date.now();
    };

    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKey);
    window.addEventListener('click', handleClick);

    const interval = setInterval(async () => {
      const snapshot = extractFeatures();
      if (snapshot) {
        try {
          const response = await axios.post<ScoreResponse>(`${BACKEND_URL}/session/feature`, {
            session_id: sessionId,
            feature_snapshot: snapshot
          });
          
          setCurrentScore(response.data.score);
          setRiskLevel(response.data.risk_level);
          setAction(response.data.action);
          setAnomalies(response.data.top_anomalies);
        } catch (error) {
          console.error("SDK Telemetry Failed", error);
        }
      }
    }, 5000); // Send every 5s

    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('keyup', handleKey);
      window.removeEventListener('click', handleClick);
      clearInterval(interval);
    };
  }, [sessionId, userId]);

  return { currentScore, riskLevel, action, anomalies };
};
