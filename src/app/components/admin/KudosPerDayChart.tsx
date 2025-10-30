"use client";
import React from "react";
import dynamic from "next/dynamic";

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

// Types for the component
export interface KudosData {
  [key: string]: number;
}

export interface SeriesData {
  name: string;
  data: number[];
  color?: string;
}

export interface KudosPerDayChartProps {
  data: KudosData;
  title?: string;
  height?: number;
  className?: string;
  showDataLabels?: boolean;
  colors?: string[];
  // Future-proofing for multiple series
  additionalSeries?: SeriesData[];
  stacked?: boolean;
  t: (key: string) => string;
}

// Days of the week in order (Sunday to Saturday)
const DAYS_ORDER = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const KudosPerDayChart: React.FC<KudosPerDayChartProps> = ({
  data,
  title = "Kudos Sent Per Day of Week",
  height = 400,
  className = "",
  showDataLabels = true,
  colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"],
  additionalSeries = [],
  stacked = true,
  t,
}) => {
  // Transform the data into the format needed by ApexCharts
  const chartData = React.useMemo(() => {
    // Ensure data is ordered by days of the week
    const orderedData = DAYS_ORDER.map((day) => ({
      day,
      count: data[day] || 0,
    }));

    // Primary series (total kudos)
    const primarySeries = {
      name: "Total Kudos",
      data: orderedData.map((item) => item.count),
    };

    // Combine with additional series for future extensibility
    const allSeries = [primarySeries, ...additionalSeries];

    return {
      categories: orderedData.map((item) => item.day),
      series: allSeries,
    };
  }, [data, additionalSeries]);

  // ApexCharts configuration
  const chartOptions: any = {
    chart: {
      type: "bar",
      stacked: stacked,
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
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150,
        },
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "65%",
        borderRadius: stacked ? 0 : 6,
        borderRadiusApplication: "end",
        dataLabels: {
          position: "top",
        },
      },
    },
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
      show: true,
      width: stacked ? 1 : 2,
      colors: stacked ? ["#ffffff"] : ["transparent"],
    },
    colors: colors,
    xaxis: {
      categories: chartData.categories,
      title: {
        text: t("chart.dayOfWeek"),
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
    yaxis: {
      title: {
        text: t("chart.numberOfKudos"),
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
        },
        formatter: (val: number) => Math.floor(val).toString(),
      },
    },
    title: {
      text: t("admin.dashboard.kudosPerDayTitle"),
      align: "left",
      margin: 20,
      style: {
        fontSize: "20px",
        fontWeight: "700",
        color: "#111827",
      },
    },
    legend: {
      show: chartData.series.length > 1,
      position: "top",
      horizontalAlign: "right",
      fontSize: "12px",
      fontWeight: "500",
      labels: {
        colors: "#374151",
      },
      markers: {
        width: 12,
        height: 12,
        radius: 2,
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
    tooltip: {
      theme: "light",
      style: {
        fontSize: "12px",
      },
      y: {
        formatter: (value: number, { seriesIndex, dataPointIndex, w }: any) => {
          const seriesName = w.config.series[seriesIndex].name;
          return `${seriesName}: ${value} kudos`;
        },
      },
      marker: {
        show: true,
      },
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          plotOptions: {
            bar: {
              columnWidth: "75%",
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
          },
        },
      },
    ],
  };

  // Calculate summary statistics
  const summaryStats = React.useMemo(() => {
    const totalKudos = Object.values(data).reduce(
      (sum, count) => sum + count,
      0
    );
    const maxCount = Math.max(...Object.values(data));
    const peakDay = Object.entries(data).find(
      ([, count]) => count === maxCount
    );
    const averagePerDay = totalKudos / 7;

    return {
      total: totalKudos,
      peakDay: peakDay ? { day: peakDay[0], count: peakDay[1] } : null,
      average: Math.round(averagePerDay * 10) / 10,
    };
  }, [data]);

  return (
    <div
      className={`w-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${className}`}
    >
      {/* Chart Container */}
      <div className="p-6">
        <Chart
          options={chartOptions}
          series={chartData.series}
          type="bar"
          height={height}
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
              {summaryStats.total}
            </span>
          </div>

          {summaryStats.peakDay && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600 font-medium">
                {t("chart.peakDay")}:
              </span>
              <span className="font-bold text-gray-900">
                {summaryStats.peakDay.day} ({summaryStats.peakDay.count})
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
            <span className="text-gray-600 font-medium">
              {t("chart.dailyAverage")}:
            </span>
            <span className="font-bold text-gray-900">
              {summaryStats.average}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Export default for easier importing
export default KudosPerDayChart;
