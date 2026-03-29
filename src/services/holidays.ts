import { useState, useEffect, useCallback } from 'react';

// Types for holiday data
export interface PublicHoliday {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
  counties: string[];
  launchYear: number | null;
  types: string[];
}

export interface LongWeekend {
  startDate: string;
  endDate: string;
  dayCount: number;
  needBridgeDay: boolean;
  bridgeDays: string[];
}

export interface HolidaySearchParams {
  countryCode?: string;
  year?: number;
}

export interface HolidaySearchResponse {
  holidays: PublicHoliday[];
  year: number;
  countryCode: string;
  count: number;
  source: string;
}

export interface LongWeekendSearchResponse {
  longWeekends: LongWeekend[];
  year: number;
  countryCode: string;
  count: number;
  source: string;
}

// Cache for holiday data
const HOLIDAY_CACHE_KEY = 'balibuddy_holiday_cache';
const HOLIDAY_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

class HolidayService {
  // Get public holidays
  async getPublicHolidays(params: HolidaySearchParams = {}): Promise<HolidaySearchResponse> {
    const { countryCode = 'ID', year = new Date().getFullYear() } = params;
    
    try {
      const queryParams = new URLSearchParams({
        countryCode,
        year: year.toString()
      });
      
      const response = await fetch(`/api/holidays?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        holidays: data.holidays || [],
        year: data.year,
        countryCode: data.countryCode,
        count: data.count,
        source: data.source
      };
    } catch (error) {
      console.error('Holiday API error:', error);
      throw new Error('Failed to fetch holidays');
    }
  }

  // Get long weekends
  async getLongWeekends(params: HolidaySearchParams = {}): Promise<LongWeekendSearchResponse> {
    const { countryCode = 'ID', year = new Date().getFullYear() } = params;
    
    try {
      const queryParams = new URLSearchParams({
        countryCode,
        year: year.toString()
      });
      
      const response = await fetch(`/api/long-weekends?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        longWeekends: data.longWeekends || [],
        year: data.year,
        countryCode: data.countryCode,
        count: data.count,
        source: data.source
      };
    } catch (error) {
      console.error('Long weekends API error:', error);
      throw new Error('Failed to fetch long weekends');
    }
  }

  // Check if today is a public holiday
  async isTodayPublicHoliday(countryCode: string = 'ID'): Promise<boolean> {
    try {
      const response = await fetch(`/api/holidays/is-today?countryCode=${countryCode}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.isPublicHoliday || false;
    } catch (error) {
      console.error('Holiday check error:', error);
      return false;
    }
  }

  // Get next public holidays
  async getNextPublicHolidays(countryCode: string = 'ID'): Promise<PublicHoliday[]> {
    try {
      const response = await fetch(`/api/holidays/next?countryCode=${countryCode}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.holidays || [];
    } catch (error) {
      console.error('Next holidays error:', error);
      return [];
    }
  }

  // Get available countries
  async getAvailableCountries(): Promise<{ countryCode: string; name: string }[]> {
    try {
      const response = await fetch('/api/holidays/countries');
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.countries || [];
    } catch (error) {
      console.error('Countries error:', error);
      return [];
    }
  }

  // Cache holidays
  private cacheHolidays(holidays: PublicHoliday[], countryCode: string, year: number): void {
    try {
      const cacheData = {
        holidays,
        countryCode,
        year,
        timestamp: Date.now()
      };
      localStorage.setItem(HOLIDAY_CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to cache holidays:', error);
    }
  }

  // Get cached holidays
  private getCachedHolidays(): PublicHoliday[] | null {
    try {
      const cached = localStorage.getItem(HOLIDAY_CACHE_KEY);
      if (!cached) return null;

      const { holidays, timestamp } = JSON.parse(cached);
      
      if (Date.now() - timestamp > HOLIDAY_CACHE_DURATION) {
        localStorage.removeItem(HOLIDAY_CACHE_KEY);
        return null;
      }

      return holidays;
    } catch (error) {
      console.warn('Failed to load cached holidays:', error);
      return null;
    }
  }

  // Clear cache
  clearCache(): void {
    localStorage.removeItem(HOLIDAY_CACHE_KEY);
  }
}

// Singleton instance
export const holidayService = new HolidayService();

// React hook for holiday data
export function useHolidays() {
  const [holidays, setHolidays] = useState<PublicHoliday[]>([]);
  const [longWeekends, setLongWeekends] = useState<LongWeekend[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHolidays = useCallback(async (params: HolidaySearchParams = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const [holidayData, weekendData] = await Promise.all([
        holidayService.getPublicHolidays(params),
        holidayService.getLongWeekends(params)
      ]);

      setHolidays(holidayData.holidays);
      setLongWeekends(weekendData.longWeekends);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch holidays');
      setHolidays([]);
      setLongWeekends([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkTodayHoliday = useCallback(async (countryCode: string = 'ID') => {
    try {
      return await holidayService.isTodayPublicHoliday(countryCode);
    } catch (err) {
      console.error('Failed to check today holiday:', err);
      return false;
    }
  }, []);

  const getNextHolidays = useCallback(async (countryCode: string = 'ID') => {
    try {
      return await holidayService.getNextPublicHolidays(countryCode);
    } catch (err) {
      console.error('Failed to get next holidays:', err);
      return [];
    }
  }, []);

  const clearCache = useCallback(() => {
    holidayService.clearCache();
    setHolidays([]);
    setLongWeekends([]);
  }, []);

  return {
    holidays,
    longWeekends,
    isLoading,
    error,
    fetchHolidays,
    checkTodayHoliday,
    getNextHolidays,
    clearCache
  };
}

export default holidayService;