export type StopType = "drive" | "charge" | "food" | "view" | "stay" | "other";
export type DayKey = "d5" | "d6" | "d7" | "d8";
export type TabKey = DayKey | "dash";

export interface Backup {
  name: string;
  query: string;
  note: string;
}

export interface CheckIn {
  ts: number;
  lat: number | null;
  lng: number | null;
}

export type LogKey =
  | "odo"
  | "socIn"
  | "socOut"
  | "kwh"
  | "costCharge"
  | "minutes"
  | "costFood"
  | "costOther"
  | "note";

export type StopLog = Partial<Record<LogKey, string>>;

export interface Stop {
  id: string;
  time: string;
  type: StopType;
  name: string;
  query: string;
  blurb: string;
  backups: Backup[];
  custom: boolean;
  checkin: CheckIn | null;
  log: StopLog;
}

export interface TripState {
  v: 1;
  updatedAt: number;
  days: Record<DayKey, Stop[]>;
}
