"use client";
import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import moment from "moment";
import type { ApexOptions } from "apexcharts";

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface MonthlyData {
  [key: string]: {
    kudos: number;
    users: number;
  };
}

interface MonthsChartProps {
  kudosData?: any[];
  usersData?: any[];
  title?: string;
  height?: number;
  className?: string;
  showDataLabels?: boolean;
  colors?: string[];
  t: (key: string) => string;
}

const MonthsChart: React.FC<MonthsChartProps> = ({
  kudosData = [],
  usersData = [],
  title = "Kudos vs Users by Month",
  height = 400,
  className = "",
  showDataLabels = true,
  colors = ["#3B82F6", "#10B981"],
  t,
}) => {
  // Process data to get monthly counts
  const monthlyData = useMemo(() => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Initialize data structure
    const data: MonthlyData = {};
    months.forEach((month) => {
      data[month] = { kudos: 0, users: 0 };
    });

    // Process kudos data
    if (kudosData && kudosData.length > 0) {
      kudosData.forEach((kudo: any) => {
        if (kudo.created_at) {
          const month = moment(kudo.created_at).format("MMM");
          if (data[month]) {
            data[month].kudos++;
          }
        }
      });
    }

    // Process users data
    if (usersData && usersData.length > 0) {
      usersData.forEach((user: any) => {
        const createdAt = user.user_profile?.created_at || user.created_at;
        if (createdAt) {
          const month = moment(createdAt).format("MMM");
          if (data[month]) {
            data[month].users++;
          }
        }
      });
    }

    return data;
  }, [kudosData, usersData]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalKudos = Object.values(monthlyData).reduce(
      (sum, { kudos }) => sum + kudos,
      0
    );
    const totalUsers = Object.values(monthlyData).reduce(
      (sum, { users }) => sum + users,
      0
    );
    const maxKudos = Math.max(
      ...Object.values(monthlyData).map(({ kudos }) => kudos)
    );
    const maxUsers = Math.max(
      ...Object.values(monthlyData).map(({ users }) => users)
    );
    const peakKudosMonth = Object.entries(monthlyData).find(
      ([, { kudos }]) => kudos === maxKudos
    );
    const peakUsersMonth = Object.entries(monthlyData).find(
      ([, { users }]) => users === maxUsers
    );
    const averageKudosPerMonth = totalKudos / 12;
    const averageUsersPerMonth = totalUsers / 12;

    return {
      totalKudos,
      totalUsers,
      peakKudosMonth: peakKudosMonth
        ? { month: peakKudosMonth[0], count: peakKudosMonth[1].kudos }
        : null,
      peakUsersMonth: peakUsersMonth
        ? { month: peakUsersMonth[0], count: peakUsersMonth[1].users }
        : null,
      averageKudos: Math.round(averageKudosPerMonth * 10) / 10,
      averageUsers: Math.round(averageUsersPerMonth * 10) / 10,
    };
  }, [monthlyData]);

  // Prepare series data for ApexCharts
  const series = useMemo(() => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const kudosValues = months.map((month) => monthlyData[month].kudos);
    const usersValues = months.map((month) => monthlyData[month].users);

    return [
      {
        name: t("chart.kudosSent"),
        type: "column",
        data: kudosValues,
      },
      {
        name: t("chart.usersJoined"),
        type: "line",
        data: usersValues,
      },
    ];
  }, [monthlyData, t]);

  // Chart configuration
  const options: ApexOptions = {
    chart: {
      height: height,
      type: "line",
      stacked: false,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false,
        },
      },
      background: "transparent",
      fontFamily: "inherit",
      animations: {
        enabled: true,
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150,
        },
      },
    },
    colors: colors,
    dataLabels: {
      enabled: showDataLabels,
      style: {
        fontSize: "12px",
        fontWeight: "600",
        colors: ["#374151"],
      },
      offsetY: -20,
      formatter: (val: number) => (val > 0 ? val.toString() : ""),
    },
    stroke: {
      width: [0, 3], // No stroke for columns, 3px for line
      curve: "smooth",
    },
    plotOptions: {
      bar: {
        columnWidth: "50%",
        borderRadius: 4,
        borderRadiusApplication: "end",
      },
    },
    fill: {
      opacity: [0.85, 1], // Slightly transparent columns, solid line
    },
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    markers: {
      size: 6,
      colors: [colors[1]],
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 8,
      },
    },
    xaxis: {
      type: "category",
      title: {
        text: t("chart.month"),
        style: {
          fontSize: "14px",
          fontWeight: "600",
          color: "#374151",
        },
      },
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "12px",
          fontWeight: "500",
        },
      },
      axisBorder: {
        show: true,
        color: "#E5E7EB",
      },
      axisTicks: {
        show: true,
        color: "#E5E7EB",
      },
    },
    yaxis: [
      {
        title: {
          text: t("chart.kudosSent"),
          style: {
            color: colors[0],
            fontSize: "14px",
            fontWeight: "600",
          },
        },
        labels: {
          style: {
            colors: "#6B7280",
            fontSize: "12px",
          },
          formatter: (value: number) => Math.floor(value).toString(),
        },
        min: 0,
      },
      {
        opposite: true,
        title: {
          text: t("chart.usersJoined"),
          style: {
            color: colors[1],
            fontSize: "14px",
            fontWeight: "600",
          },
        },
        labels: {
          style: {
            colors: "#6B7280",
            fontSize: "12px",
          },
          formatter: (value: number) => Math.floor(value).toString(),
        },
        min: 0,
      },
    ],
    title: {
      text: t("admin.dashboard.monthlyChartTitle"),
      align: "left",
      margin: 20,
      style: {
        fontSize: "20px",
        fontWeight: "700",
        color: "#111827",
      },
    },
    grid: {
      borderColor: "#F3F4F6",
      strokeDashArray: 0,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "right",
      fontSize: "12px",
      fontWeight: "500",
      labels: {
        colors: "#374151",
      },
      markers: {},
    },
    tooltip: {
      theme: "light",
      shared: true,
      intersect: false,
      style: {
        fontSize: "12px",
      },
      y: [
        {
          formatter: (y: number) =>
            typeof y !== "undefined" ? `${y} kudos` : y,
        },
        {
          formatter: (y: number) =>
            typeof y !== "undefined" ? `${y} users` : y,
        },
      ],
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: {
            height: 300,
          },
          plotOptions: {
            bar: {
              columnWidth: "70%",
            },
          },
          title: {
            style: {
              fontSize: "18px",
            },
          },
          dataLabels: {
            style: {
              fontSize: "10px",
            },
          },
          legend: {
            position: "bottom",
            horizontalAlign: "center",
            offsetY: 10,
          },
        },
      },
      {
        breakpoint: 480,
        options: {
          plotOptions: {
            bar: {
              columnWidth: "85%",
            },
          },
          title: {
            style: {
              fontSize: "16px",
            },
          },
          dataLabels: {
            enabled: false,
          },
          legend: {
            position: "bottom",
            horizontalAlign: "center",
            offsetY: 10,
          },
        },
      },
    ],
  };

  return (
    <div
      className={`w-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${className}`}
    >
      {/* Chart Container */}
      <div className="p-6">
        <Chart
          options={options}
          series={series}
          type="line"
          height={height}
          width="100%"
        />
      </div>

      {/* Summary Stats */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600 font-medium">
              {t("chart.totalKudos")}:
            </span>
            <span className="font-bold text-gray-900">
              {summaryStats.totalKudos}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600 font-medium">
              {t("chart.totalUsers")}:
            </span>
            <span className="font-bold text-gray-900">
              {summaryStats.totalUsers}
            </span>
          </div>
          {summaryStats.peakKudosMonth && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600 font-medium">
                {t("chart.peakKudosMonth")}:
              </span>
              <span className="font-bold text-gray-900">
                {summaryStats.peakKudosMonth.month} (
                {summaryStats.peakKudosMonth.count})
              </span>
            </div>
          )}
          {summaryStats.peakUsersMonth && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600 font-medium">
                {t("chart.peakUsersMonth")}:
              </span>
              <span className="font-bold text-gray-900">
                {summaryStats.peakUsersMonth.month} (
                {summaryStats.peakUsersMonth.count})
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
            <span className="text-gray-600 font-medium">
              {t("chart.avgKudosPerMonth")}:
            </span>
            <span className="font-bold text-gray-900">
              {summaryStats.averageKudos}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
            <span className="text-gray-600 font-medium">
              {t("chart.avgUsersPerMonth")}:
            </span>
            <span className="font-bold text-gray-900">
              {summaryStats.averageUsers}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthsChart;
