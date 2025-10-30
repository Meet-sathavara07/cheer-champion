"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useInstantDB } from "@/app/context/InstantProvider";
import { useTranslation } from "react-i18next";
import moment from "moment";

// Define the type for a Kudo
export interface Kudo {
  id: string;
  kudo?: string; // Optional to prevent missing property errors
  $users?: any[]; // Optional array
  kudo_receiver?: any[];
  createdAt?: string;
}

// Test accounts to exclude from admin view
const TEST_EMAILS = [
  "raj.mansuri@quantuminfoway.com",
  "cp@cheerchampion.com",
  "mansuriraj1995@gmail.com",
];

const notTestEmail = TEST_EMAILS.map((email) => ({
  "$users.email": { $not: email },
}));

// Helper function to check if a kudo is from a test account
const isTestKudo = (kudo: any): boolean => {
  if (!kudo.$users || !Array.isArray(kudo.$users)) return false;
  return kudo.$users.some((user: any) => {
    const userEmail = user.email || user.user_profile?.email;
    return userEmail && TEST_EMAILS.includes(userEmail.toLowerCase());
  });
};

// Query builders for InstantDB
export const kudoQueries = {
  filterkudos: (cursor: any, startDate: Date | null, endDate: Date | null) => ({
    $: {
      order: { serverCreatedAt: "desc" },
      first: 15,
      after: cursor,
      where: {
        and: [
          startDate
            ? {
                created_at: {
                  $gte: moment(startDate).startOf("day").toISOString(),
                },
              }
            : {},
          endDate
            ? {
                created_at: {
                  $lte: moment(endDate).endOf("day").toISOString(),
                },
              }
            : {},
          // ...notTestEmail,
        ],
      },
    },
    kudo_receiver: {
      $users: {
        user_profile: {},
      },
    },
    $users: {
      user_profile: {},
    },
  }),
  searchKudos: (term: string, startDate: Date | null, endDate: Date | null) => {
    const searchTerm = term.toLowerCase().trim();
    return {
      $: {
        where: {
          and: [
            {
              created_at: {
                $gte: moment(startDate).startOf("day").toISOString(),
              },
            },
            {
              created_at: {
                $lte: moment(endDate).endOf("day").toISOString(),
              },
            },
            //  ...notTestEmail,
            {
              or: [
                {
                  "kudo_receiver.$users.user_profile.name": {
                    $like: `%${searchTerm}%`,
                  },
                },
                { "kudo_receiver.$users.email": { $like: `%${searchTerm}%` } },
                { "$users.user_profile.name": { $like: `%${searchTerm}%` } },
                { "$users.email": { $like: `%${searchTerm}%` } },
              ],
            },
          ],
        },
      },
      kudo_receiver: {
        $users: {
          user_profile: {},
        },
      },
      $users: {
        user_profile: {},
      },
    };
  },
};

// Default date range helpers
const defaultEnd = moment().endOf("day");
const defaultStart = moment(defaultEnd).subtract(1, "month").startOf("day");

export function useKudosListViewModel() {
  const [kudos, setKudos] = useState<Kudo[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<any>(defaultStart);
  const [endDate, setEndDate] = useState<any>(defaultEnd);
  const [mode, setMode] = useState<"all" | "filter" | "search">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { t } = useTranslation();
  const db = useInstantDB();

  // --- MVVM additions ---
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchTerm);
  const [previewKudo, setPreviewKudo] = useState<any | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Build query based on current state
  let query: any;
  if (searchTerm.trim()) {
    query = kudoQueries.searchKudos(searchTerm.trim(), startDate, endDate);
  } else {
    query = kudoQueries.filterkudos(cursor, startDate, endDate);
  }

  const { isLoading, data, pageInfo, error }: any = db.useQuery({
    kudos: query,
  });
  // For stats
  const { data: allKudosData } = db.useQuery({
    kudos: {
      $: { where: { and: [...notTestEmail] } },
      // $: {},
      kudo_receiver: {},
      $users: {},
    },
  });
  const totalKudos = (allKudosData?.kudos || []).length;
  const totalreceiver = (allKudosData?.kudos || []).length;

  const hasMore = mode === "search" ? false : pageInfo?.kudos?.hasNextPage;

  // Reset data when query parameters change
  useEffect(() => {
    setKudos([]);
    setCursor(null);
  }, [mode, searchTerm, startDate, endDate]);

  useEffect(() => {
    if (data?.kudos !== undefined) {
      // Additional client-side filtering to ensure test accounts are excluded
      const filteredKudos = data.kudos.filter((kudo: any) => !isTestKudo(kudo));
      if (cursor) {
        // Pagination: append new data, avoid duplicates
        setKudos((prev) => {
          const ids = new Set(prev.map((k) => k.id));
          const newKudos = filteredKudos.filter((k: any) => !ids.has(k.id));
          return [...prev, ...newKudos];
        });
      } else {
        setKudos(filteredKudos);
      }
    }
  }, [data?.kudos, cursor]);

  const loadMoreKudos = () => {
    if (hasMore && !isLoading && mode !== "search") {
      setCursor(pageInfo?.kudos?.endCursor || null);
    }
  };

  // Methods to switch modes and apply filter
  const showAllKudos = () => {
    setMode("all");
    setSearchTerm("");
  };

  const applyDateFilter = (start: Date, end: Date) => {
    setMode("filter");
    setStartDate(start);
    setEndDate(end);
    setSearchTerm("");
  };

  const applySearch =(term: string) => {
    const trimmedTerm = term.trim();
    if (trimmedTerm.length > 0) {
      setSearchTerm(trimmedTerm);
      setMode("search");
    }
  };

  // --- MVVM: Move UI logic/state from View to ViewModel ---
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
        // If search is empty, go back to previous mode (all or filter)
        if (mode === "search") {
          showAllKudos();
        }
      }
    }, 500);
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchInput, applySearch, showAllKudos, mode]);

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

  return {
    // Expose only what the View needs
    kudos,
    isLoading,
    hasMore,
    loadMoreKudos,
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
    showAllKudos,
    error,
    totalKudos,
    totalreceiver,
    defaultStart,
    defaultEnd,
    // MVVM additions:
    isCalendarOpen,
    setIsCalendarOpen,
    searchInput,
    setSearchInput,
    previewKudo,
    setPreviewKudo,
    isScrolled,
    calendarRef,
    handleSelect,
    handleReset,
    selectionRange,
  };
}
