/**
 * Vercel KV (Redis) Cache Helper
 * Provides caching utilities using Vercel KV
 */

import { kv } from '@vercel/kv';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
}

/**
 * Get a value from cache
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      console.warn('Vercel KV not configured, skipping cache');
      return null;
    }

    const value = await kv.get<T>(key);
    return value;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

/**
 * Set a value in cache
 */
export async function setCache<T>(key: string, value: T, options?: CacheOptions): Promise<boolean> {
  try {
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      console.warn('Vercel KV not configured, skipping cache');
      return false;
    }

    await kv.set(key, value, { ex: options?.ttl });
    return true;
  } catch (error) {
    console.error('Cache set error:', error);
    return false;
  }
}

/**
 * Delete a value from cache
 */
export async function deleteCache(key: string): Promise<boolean> {
  try {
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      return false;
    }

    await kv.del(key);
    return true;
  } catch (error) {
    console.error('Cache delete error:', error);
    return false;
  }
}

/**
 * Invalidate cache by pattern
 */
export async function invalidatePattern(pattern: string): Promise<void> {
  try {
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      return;
    }

    const keys = await kv.keys(pattern);
    if (keys.length > 0) {
      await kv.del(...keys);
    }
  } catch (error) {
    console.error('Cache invalidate error:', error);
  }
}

/**
 * Cache wrapper for expensive operations
 */
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  options?: CacheOptions
): Promise<T> {
  // Try to get from cache first
  const cached = await getCache<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Execute the function
  const result = await fn();

  // Store in cache
  await setCache(key, result, options);

  return result;
}

/**
 * Cache keys for FisioFlow
 */
export const CacheKeys = {
  PATIENTS: 'patients:all',
  PATIENT: (id: string) => `patients:${id}`,
  APPOINTMENTS: 'appointments:all',
  APPOINTMENTS_DATE: (date: string) => `appointments:date:${date}`,
  EXERCISES: 'exercises:all',
  SESSIONS_PATIENT: (patientId: string) => `sessions:patient:${patientId}`,
  DASHBOARD_KPI: 'dashboard:kpi',
  TAGS: 'tags:all',
  STAFF: 'staff:all',
  STOCK: 'stock:all',
  TASKS: 'tasks:all',
  TRANSACTIONS: 'transactions:all',
  LEADS: 'leads:all',
} as const;
