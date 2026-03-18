"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "../../../components/ProtectedRoute";
import Footer from "../../../components/Footer";
import apiService from "../../../services/api";

export default function LateSubmissionInfo() {
  const [userInfo, setUserInfo] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedUserInfo = localStorage.getItem("userInfo");
    if (!storedUserInfo) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(storedUserInfo);
    if (user.role !== "student") {
      router.push("/login");
      return;
    }

    setUserInfo(user);
  }, [router]);

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole="student">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Appeal Deadline Missed
              </h2>
              <p className="text-lg text-gray-600">
                You cannot submit a standard appeal through this system
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
              <div className="flex">
                <svg
                  className="h-6 w-6 text-red-400 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-red-800 mb-2">
                    Standard Appeal Deadline Passed
                  </h3>
                  <p className="text-red-700">
                    Academic appeals must be submitted within{" "}
                    <strong>10 working days</strong> of receiving your results.
                    Since you have indicated that you are past this deadline,
                    you cannot proceed with a standard appeal through this
                    online system.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                What is a Late Submission Request (LSR)?
              </h3>
              <div className="prose max-w-none text-gray-700">
                <p className="mb-4">
                  A Late Submission Request (LSR) is a formal process that
                  allows students to request permission to submit an appeal
                  after the standard 10 working day deadline has passed. This is
                  only considered in exceptional circumstances.
                </p>
                <p className="mb-4">
                  LSRs are reviewed by a separate panel and require compelling
                  evidence as to why the appeal could not be submitted within
                  the original timeframe.
                </p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Exceptional Circumstances for LSR
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="text-md font-medium text-blue-900 mb-3">
                  LSRs may be considered for circumstances such as:
                </h4>
                <ul className="space-y-2 text-blue-800">
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-blue-600 mt-0.5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Serious illness or medical emergency that prevented timely
                    submission
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-blue-600 mt-0.5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Bereavement or family emergency
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-blue-600 mt-0.5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Administrative error by the University that delayed
                    notification
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-blue-600 mt-0.5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Other exceptional circumstances beyond your control
                  </li>
                </ul>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                How to Submit a Late Submission Request
              </h3>
              <div className="space-y-4 text-gray-700">
                <p>
                  Since LSRs require special consideration and cannot be
                  processed through this online system, you will need to submit
                  your request using the official LSR form.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex">
                    <svg
                      className="h-5 w-5 text-yellow-400 mt-0.5 mr-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">
                        Important
                      </h4>
                      <div className="mt-1 text-sm text-yellow-700">
                        LSRs have their own strict deadline. You must submit
                        your LSR within <strong>20 working days</strong> of your
                        original results notification, or within{" "}
                        <strong>10 working days</strong> of when the exceptional
                        circumstances ended, whichever is later.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://shef.qualtrics.com/jfe/form/SV_eyUtT0CepceIShw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  Access Official LSR Form
                </a>
                <button
                  onClick={() => router.push("/student")}
                  className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Need Additional Help?
                </h4>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>
                    <strong>Student Services:</strong> +44 114 222 8888
                  </p>
                  <p>
                    <strong>Appeals Team:</strong> appeals@sheffield.ac.uk
                  </p>
                  <p>
                    <strong>Student Union Advice Centre:</strong>{" "}
                    advice@su.sheffield.ac.uk
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </ProtectedRoute>
  );
}
