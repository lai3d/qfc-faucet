import fs from 'fs';
import path from 'path';

const COOLDOWN_HOURS = parseInt(process.env.COOLDOWN_HOURS || '24', 10);
const DATA_FILE = path.join(process.cwd(), 'data', 'requests.json');

interface RequestRecord {
  address: string;
  timestamp: number;
  ip?: string;
}

function loadData(): RequestRecord[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch {
    // Ignore errors, return empty array
  }
  return [];
}

function saveData(records: RequestRecord[]): void {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2));
  } catch (error) {
    console.error('Failed to save rate limit data:', error);
  }
}

export function canRequest(address: string): { allowed: boolean; remainingTime?: number } {
  const records = loadData();
  const now = Date.now();
  const cooldownMs = COOLDOWN_HOURS * 60 * 60 * 1000;

  const normalizedAddress = address.toLowerCase();
  const lastRequest = records.find(
    (r) => r.address.toLowerCase() === normalizedAddress
  );

  if (lastRequest) {
    const elapsed = now - lastRequest.timestamp;
    if (elapsed < cooldownMs) {
      const remainingMs = cooldownMs - elapsed;
      const remainingHours = Math.ceil(remainingMs / (60 * 60 * 1000));
      return { allowed: false, remainingTime: remainingHours };
    }
  }

  return { allowed: true };
}

export function recordRequest(address: string, ip?: string): void {
  const records = loadData();
  const now = Date.now();
  const cooldownMs = COOLDOWN_HOURS * 60 * 60 * 1000;

  // Remove old records (older than cooldown period)
  const validRecords = records.filter((r) => now - r.timestamp < cooldownMs);

  // Remove existing record for this address if any
  const normalizedAddress = address.toLowerCase();
  const filteredRecords = validRecords.filter(
    (r) => r.address.toLowerCase() !== normalizedAddress
  );

  // Add new record
  filteredRecords.push({
    address: normalizedAddress,
    timestamp: now,
    ip,
  });

  saveData(filteredRecords);
}

export function getRecentRequests(): { address: string; timestamp: number }[] {
  const records = loadData();
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  return records
    .filter((r) => now - r.timestamp < oneDay)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 10)
    .map((r) => ({
      address: r.address,
      timestamp: r.timestamp,
    }));
}

export function getCooldownHours(): number {
  return COOLDOWN_HOURS;
}
