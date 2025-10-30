"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useInstantDB } from "@/app/context/InstantProvider";
import { useTranslation } from "react-i18next";
import moment from "moment";

// Define the type for a User
export interface User {
  id: string;
  email?: string;
  user_profile?: {
    name?: string;
    email2?: string;
    email3?: string;
    role?: string;
    photo_url?: string;
    created_at?: string;
    $files?: {
      url?: string;
    };
  };
  kudos?: any[];
  kudo_receiver?: any[];
}

export const userQueries = {
  allUsers: (cursor: any) => ({
    $: {
      order: { serverCreatedAt: "desc" },
      first: 15,
      after: cursor,
    },
    user_profile: {
      $files: {},
    },
    kudos: {
      $: {
        order: { serverCreatedAt: "desc" },
        // first: 1,
      },
      $users: { user_profile: {} },
      kudo_receiver: { $users: { user_profile: {} } },
    },
    kudo_receiver: {},
  }),
  filterUsers: (cursor: any, startDate: Date | null, endDate: Date | null) => ({
    $: {
      order: { serverCreatedAt: "desc" },
      first: 15,
      after: cursor,
      where: {
        and: [
          startDate
            ? {
                "user_profile.created_at": {
                  $gte: moment(startDate).startOf("day").toISOString(),
                },
              }
            : {},
          endDate
            ? {
                "user_profile.created_at": {
                  $lte: moment(endDate).endOf("day").toISOString(),
                },
              }
            : {},
        ],
      },
    },
    user_profile: {
      $files: {},
    },
    kudos: {
      $: {
        order: { serverCreatedAt: "desc" },
        // first: 1,
      },
      $users: { user_profile: {} },
      kudo_receiver: { $users: { user_profile: {} } },
    },
    kudo_receiver: {},
  }),
  searchUsers: (term: string) => {
    const searchTerm = term.toLowerCase().trim();

    return {
      $: {
        where: {
          or: [
            { email: { $like: `%${searchTerm}%` } },
            { "user_profile.name": { $like: `%${searchTerm}%` } },
          ],
        },
      },
      user_profile: {
        $files: {},
      },
      kudos: {
        $: {
          order: { serverCreatedAt: "desc" },
          // first: 1,
        },
        $users: { user_profile: {} },
        kudo_receiver: { $users: { user_profile: {} } },
      },
      kudo_receiver: {},
    };
  },
};

// Set default dates
const defaultEnd = moment().endOf("day");
const defaultStart = moment(defaultEnd).subtract(1, "month").startOf("day");

export function useUserListViewModel() {
  const [users, setUsers] = useState<User[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [mode, setMode] = useState<"all" | "filter" | "search">("all");
  const [startDate, setStartDate] = useState<any>(defaultStart);
  const [endDate, setEndDate] = useState<any>(defaultEnd);
  const [searchTerm, setSearchTerm] = useState("");
  const { t } = useTranslation();
  const db = useInstantDB();

  // --- MVVM additions ---
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchTerm);
  const [isScrolled, setIsScrolled] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const [previewKudo, setPreviewKudo] = useState<any>(null);

  // Query for all users or filtered users with pagination
  let query: any;
  if (mode === "search" && searchTerm.trim()) {
    query = userQueries.searchUsers(searchTerm.trim());
  } else if (mode === "filter") {
    query = userQueries.filterUsers(cursor, startDate, endDate);
  } else {
    query = userQueries.allUsers(cursor);
  }

  const { isLoading, data, pageInfo, error }: any = db.useQuery({
    $users: query,
  });

  const { data: allUsersData } = db.useQuery({ $users: {} });
  const totalUsersCount = allUsersData?.$users?.length || 0;

  const hasMore = mode === "search" ? false : pageInfo?.$users?.hasNextPage;

  useEffect(() => {
    setUsers([]);
    setCursor(null);
  }, [mode, searchTerm, startDate, endDate]);

  useEffect(() => {
    if (data?.$users !== undefined) {
      if (cursor) {
        setUsers((prev) => {
          const ids = new Set(prev.map((u) => u.id));
          const newUsers = data.$users.filter((u: any) => !ids.has(u.id));
          return [...prev, ...newUsers];
        });
      } else {
        setUsers(data.$users);
      }
    }
  }, [data?.$users, cursor]);

  const loadMoreUsers = () => {
    if (hasMore && !isLoading && mode !== "search") {
      setCursor(pageInfo?.$users?.endCursor || null);
    }
  };

  // Mode switching methods
  const showAllUsers = () => {
    setMode("all");
    setSearchTerm("");
  };

  const applyDateFilter = (start: Date, end: Date) => {
    setMode("filter");
    setStartDate(start);
    setEndDate(end);
    setSearchTerm("");
  };

  const enableFilterMode = () => {
    setMode("filter");
    setSearchTerm("");
    // Use current dates that are already set
  };

  const applySearch = (term: string) => {
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
        if (mode === "search") {
          showAllUsers();
        }
      }
    }, 500);
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchInput, applySearch, showAllUsers, mode]);

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
    users,
    isLoading,
    hasMore,
    loadMoreUsers,
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
    showAllUsers,
    enableFilterMode,
    error,
    totalUsersCount,
    defaultStart,
    defaultEnd,
    // MVVM additions:
    isCalendarOpen,
    setIsCalendarOpen,
    searchInput,
    setSearchInput,
    isScrolled,
    calendarRef,
    handleSelect,
    handleReset,
    selectionRange,
    setPreviewKudo,
    previewKudo,
  };
}
