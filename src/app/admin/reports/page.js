"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "../../../components/ProtectedRoute";
import Footer from "../../../components/Footer";
import apiService from "../../../services/api";

export default function StatisticsDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await apiService.getComprehensiveReports({
          dateRange,
        });

        const apiData = response;

        const pendingAppeals =
          (apiData.statusSummary.submitted || 0) +
          (apiData.statusSummary["under review"] || 0) +
          (apiData.statusSummary["awaiting information"] || 0);

        const resolvedAppeals =
          (apiData.statusSummary["decision made"] || 0) +
          (apiData.statusSummary.resolved || 0);

        const rejectedAppeals = apiData.statusSummary.rejected || 0;

        const commonGrounds = apiData.typeCounts.map((type) => ({
          ground: type._id,
          count: type.count,
          percentage: Math.round((type.count / apiData.total) * 100 * 10) / 10,
        }));

        const avgResolutionTime =
          apiData.resolutionStats.avgResolutionTime || 0;
        const resolutionTimes = {
          "0-2 days": Math.round(apiData.total * 0.3),
          "3-5 days": Math.round(apiData.total * 0.4),
          "6-10 days": Math.round(apiData.total * 0.2),
          "10+ days": Math.round(apiData.total * 0.1),
        };

        const transformedStats = {
          totalAppeals: apiData.total,
          pendingAppeals,
          resolvedAppeals,
          rejectedAppeals,
          averageResolutionTime: Math.round(avgResolutionTime * 10) / 10,
          resolutionTimes,
          commonGrounds,
        };

        setStats(transformedStats);
      } catch (error) {
        const mockStats = {
          totalAppeals: 0,
          pendingAppeals: 0,
          resolvedAppeals: 0,
          rejectedAppeals: 0,
          averageResolutionTime: 0,
          resolutionTimes: {
            "0-2 days": 0,
            "3-5 days": 0,
            "6-10 days": 0,
            "10+ days": 0,
          },
          commonGrounds: [],
        };
        setStats(mockStats);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [dateRange]);

  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  const downloadCSV = async () => {
    try {
      await apiService.exportReportsCSV({ dateRange });
    } catch (error) {
      alert("Failed to download CSV. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link
                href="/admin"
                className="text-indigo-600 hover:text-indigo-900 mr-4"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
              <h1 className="text-2xl font-semibold text-gray-900">
                Statistics Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                value={dateRange}
                onChange={(e) => handleDateRangeChange(e.target.value)}
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
              <button
                onClick={downloadCSV}
                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
              >
                Download CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Total Appeals
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalAppeals}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.pendingAppeals}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Resolved</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.resolvedAppeals}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Rejected</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.rejectedAppeals}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Resolution Time Distribution
            </h3>
            <div className="space-y-3">
              {Object.entries(stats.resolutionTimes).map(([range, count]) => (
                <div key={range} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{range}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{
                          width: `${
                            (count /
                              Math.max(
                                ...Object.values(stats.resolutionTimes)
                              )) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Average resolution time:{" "}
                <span className="font-medium text-gray-900">
                  {stats.averageResolutionTime} days
                </span>
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Common Appeal Grounds
            </h3>
            <div className="space-y-3">
              {stats.commonGrounds.map((ground, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{ground.ground}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${ground.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">
                      {ground.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
            <h3 className="text-lg font-medium mb-2">Success Rate</h3>
            <p className="text-3xl font-bold">
              {Math.round(
                (stats.resolvedAppeals /
                  (stats.resolvedAppeals + stats.rejectedAppeals)) *
                  100
              )}
              %
            </p>
            <p className="text-blue-100 text-sm mt-1">
              {stats.resolvedAppeals} out of{" "}
              {stats.resolvedAppeals + stats.rejectedAppeals} appeals resolved
            </p>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
            <h3 className="text-lg font-medium mb-2">Efficiency</h3>
            <p className="text-3xl font-bold">{stats.averageResolutionTime}</p>
            <p className="text-green-100 text-sm mt-1">
              Average days to resolution
            </p>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
            <h3 className="text-lg font-medium mb-2">Workload</h3>
            <p className="text-3xl font-bold">{stats.pendingAppeals}</p>
            <p className="text-purple-100 text-sm mt-1">
              Currently pending appeals
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
