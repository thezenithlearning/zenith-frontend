'use client';

import { useEffect } from 'react';
import { API_BASE_URL } from '../../services/baseApi';

const VID_KEY = 'zenith_vid';
const IGNORED = /^\/(dashboard|login|register|forgot-password|reset-password)(\/|$)/;

const getVisitorId = (): string | undefined => {
  try {
    let id = localStorage.getItem(VID_KEY);
    if (!id || !/^[A-Za-z0-9_-]{16,64}$/.test(id)) {
      id =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(VID_KEY, id);
    }
    return id;
  } catch {
    return undefined; // storage blocked → server falls back to a per-day fingerprint
  }
};

// Guards React strict-mode double effects within a single page load.
let sentThisLoad = false;

/**
 * Records one visit every time the site is opened or reloaded (client-side
 * navigation between pages does not add visits). Counts immediately on
 * arrival (time on site is irrelevant) and skips only admin/auth pages; the
 * server filters bots and counts unique visitors once per day separately.
 */
export default function VisitTracker() {
  useEffect(() => {
    if (sentThisLoad) return;

    const path = window.location.pathname;
    if (IGNORED.test(path)) return;

    const send = () => {
      if (sentThisLoad) return;
      sentThisLoad = true;

      const referrer =
        document.referrer && !document.referrer.startsWith(window.location.origin) ? document.referrer : undefined;

      fetch(`${API_BASE_URL}/track/visit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vid: getVisitorId(), path, referrer }),
        keepalive: true,
        credentials: 'omit',
      }).catch(() => {
        /* tracking must never affect the page */
      });
    };

    send();
  }, []);

  return null;
}
