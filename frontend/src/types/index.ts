export interface SessionStart {
  user_id: number;
  session_type: string;
  device_class?: string;
  device_fingerprint?: string;
}

export interface FeatureSnapshot {
  session_id: string;
  feature_snapshot: Record<string, number>;
}

export interface ScoreResponse {
  score: number;
  risk_level: string;
  action: string;
  top_anomalies: string[];
}

export interface FleetCheckRequest {
  device_fingerprint: string;
  user_id: number;
}

export interface FleetCheckResponse {
  fleet_anomaly: boolean;
  accounts_seen: number;
  affected_users: number[];
  action: string;
}

export interface ScenarioInfo {
  id: string;
  name: string;
  description: string;
  expected_score: number;
  expected_action: string;
  detection_time_s: number;
}

export interface ScenarioRunResponse {
  score_progression: number[];
  final_score: number;
  action: string;
  detection_time_s: number;
  top_anomalies: string[];
}

export interface SimSwapStatus {
  is_active: boolean;
  triggered_at: string | null;
  minutes_ago: number | null;
}
