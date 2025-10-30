"use client";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useInstantDB } from "@/app/context/InstantProvider";
import { useTranslation } from "react-i18next";
import moment from "moment";

// Test accounts to exclude from admin view
const TEST_EMAILS = ["raj.mansuri@quantuminfoway.com", "cp@cheerchampion.com"];

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
    last_active?: string;
    $files?: {
      url?: string;
    };
  };
  kudos?: any[];
  kudo_receiver?: any[];
}

// Create filter queries to exclude test emails using InstantDB syntax
const createUserEmailFilters = () => {
  return {
    $: {
      where: {
        and: TEST_EMAILS.map(email => ({
          email: { $not: email }
        }))
      }
    }
  };
};

const createKudosEmailFilters = () => {
  return {
    $: {
      where: {
        and: TEST_EMAILS.map(email => ({
          "$users.email": { $not: email }
        }))
      }
    }
  };
};

export const userQueries = {
  dayAysis: () => ({
    ...createUserEmailFilters(),
    user_profile: {
      $files: {},
    },
    kudos: {},
    kudo_receiver: {},
  }),
  allUsers: () => ({
    ...createUserEmailFilters(),
    user_profile: {},
  }),
};

export function AdminDashboardViewModal() {
  const [users, setUsers] = useState<User[]>([]);
  const { t } = useTranslation();
  const db = useInstantDB();
  const [isScrolled, setIsScrolled] = useState(false);

  const query: any = userQueries.dayAysis();
  const {
    data: usersData,
    isLoading,
    error,
  }: any = db.useQuery({
    $users: query,
  });

  const { data: allKudosData } = db.useQuery({
    kudos: createKudosEmailFilters(),
  });

  const { data: allUsersData } = db.useQuery({
    $users: userQueries.allUsers(),
  });
  
  const totalUsersCount = allUsersData?.$users?.length || 0;

  const { data: allReceiversData } = db.useQuery({
    kudo_receiver: createKudosEmailFilters(),
  });
  const totalReceiversCount = allReceiversData?.kudo_receiver?.length || 0;

  // Update users state when data changes
  useEffect(() => {
    if (usersData?.$users) {
      setUsers(usersData.$users);
    }
  }, [usersData]);

  const currentMonthStart = moment()
    .startOf("month")
    .format("YYYY-MM-DD HH:mm:ss");
  const currentMonthEnd = moment().endOf("month").format("YYYY-MM-DD HH:mm:ss");
  const last30DaysStart = moment()
    .subtract(30, "days")
    .startOf("day")
    .format("YYYY-MM-DD HH:mm:ss");
  const last30DaysEnd = moment().endOf("day").format("YYYY-MM-DD HH:mm:ss");
  const prev30DaysStart = moment()
    .subtract(60, "days")
    .startOf("day")
    .format("YYYY-MM-DD HH:mm:ss");
  const prev30DaysEnd = moment()
    .subtract(30, "days")
    .startOf("day")
    .format("YYYY-MM-DD HH:mm:ss");

  // Calculate current month's kudos
  const currentMonthKudos = useMemo(() => {
    if (!allKudosData?.kudos) return 0;
    return allKudosData.kudos.filter((kudo: any) => {
      if (!kudo.created_at) return false;
      const kudoDate = moment(kudo.created_at);
      return kudoDate.isBetween(currentMonthStart, currentMonthEnd, null, "[]");
    }).length;
  }, [allKudosData, currentMonthStart, currentMonthEnd]);

  // Calculate current month's users
  const currentMonthUsers = useMemo(() => {
    if (!allUsersData?.$users) return 0;
    return allUsersData.$users.filter((user: any) => {
      if (!user.user_profile?.created_at) return false;
      const userDate = moment(user.user_profile.created_at);
      return userDate.isBetween(currentMonthStart, currentMonthEnd, null, "[]");
    }).length;
  }, [allUsersData, currentMonthStart, currentMonthEnd]);

  // Legacy monthly growth calculations (keeping for backward compatibility)
  const legacyKudosGrowth = useMemo(() => {
    if (!allKudosData?.kudos) return { percentage: 0, isPositive: true };
    const lastMonthStart = last30DaysStart;
    const lastMonthEnd = last30DaysEnd;
    const twoMonthsAgoStart = prev30DaysStart;
    const twoMonthsAgoEnd = prev30DaysEnd;

    const lastMonthKudos = allKudosData.kudos.filter((kudo: any) => {
      if (!kudo.created_at) return false;
      const kudoDate = moment(kudo.created_at);
      return kudoDate.isBetween(lastMonthStart, lastMonthEnd, null, "[]");
    }).length;

    const twoMonthsAgoKudos = allKudosData.kudos.filter((kudo: any) => {
      if (!kudo.created_at) return false;
      const kudoDate = moment(kudo.created_at);
      return kudoDate.isBetween(twoMonthsAgoStart, twoMonthsAgoEnd, null, "[]");
    }).length;

    if (twoMonthsAgoKudos === 0) {
      return { percentage: lastMonthKudos > 0 ? 100 : 0, isPositive: true };
    }
    const percentage =
      ((lastMonthKudos - twoMonthsAgoKudos) / twoMonthsAgoKudos) * 100;
    return {
      percentage: Math.abs(Math.round(percentage * 10) / 10),
      isPositive: percentage >= 0,
    };
  }, [
    allKudosData,
    last30DaysStart,
    last30DaysEnd,
    prev30DaysStart,
    prev30DaysEnd,
  ]);

  // Legacy users growth calculation
  const legacyUsersGrowth = useMemo(() => {
    if (!allUsersData?.$users)
      return { percentage: 0, isPositive: true, lastMonthUsers: 0 };
    const lastMonthStart = last30DaysStart;
    const lastMonthEnd = last30DaysEnd;
    const twoMonthsAgoStart = prev30DaysStart;
    const twoMonthsAgoEnd = prev30DaysEnd;
    const lastMonthUsers = allUsersData.$users.filter((user: any) => {
      if (!user.user_profile?.created_at) return false;
      const userDate = moment(user.user_profile.created_at);
      return userDate.isBetween(lastMonthStart, lastMonthEnd, null, "[]");
    }).length;
    const twoMonthsAgoUsers = allUsersData.$users.filter((user: any) => {
      if (!user.user_profile?.created_at) return false;
      const userDate = moment(user.user_profile.created_at);
      return userDate.isBetween(twoMonthsAgoStart, twoMonthsAgoEnd, null, "[]");
    }).length;
    if (twoMonthsAgoUsers === 0) {
      return {
        percentage: lastMonthUsers > 0 ? 100 : 0,
        isPositive: true,
        lastMonthUsers,
      };
    }
    const percentage =
      ((lastMonthUsers - twoMonthsAgoUsers) / twoMonthsAgoUsers) * 100;
    return {
      percentage: Math.abs(Math.round(percentage * 10) / 10),
      isPositive: percentage >= 0,
      lastMonthUsers,
    };
  }, [
    allUsersData,
    last30DaysStart,
    last30DaysEnd,
    prev30DaysStart,
    prev30DaysEnd,
  ]);

  // Calculate kudos by day of week (based on kudo creation date)
  const kudosByDayOfWeek = useMemo(() => {
    if (!allKudosData?.kudos) {
      return {
        Sunday: 0,
        Monday: 0,
        Tuesday: 0,
        Wednesday: 0,
        Thursday: 0,
        Friday: 0,
        Saturday: 0,
      };
    }

    const dayCount: { [key: string]: number } = {
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
      Sunday: 0,
    };

    allKudosData.kudos.forEach(
      (kudo: {
        id: string;
        created_at?: string | number;
        file_url?: string;
        kudo?: string;
      }) => {
        if (kudo.created_at) {
          const dayName = moment(kudo.created_at).format("dddd");
          dayCount[dayName]++;
        }
      }
    );

    return dayCount;
  }, [allKudosData]);

  // Compute top 5 kudo senders
  const topSenders = useMemo(() => {
    if (!users || users.length === 0) return [];

    const senders = [...users]
      .filter((u) => u.kudos && u.kudos.length > 0)
      .sort((a, b) => (b.kudos?.length || 0) - (a.kudos?.length || 0))
      .slice(0, 5);

    return senders;
  }, [users]);

  // Compute top 5 kudo receivers
  const topReceivers = useMemo(() => {
    if (!users || users.length === 0) return [];

    const receivers = [...users]
      .filter((u) => u.kudo_receiver && u.kudo_receiver.length > 0)
      .sort(
        (a, b) =>
          (b.kudo_receiver?.length || 0) - (a.kudo_receiver?.length || 0)
      )
      .slice(0, 5);

    return receivers;
  }, [users]);

  // Compute active users in the last 30 days
  const activeUsersCount = useMemo(() => {
    if (!allUsersData?.$users) return 0;
    return allUsersData.$users.filter((user: any) => {
      const lastSend = user.user_profile?.last_send_at
        ? moment(user.user_profile.last_send_at)
        : null;
      return (
        (lastSend &&
          lastSend.isBetween(last30DaysStart, last30DaysEnd, null, "[]")) ||
        0
      );
    }).length;
  }, [allUsersData, last30DaysStart, last30DaysEnd]);

  const engagementPercentage = useMemo(() => {
    if (!totalUsersCount) return 0;
    return Math.round((activeUsersCount / totalUsersCount) * 100);
  }, [activeUsersCount, totalUsersCount]);

  // Fixed monthly targets
  const kudosTarget = 300; // Example monthly target for kudos
  const usersTarget = 300; // Example monthly target for users

  return {
    users,
    isLoading,
    t,
    error,
    totalUsersCount,
    totalReceiversCount,
    isScrolled,
    topSenders,
    topReceivers,
    kudosByDayOfWeek,
    currentMonthKudos,
    allKudosCount: allKudosData?.kudos?.length || 0,
    allKudosData: allKudosData?.kudos || [],
    allUsersForChart: allUsersData?.$users || [],
    kudosGrowth: legacyKudosGrowth,
    usersGrowth: legacyUsersGrowth,
    activeUsersCount,
    engagementPercentage,
    newUsersThisMonth: legacyUsersGrowth.lastMonthUsers,
    currentMonthUsers, // Updated
    kudosTarget,
    usersTarget,
  };
}
