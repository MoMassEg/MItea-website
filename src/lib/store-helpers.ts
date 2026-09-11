import { StoreLocation } from '@/data/menu-data';

export function computeStoreStatus(
  isOpenFlag: boolean,
  openingTimeStr: string,
  closingTimeStr: string,
  acceptsOrders: boolean = true
): { isOpen: boolean; openStatus: string } {
  if (!isOpenFlag || !acceptsOrders) {
    return { isOpen: false, openStatus: 'Closed' };
  }

  const parseTimeToMinutes = (timeStr: string): number | null => {
    const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return null;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const meridian = match[3].toUpperCase();
    if (meridian === 'PM' && hours !== 12) hours += 12;
    if (meridian === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const openMinutes = parseTimeToMinutes(openingTimeStr);
  const closeMinutes = parseTimeToMinutes(closingTimeStr);

  if (openMinutes === null || closeMinutes === null) {
    return { isOpen: isOpenFlag, openStatus: isOpenFlag ? 'Open now' : 'Closed' };
  }

  // Get current time in US Central Time (America/Chicago) for Minnesota store
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  });
  const parts = formatter.formatToParts(now);
  const curHour = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
  const curMin = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);
  const curTotalMinutes = curHour * 60 + curMin;

  const isWithinHours = curTotalMinutes >= openMinutes && curTotalMinutes < closeMinutes;

  if (!isWithinHours) {
    return {
      isOpen: false,
      openStatus: `Closed (Opens at ${openingTimeStr})`,
    };
  }

  if (closeMinutes - curTotalMinutes <= 30) {
    return {
      isOpen: true,
      openStatus: 'Closing soon',
    };
  }

  return {
    isOpen: true,
    openStatus: 'Open now',
  };
}

export interface AddressValidationResult {
  valid: boolean;
  distance: string;
  estimatedTime: string;
  reason?: string;
  deliveryFee: number;
}

// Supported zip codes in delivery radius (~5 miles around Golden Valley, MN)
const NEARBY_ZIPS: Record<string, { distance: string; estTime: string; fee: number }> = {
  // Golden Valley
  '55427': { distance: '1.2 mi', estTime: '20–30 min', fee: 2.99 },
  // Robbinsdale & Crystal
  '55422': { distance: '2.5 mi', estTime: '25–35 min', fee: 3.49 },
  // St. Louis Park
  '55416': { distance: '3.1 mi', estTime: '25–35 min', fee: 3.99 },
  '55426': { distance: '3.5 mi', estTime: '30–40 min', fee: 3.99 },
  // Plymouth
  '55441': { distance: '3.8 mi', estTime: '30–40 min', fee: 3.99 },
  '55442': { distance: '4.6 mi', estTime: '35–45 min', fee: 4.49 },
  // New Hope
  '55428': { distance: '3.2 mi', estTime: '30–40 min', fee: 3.49 },
  // West Minneapolis
  '55405': { distance: '3.9 mi', estTime: '30–40 min', fee: 4.49 },
  '55411': { distance: '4.2 mi', estTime: '35–45 min', fee: 4.49 },
};

export function validateDeliveryAddress(
  address: string,
  city: string,
  state: string,
  zip: string,
  maxRadiusMiles: number = 5.0
): AddressValidationResult {
  const normState = state.trim().toUpperCase();
  const isMinnesota = normState === 'MN' || normState === 'MINNESOTA';

  if (!isMinnesota) {
    return {
      valid: false,
      distance: 'N/A',
      estimatedTime: 'N/A',
      reason: 'Delivery is currently only available within the Twin Cities area (Minnesota).',
      deliveryFee: 0,
    };
  }

  const cleanZip = zip.trim().slice(0, 5);
  const normCity = city.trim().toLowerCase();

  // Direct match by zip
  if (NEARBY_ZIPS[cleanZip]) {
    const match = NEARBY_ZIPS[cleanZip];
    return {
      valid: true,
      distance: match.distance,
      estimatedTime: match.estTime,
      deliveryFee: match.fee,
    };
  }

  // City match fallback
  if (normCity.includes('golden valley')) {
    return {
      valid: true,
      distance: '1.5 mi',
      estimatedTime: '20–30 min',
      deliveryFee: 2.99,
    };
  }
  if (normCity.includes('robbinsdale') || normCity.includes('crystal') || normCity.includes('new hope')) {
    return {
      valid: true,
      distance: '3.0 mi',
      estimatedTime: '25–35 min',
      deliveryFee: 3.49,
    };
  }
  if (normCity.includes('st. louis park') || normCity.includes('saint louis park')) {
    return {
      valid: true,
      distance: '3.6 mi',
      estimatedTime: '30–40 min',
      deliveryFee: 3.99,
    };
  }
  if (normCity.includes('plymouth') || normCity.includes('minneapolis')) {
    return {
      valid: true,
      distance: '4.2 mi',
      estimatedTime: '35–45 min',
      deliveryFee: 4.49,
    };
  }

  return {
    valid: false,
    distance: '> 5.0 mi',
    estimatedTime: 'N/A',
    reason: `Address is outside our ${maxRadiusMiles}-mile delivery radius. Please select pickup or choose a closer address.`,
    deliveryFee: 0,
  };
}
