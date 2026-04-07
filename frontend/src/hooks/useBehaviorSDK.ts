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

interface MouseMoveEvent {
  x: number;
  y: number;
  timestamp: number;
}

// Simple device fingerprint based on browser properties
function computeDeviceFingerprint(): string {
  const parts = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 0,
  ];
  // Simple hash
  let hash = 0;
  const str = parts.join('|');
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'fp_' + Math.abs(hash).toString(16);
}

function detectDeviceClass(): 'mobile' | 'desktop' {
  const maxTouch = navigator.maxTouchPoints || 0;
  const hasTouchScreen = maxTouch > 0;
  const isMobileUA = /Android|iPhone|iPad|iPod|webOS|BlackBerry/i.test(navigator.userAgent);
  return (hasTouchScreen && isMobileUA) ? 'mobile' : 'desktop';
}

export const useBehaviorSDK = (userId: number, sessionId: string | null) => {
  const [currentScore, setCurrentScore] = useState<number | null>(null);
  const [riskLevel, setRiskLevel] = useState<string>('LOW');
  const [action, setAction] = useState<string>('ALLOW');
  const [anomalies, setAnomalies] = useState<string[]>([]);

  const eventsRef = useRef<{
    keyEvents: KeyEvent[];
    clickEvents: ClickEvent[];
    mouseMoveEvents: MouseMoveEvent[];
    scrollWheelCount: number;
    screenLog: string[];
    startTime: number;
    lastEventTime: number;
    deviceClass: 'mobile' | 'desktop';
    deviceFingerprint: string;
  }>({
    keyEvents: [],
    clickEvents: [],
    mouseMoveEvents: [],
    scrollWheelCount: 0,
    screenLog: [],
    startTime: Date.now(),
    lastEventTime: Date.now(),
    deviceClass: detectDeviceClass(),
    deviceFingerprint: computeDeviceFingerprint(),
  });


  useEffect(() => {
    if (!sessionId) return;

    const extractFeatures = () => {
      const events = eventsRef.current;
      if (events.keyEvents.length < 2 && events.clickEvents.length < 2) return null;

      const now = Date.now();
      const duration = now - events.startTime;
      const isDesktop = events.deviceClass === 'desktop';

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

      // 2. Touch/Click Dynamics
      const clicks = events.clickEvents;
      const click_speeds: number[] = [];
      for (let i = 1; i < clicks.length; i++) {
          click_speeds.push(clicks[i].timestamp - clicks[i-1].timestamp);
      }
      const click_speed_mean = click_speeds.length ? click_speeds.reduce((a, b) => a + b) / click_speeds.length : 400;

      // 3. Mouse biometrics (desktop only)
      let mouseEntropy = 0.0;
      let mouseSpeedCV = 0.0;
      if (isDesktop && events.mouseMoveEvents.length > 2) {
          const moves = events.mouseMoveEvents;
          const speeds: number[] = [];
          for (let i = 1; i < moves.length; i++) {
              const dx = moves[i].x - moves[i-1].x;
              const dy = moves[i].y - moves[i-1].y;
              const dt = (moves[i].timestamp - moves[i-1].timestamp) || 1;
              speeds.push(Math.sqrt(dx*dx + dy*dy) / dt);
          }
          if (speeds.length > 0) {
              const meanSpeed = speeds.reduce((a,b) => a+b) / speeds.length;
              const stdSpeed = Math.sqrt(speeds.reduce((a,b) => a + (b-meanSpeed)**2, 0) / speeds.length);
              mouseSpeedCV = meanSpeed > 0 ? stdSpeed / meanSpeed : 0;
              // Simple entropy estimate from direction changes
              let dirChanges = 0;
              for (let i = 2; i < moves.length; i++) {
                  const dx1 = moves[i-1].x - moves[i-2].x;
                  const dy1 = moves[i-1].y - moves[i-2].y;
                  const dx2 = moves[i].x - moves[i-1].x;
                  const dy2 = moves[i].y - moves[i-1].y;
                  if ((dx1 * dx2 + dy1 * dy2) < 0) dirChanges++;
              }
              mouseEntropy = moves.length > 2 ? dirChanges / (moves.length - 2) : 0;
          }
      }

      // Construct 55-feature snapshot (aligned with backend feature_schema.py)
      const snapshot: Record<string, number> = {
          // Touch Dynamics (8)
          "tap_pressure_mean": isDesktop ? 0 : 0.5 + Math.random() * 0.2,
          "tap_pressure_std": isDesktop ? 0 : 0.05 + Math.random() * 0.02,
          "swipe_velocity_mean": isDesktop ? 0 : 450 + Math.random() * 50,
          "swipe_velocity_std": isDesktop ? 0 : 50 + Math.random() * 10,
          "gesture_curvature_mean": isDesktop ? 0 : 0.12 + Math.random() * 0.05,
          "pinch_zoom_accel_mean": 0.0,
          "tap_duration_mean": isDesktop ? 0 : 85 + Math.random() * 10,
          "tap_duration_std": isDesktop ? 0 : 10 + Math.random() * 5,

          // Typing Biometrics (10)
          "inter_key_delay_mean": ikd_mean,
          "inter_key_delay_std": 25 + Math.random() * 5,
          "inter_key_delay_p95": ikd_mean * 1.5,
          "dwell_time_mean": dwell_mean,
          "dwell_time_std": 12 + Math.random() * 3,
          "error_rate": Math.random() * 0.05,
          "backspace_frequency": 2.1 + Math.random() * 0.5,
          "typing_burst_count": 4,
          "typing_burst_duration_mean": 2000 + Math.random() * 500,
          "words_per_minute": 38 + Math.random() * 5,

          // Device Motion (8) -- zeros on desktop
          "accel_x_std": isDesktop ? 0 : 0.01 + Math.random() * 0.01,
          "accel_y_std": isDesktop ? 0 : 0.011 + Math.random() * 0.01,
          "accel_z_std": isDesktop ? 0 : 0.012 + Math.random() * 0.01,
          "gyro_x_std": isDesktop ? 0 : 0.005,
          "gyro_y_std": isDesktop ? 0 : 0.006,
          "gyro_z_std": isDesktop ? 0 : 0.007,
          "device_tilt_mean": isDesktop ? 0 : 45 + Math.random() * 5,
          "hand_stability_score": isDesktop ? 0 : 0.82 + Math.random() * 0.05,

          // Navigation Graph (9)
          "screens_visited_count": events.screenLog.length || 1,
          "navigation_depth_max": 2,
          "back_navigation_count": 0,
          "time_on_dashboard_ms": duration / 2,
          "time_on_transfer_ms": duration / 4,
          "direct_to_transfer": 0,
          "form_field_order_entropy": 0.1,
          "session_revisit_count": 0,
          "exploratory_ratio": 0.08,

          // Temporal Behavior (8)
          "session_duration_ms": duration,
          "session_duration_z_score": 0.0,
          "time_of_day_hour": new Date().getHours(),
          "time_to_submit_otp_ms": 8500,
          "click_speed_mean": click_speed_mean,
          "click_speed_std": 120 + Math.random() * 20,
          "form_submit_speed_ms": duration,
          "interaction_pace_ratio": 1.0,

          // Device Context (4)
          "is_new_device": 0,
          "device_fingerprint_delta": 0.05,
          "timezone_changed": 0,
          "os_version_changed": 0,

          // Device Trust Context (5) -- server fills from DeviceRegistry
          "device_class_known": 0,
          "device_session_count": 0,
          "device_class_switch": 0,
          "is_known_fingerprint": 0,
          "time_since_last_seen_hours": 0,

          // Desktop Mouse Biometrics (3)
          "mouse_movement_entropy": mouseEntropy,
          "mouse_speed_cv": mouseSpeedCV,
          "scroll_wheel_event_count": events.scrollWheelCount,
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

    const handleMouseMove = (e: MouseEvent) => {
      // Sample every 50ms to avoid flooding
      const events_data = eventsRef.current;
      const last = events_data.mouseMoveEvents[events_data.mouseMoveEvents.length - 1];
      if (!last || (Date.now() - last.timestamp) > 50) {
        events_data.mouseMoveEvents.push({ x: e.clientX, y: e.clientY, timestamp: Date.now() });
        // Keep only last 200 events to limit memory
        if (events_data.mouseMoveEvents.length > 200) {
          events_data.mouseMoveEvents = events_data.mouseMoveEvents.slice(-200);
        }
      }
    };

    const handleWheel = () => {
      eventsRef.current.scrollWheelCount++;
    };

    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKey);
    window.addEventListener('click', handleClick);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('wheel', handleWheel);

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
    }, 6000);

    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('keyup', handleKey);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('wheel', handleWheel);
      clearInterval(interval);
    };
  }, [sessionId, userId]);

  const deviceClass = eventsRef.current.deviceClass;
  const deviceFingerprint = eventsRef.current.deviceFingerprint;

  return { currentScore, riskLevel, action, anomalies, deviceClass, deviceFingerprint };
};
