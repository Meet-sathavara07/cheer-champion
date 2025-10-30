"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useInstantDB } from "@/app/context/InstantProvider";
import { useTranslation } from "react-i18next";
import moment from "moment";
import { notificationQueries } from "../models/kudoPostModel";

// Default date range helpers
const defaultEnd = moment().endOf("day");
const defaultStart = moment(defaultEnd).subtract(1, "month").startOf("day");

export function useNotificationsListViewModel() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<any>(defaultStart);
  const [endDate, setEndDate] = useState<any>(defaultEnd);
  const [mode, setMode] = useState<"all" | "filter" | "search">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "all" | "engagement" | "reminders" | "failed"
  >("all");
  const { t } = useTranslation();
  const db = useInstantDB();
  // MVVM additions
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchTerm);
  const [isScrolled, setIsScrolled] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Fetch counts for each notification type
  const allCount = db.useQuery(notificationQueries.counts.all());
  const engagementCount = db.useQuery(notificationQueries.counts.engagement());
  const openedCount = db.useQuery(notificationQueries.counts.opened());
  const failedCount = db.useQuery(notificationQueries.counts.failed());
  const nullChannelsCount = db.useQuery(
    notificationQueries.counts.noChannels()
  );
  // Compute stats based on count queries
  const stats = {
    total: allCount?.data?.notifications?.length || 0,
    engagement: engagementCount?.data?.notifications?.length || 0,
    reminders:
      (allCount?.data?.notifications?.length || 0) -
      (engagementCount?.data?.notifications?.length || 0),
    failed:
      (failedCount?.data?.notifications?.length || 0) +
      (nullChannelsCount?.data?.notifications?.length || 0),
    success: openedCount?.data?.notifications?.length || 0,
  };

  // Build query based on current state
  let query: any;
  if (searchTerm.trim()) {
    query = notificationQueries.search(searchTerm.trim(), startDate, endDate);
  } else {
    query = notificationQueries[activeFilter](cursor, startDate, endDate);
  }

  const { isLoading, data, pageInfo, error }: any = db.useQuery({
    notifications: query,
  });
  const hasMore =
    mode === "search" ? false : pageInfo?.notifications?.hasNextPage;

  // Reset data when query parameters change
  useEffect(() => {
    setNotifications([]);
    setCursor(null);
  }, [mode, searchTerm, startDate, endDate, activeFilter]);

  // Update notifications
  useEffect(() => {
    if (data?.notifications !== undefined) {
      if (cursor) {
        setNotifications((prev) => {
          const ids = new Set(prev.map((n) => n.id));
          const newNotifications = data.notifications.filter(
            (n: any) => !ids.has(n.id)
          );
          return [...prev, ...newNotifications];
        });
      } else {
        setNotifications(data.notifications || []);
      }
    }
  }, [data?.notifications, cursor]);

  const loadMoreNotifications = () => {
    if (hasMore && !isLoading && mode !== "search") {
      setCursor(pageInfo?.notifications?.endCursor || null);
    }
  };

  const showAllNotifications = () => {
    setMode("all");
    setSearchTerm("");
  };

  const applyDateFilter = (start: Date, end: Date) => {
    setMode("filter");
    setStartDate(start);
    setEndDate(end);
    setSearchTerm("");
  };

  const handleFilterChange = (
    filter: "all" | "engagement" | "reminders" | "failed"
  ) => {
    setActiveFilter(filter);
    if (mode === "search" && searchTerm.trim()) {
      // Keep search active, query will update automatically
    } else {
      setMode("all");
      setSearchTerm("");
    }
  };

  const applySearch = (term: string) => {
    const trimmedTerm = term.trim();
    if (trimmedTerm.length > 0) {
      setSearchTerm(trimmedTerm);
      setMode("search");
    }
  };

  // Debounced search input
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    searchTimeout.current = setTimeout(() => {
      const trimmedInput = searchInput.trim();
      if (trimmedInput.length > 0) {
        applySearch(trimmedInput);
      } else {
        if (mode === "search") {
          showAllNotifications();
        }
      }
    }, 500);
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchInput, applySearch, showAllNotifications, mode]);

  // Keep searchInput in sync with searchTerm
  useEffect(() => {
    setSearchInput(searchTerm);
  }, [searchTerm]);

  // Scroll state
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Calendar open/close on outside click
  useEffect(() => {
    if (!isCalendarOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setIsCalendarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isCalendarOpen]);

  // Date range selection handler
  const handleSelect = (ranges: any) => {
    const { startDate: newStart, endDate: newEnd } = ranges.selection;
    applyDateFilter(newStart, newEnd);
  };

  // Reset handler
  const handleReset = () => {
    setSearchInput("");
    setStartDate(defaultStart);
    setEndDate(defaultEnd);
    setMode("all");
    setSearchTerm("");
    setActiveFilter("all");
  };

  // Date range for picker
  const selectionRange = {
    startDate: startDate || new Date(),
    endDate: endDate || startDate || new Date(),
    key: "selection",
  };

  return {
    notifications,
    isLoading,
    hasMore,
    loadMoreNotifications,
    t,
    mode,
    startDate,
    endDate,
    searchTerm,
    setMode,
    setStartDate,
    setEndDate,
    setSearchTerm,
    applyDateFilter,
    applySearch,
    showAllNotifications,
    error,
    stats,
    isCalendarOpen,
    setIsCalendarOpen,
    searchInput,
    setSearchInput,
    isScrolled,
    calendarRef,
    handleSelect,
    handleReset,
    selectionRange,
    activeFilter,
    setActiveFilter: handleFilterChange,
  };
}
