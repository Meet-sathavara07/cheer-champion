"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import moment from "moment";
import toast from "react-hot-toast";
import { useInstantDB } from "@/app/context/InstantProvider";

// Test accounts to exclude from admin view
const TEST_EMAILS = ["raj.mansuri@quantuminfoway.com", "cp@cheerchampion.com"];

// Helper function to check if an announcement is from a test account
const isTestAnnouncement = (announcement: any): boolean => {
  if (!announcement.$users || !Array.isArray(announcement.$users)) return false;
  return announcement.$users.some((user: any) => {
    const userEmail = user.email || user.user_profile?.email;
    return userEmail && TEST_EMAILS.includes(userEmail.toLowerCase());
  });
};

// Query builders for InstantDB
export const announcementQueries = {
  filterAnnouncements: (
    cursor: string | null,
    startDate: Date | null,
    endDate: Date | null
  ) => ({
    $: {
      order: { created_at: "desc" },
      first: 15,
      after: cursor,
      // where: {
      //   and: [
      //     startDate
      //       ? {
      //           created_at: {
      //             $gte: moment(startDate).startOf("day").toISOString(),
      //           },
      //         }
      //       : {},
      //     endDate
      //       ? {
      //           created_at: {
      //             $lte: moment(endDate).endOf("day").toISOString(),
      //           },
      //         }
      //       : {},
      //   ],
      // },
    },
    $users: {
      user_profile: {},
    },
  }),
  searchAnnouncements: (
    term: string,
    startDate: Date | null,
    endDate: Date | null
  ) => {
    const searchTerm = term.toLowerCase().trim();
    return {
      $: {
        // where: {
        //   and: [
        //     startDate
        //       ? {
        //           created_at: {
        //             $gte: moment(startDate).startOf("day").toISOString(),
        //           },
        //         }
        //       : {},
        //     endDate
        //       ? {
        //           created_at: {
        //             $lte: moment(endDate).endOf("day").toISOString(),
        //           },
        //         }
        //       : {},
        //     {
        //       or: [
        //         { title: { $like: `%${searchTerm}%` } },
        //         { message: { $like: `%${searchTerm}%` } },
        //       ],
        //     },
        //   ],
        // },
      },
      $users: {
        user_profile: {},
      },
    };
  },
};

// Default date range
const defaultEnd = moment().endOf("day");
const defaultStart = moment(defaultEnd).subtract(30, "day").startOf("day");
console.log("Time", defaultStart, defaultEnd);
export const useAnnouncementsListViewModel = () => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [cursor, setCursor] = useState<any | null>(null);
  const [startDate, setStartDate] = useState<any>(defaultStart);
  const [endDate, setEndDate] = useState<any>(defaultEnd);
  const [mode, setMode] = useState<"all" | "filter" | "search">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { t } = useTranslation();
  const db = useInstantDB();
  const pathname = usePathname();
  const calendarRef = useRef<HTMLDivElement>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchTerm);
  const [showModal, setShowModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Build query based on current state
  let query: any;
  if (searchTerm.trim()) {
    query = announcementQueries.searchAnnouncements(
      searchTerm.trim(),
      startDate,
      endDate
    );
  } else {
    query = announcementQueries.filterAnnouncements(cursor, startDate, endDate);
  }

  const { isLoading, data, pageInfo, error } = db.useQuery({
    notifications: query,
  });

  // For stats
  const { data: allAnnouncementsData } = db.useQuery({
    notifications: {
      $: {},
    },
  });
  const totalAnnouncements = (allAnnouncementsData?.notifications || []).filter(
    (ann: any) => !isTestAnnouncement(ann)
  ).length;

  const hasMore =
    mode === "search" ? false : pageInfo?.notifications?.hasNextPage ?? false;

  // Reset data when query parameters change
  useEffect(() => {
    setAnnouncements([]);
    setCursor(null);
  }, [mode, searchTerm, startDate, endDate]);

  // Filter announcements and update state
  useEffect(() => {
    if (data?.notifications !== undefined) {
      const filteredAnnouncements = data.notifications.filter(
        (ann: any) => !isTestAnnouncement(ann)
      );
      if (cursor) {
        setAnnouncements((prev) => {
          const ids = new Set(prev.map((a) => a.id));
          const newAnnouncements = filteredAnnouncements.filter(
            (a: any) => !ids.has(a.id)
          );
          return [...prev, ...newAnnouncements];
        });
      } else {
        setAnnouncements(filteredAnnouncements);
      }
    }
  }, [data?.notifications, cursor]);

  const loadMoreAnnouncements = useCallback(() => {
    if (hasMore && !isLoading && mode !== "search") {
      setCursor(pageInfo?.notifications?.endCursor ?? null);
    }
  }, [hasMore, isLoading, mode, pageInfo?.notifications?.endCursor]);

  // Methods to switch modes and apply filter
  const showAllAnnouncements = useCallback(() => {
    setMode("all");
    setSearchTerm("");
  }, []);

  const applyDateFilter = useCallback((start: Date, end: Date) => {
    setMode("filter");
    setStartDate(start);
    setEndDate(end);
    setSearchTerm("");
  }, []);

  const applySearch = useCallback((term: string) => {
    const trimmedTerm = term.trim();
    if (trimmedTerm.length > 0) {
      setSearchTerm(trimmedTerm);
      setMode("search");
    }
  }, []);

  // Debounced search input
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    searchTimeout.current = setTimeout(() => {
      const trimmedInput = searchInput.trim();
      if (trimmedInput.length > 0) {
        applySearch(trimmedInput);
      } else if (mode === "search") {
        showAllAnnouncements();
      }
    }, 500);
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchInput, applySearch, showAllAnnouncements, mode]);

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
  };

  // Date range for picker
  const selectionRange = {
    startDate: startDate || new Date(),
    endDate: endDate || startDate || new Date(),
    key: "selection",
  };


  const handleEdit = (announcement: any) => {
    setSelectedAnnouncement(announcement);
    setShowModal(true);
  };

  return {
    key: pathname,
    announcements,
    isLoading,
    hasMore,
    loadMoreAnnouncements,
    t,
    mode,
    startDate,
    endDate,
    searchTerm,
    setSearchTerm,
    applyDateFilter,
    applySearch,
    showAllAnnouncements,
    error,
    totalAnnouncements,
    isCalendarOpen,
    setIsCalendarOpen,
    searchInput,
    setSearchInput,
    showModal,
    setShowModal,
    selectedAnnouncement,
    isScrolled,
    calendarRef,
    handleSelect,
    handleReset,
    selectionRange,
    
    handleEdit,
    setMode,
  };
};
