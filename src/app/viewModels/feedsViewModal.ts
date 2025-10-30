"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useInstantDB } from "@/app/context/InstantProvider";
import { useUserContext } from "@/app/context/UserContext";
import { kudoQueries } from "../models/kudoPostModel";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

// Define the type for a Kudo
export interface Kudo {
  id: string;
  kudo?: string; // Optional to prevent missing property errors
  $users?: any[]; // Optional array
  kudo_receiver?: any[];
  createdAt?: string;
}

// Define the type for PageInfo
// interface PageInfo {
//   kudos?: {
//     endCursor?: string | null;
//   };
// }

// Define the type for QueryResult
// interface QueryResult {
//   kudos: Kudo[];
//   pageInfo?: PageInfo;
// }

export function useFeedsViewModel() {
  const [kudos, setKudos] = useState<Kudo[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [mode, setMode] = useState<"normal" | "search">("normal");
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  
  const { t } = useTranslation();
  const { user } = useUserContext();
  const db = useInstantDB();
  const router = useRouter();
  const kudosCounts = db.useQuery(kudoQueries.count(user?.id || ""));
   const {
    kudos: kudoList,
    kudo_receiver,
    user_profile,
  } = kudosCounts?.data?.$users[0] || {};
  const sentCount = kudoList?.length || 0;
  const receivedCount = kudo_receiver?.length || 0;
  const [filter, setFilter] = useState<"all" | "given" | "received">(!receivedCount && sentCount ? "given" : "received");
  // Build query based on current state (search or normal mode)
  let query: any = {};
  if (user?.id) {
    if (mode === "search" && searchTerm.trim()) {
      const trimmedTerm = searchTerm.trim().toLowerCase();
      switch (filter) {
        case "given":
          query = kudoQueries.searchGiven(user.id, trimmedTerm);
          break;
        case "received":
          query = kudoQueries.searchReceived(user.id, trimmedTerm);
          break;
        case "all":
          query = kudoQueries.searchAll(user.id, trimmedTerm);
          break;
      }
    } else {
      query = kudoQueries[filter](user.id, cursor);
    }
  }

  const { isLoading, data, pageInfo, error }: any = db.useQuery({
    kudos: query,
  });
 
  const hasMore = mode === "search" ? false : pageInfo?.kudos?.hasNextPage;

  useEffect(() => {
    if (data?.kudos !== undefined) {
      if (cursor && mode !== "search") {
        // Pagination: append new data, avoid duplicates
        setKudos((prev) => {
          const ids = new Set(prev.map((k) => k.id));
          const newKudos = data.kudos.filter((k: any) => !ids.has(k.id));
          return [...prev, ...newKudos];
        });
      } else {
        setKudos(data.kudos || []);
      }
    }
  }, [data?.kudos, cursor, mode]);

  const loadMoreKudos = useCallback(() => {
    if (hasMore && !isLoading && mode !== "search") {
      setCursor(pageInfo?.kudos?.endCursor || null);
    }
  }, [hasMore, isLoading, mode, pageInfo?.kudos?.endCursor]);

  const resetData = () => {
    setKudos([]);
    setCursor(null);
  };

  // Handle filter change
  const handleFilterChange = (newFilter: "all" | "given" | "received") => {
    setFilter(newFilter);
    // Keep search active if user was searching
    if (mode === "search" && searchTerm.trim()) {
      // The useEffect will trigger a new search query for the new filter
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
        setSearchTerm(trimmedInput);
        setMode("search");
      } else {
        setSearchTerm("");
        setMode("normal");
      }
    }, 500);
    
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchInput]);

  // Keep searchInput in sync with searchTerm when cleared externally
  useEffect(() => {
    if (searchTerm === "") {
      setSearchInput("");
    }
  }, [searchTerm]);

  // Clear search
  const clearSearch = () => {
    setSearchInput("");
    setSearchTerm("");
    setMode("normal");
  };

  const onDeleteSuccess = (kudoId: string) => {
    setKudos((prev) => prev.filter((kudo) => kudo.id !== kudoId));
  };

  return {
    kudos,
    isLoading,
    sentCount,
    receivedCount,
    profilePhoto: user_profile?.$files?.url,
    filter,
    setFilter: handleFilterChange,
    loadMoreKudos,
    redirectToSendKudo: () => router.push("/"),
    onDeleteSuccess,
    t,
    hasMore,
    user,
    searchInput,
    setSearchInput,
    searchTerm,
    mode,
    clearSearch,
    error,
  };
}
