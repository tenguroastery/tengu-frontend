import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { bootstrapAnalytics, hasConsent, trackPageView } from '../lib/analytics';

export default function AnalyticsBootstrap() {
  const location = useLocation();

  useEffect(() => {
    if (hasConsent()) bootstrapAnalytics();
  }, []);

  useEffect(() => {
    if (hasConsent()) trackPageView(location.pathname + location.search);
  }, [location]);

  return null;
}
