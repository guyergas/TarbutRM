"use client";

import { useState, useCallback, useEffect } from "react";

interface OrderCounts {
  userOrders: number;
  allOrders: number;
}

// Global state management for order counts
let countSubscribers: ((counts: OrderCounts) => void)[] = [];

export function notifyOrderCountsUpdated(counts: Partial<OrderCounts>) {
  countSubscribers.forEach((callback) => callback(counts as OrderCounts));
}

export function useOrderCounts(initialCounts: OrderCounts) {
  const [counts, setCounts] = useState(initialCounts);

  const updateCounts = useCallback((newCounts: Partial<OrderCounts>) => {
    setCounts((prev) => ({
      ...prev,
      ...newCounts,
    }));
  }, []);

  // Subscribe to updates on mount
  useEffect(() => {
    const callback = (newCounts: OrderCounts) => {
      setCounts(newCounts);
    };
    countSubscribers.push(callback);

    return () => {
      countSubscribers = countSubscribers.filter((cb) => cb !== callback);
    };
  }, []);

  return counts;
}
