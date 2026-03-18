"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import Footer from "../components/Footer";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [pendingScroll, setPendingScroll] = useState(null);

  const handleFooterNavigation = (section) => {
    setActiveTab(section);
    setPendingScroll(`${section}-section`);
  };

  useEffect(() => {
    if (pendingScroll) {
      const timer = setTimeout(() => {
        const sectionElement = document.getElementById(pendingScroll);
        if (sectionElement) {
          sectionElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
        setPendingScroll(null);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [activeTab, pendingScroll]);

  useEffect(() => {
    const handleHeaderNavigation = (event) => {
      const section = event.detail;
      setActiveTab(section);
      setPendingScroll(`${section}-section`);
    };

    window.addEventListener("navigateToSection", handleHeaderNavigation);

    return () => {
      window.removeEventListener("navigateToSection", handleHeaderNavigation);
    };
  }, []);

  const handleGetStarted = () => {
    router.push("/login");
  };

  const handleDashboard = () => {
    const userRole = user?.role;
    if (userRole === "student") {
      router.push("/student");
    } else if (userRole === "reviewer") {
      router.push("/reviewer");
    } else if (userRole === "admin") {
      router.push("/admin");
    }
  };

  const isAuthenticated = user;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-purple-600 text-white px-4 py-2 rounded z-50"
      >
        Skip to main content
      </a>

      <section
        className="py-20 px-4 sm:px-6 lg:px-8"
        aria-labelledby="hero-heading"
      >
        <div className="max-w-7xl mx-auto text-center">
          <h1
            id="hero-heading"
            className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
          >
            Streamline Your Academic Appeals
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            The University of Sheffield&apos;s comprehensive appeal management
            system designed to make the appeal process transparent, efficient,
            and accessible for students, reviewers, and administrators.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <button
                onClick={handleDashboard}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                aria-label="Go to your dashboard"
              >
                Go to Dashboard
              </button>
            ) : (
              <button
                onClick={handleGetStarted}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                aria-label="Start your academic appeal process"
              >
                Start Your Appeal
              </button>
            )}
            <button
              onClick={() => {
                setActiveTab("help");
                setPendingScroll("help-section");
              }}
              className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50 px-8 py-4 rounded-lg text-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              aria-label={
                isAuthenticated
                  ? "Get help and support"
                  : "Learn more about the appeal system"
              }
            >
              {isAuthenticated ? "Get Help" : "Learn More"}
            </button>
          </div>
        </div>
      </section>

      <main
        id="main-content"
        className="py-16 px-4 sm:px-6 lg:px-8"
        role="main"
        aria-label="Main content"
      >
        <div className="max-w-7xl mx-auto">
          <nav
            className="flex flex-wrap justify-center mb-12 border-b border-gray-200"
            role="tablist"
            aria-label="Content sections"
          >
            <button
              onClick={() => {
                setActiveTab("overview");
                setPendingScroll("overview-section");
              }}
              className={`px-6 py-3 text-sm font-medium rounded-t-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                activeTab === "overview"
                  ? "text-purple-600 border-b-2 border-purple-600 bg-white"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              role="tab"
              aria-selected={activeTab === "overview"}
              aria-controls="overview-section"
              id="overview-tab"
            >
              Overview
            </button>
            <button
              onClick={() => {
                setActiveTab("features");
                setPendingScroll("features-section");
              }}
              className={`px-6 py-3 text-sm font-medium rounded-t-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                activeTab === "features"
                  ? "text-purple-600 border-b-2 border-purple-600 bg-white"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              role="tab"
              aria-selected={activeTab === "features"}
              aria-controls="features-section"
              id="features-tab"
            >
              Features
            </button>
            <button
              onClick={() => {
                setActiveTab("help");
                setPendingScroll("help-section");
              }}
              className={`px-6 py-3 text-sm font-medium rounded-t-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                activeTab === "help"
                  ? "text-purple-600 border-b-2 border-purple-600 bg-white"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              role="tab"
              aria-selected={activeTab === "help"}
              aria-controls="help-section"
              id="help-tab"
            >
              Help & Support
            </button>
            <button
              onClick={() => {
                setActiveTab("contact");
                setPendingScroll("contact-section");
              }}
              className={`px-6 py-3 text-sm font-medium rounded-t-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                activeTab === "contact"
                  ? "text-purple-600 border-b-2 border-purple-600 bg-white"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              role="tab"
              aria-selected={activeTab === "contact"}
              aria-controls="contact-section"
              id="contact-tab"
            >
              Contact
            </button>
          </nav>

          <div className="bg-white rounded-lg shadow-lg p-8">
            {activeTab === "overview" && (
              <div
                id="overview-section"
                className="space-y-8"
                role="tabpanel"
                aria-labelledby="overview-tab"
                aria-hidden="false"
              >
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    Welcome to Student Appeal Manager
                  </h3>
                  <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                    Our platform provides a comprehensive solution for managing
                    academic appeals at the University of Sheffield. Whether
                    you&apos;re a student seeking to appeal a decision, a
                    reviewer evaluating appeals, or an administrator overseeing
                    the process, our system streamlines every step.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center p-6 bg-blue-50 rounded-lg">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">
                      Submit Appeals
                    </h4>
                    <p className="text-gray-600">
                      Students can easily submit appeals with supporting
                      documentation and track their progress.
                    </p>
                  </div>

                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">
                      Review Process
                    </h4>
                    <p className="text-gray-600">
                      Reviewers can efficiently evaluate appeals with
                      comprehensive tools and clear guidelines.
                    </p>
                  </div>

                  <div className="text-center p-6 bg-purple-50 rounded-lg">
                    <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">
                      Admin Dashboard
                    </h4>
                    <p className="text-gray-600">
                      Administrators have full oversight with detailed reports
                      and management tools.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "features" && (
              <div
                id="features-section"
                className="space-y-8"
                role="tabpanel"
                aria-labelledby="features-tab"
                aria-hidden="false"
              >
                <h3 className="text-3xl font-bold text-gray-900 text-center mb-8">
                  Key Features
                </h3>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h4 className="text-xl font-semibold text-gray-900">
                      For Students
                    </h4>
                    <ul className="space-y-3 text-gray-600">
                      <li className="flex items-start">
                        <svg
                          className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Intuitive appeal submission form
                      </li>
                      <li className="flex items-start">
                        <svg
                          className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Document upload and management
                      </li>
                      <li className="flex items-start">
                        <svg
                          className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Real-time status tracking
                      </li>
                      <li className="flex items-start">
                        <svg
                          className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Communication with reviewers
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-xl font-semibold text-gray-900">
                      For Reviewers
                    </h4>
                    <ul className="space-y-3 text-gray-600">
                      <li className="flex items-start">
                        <svg
                          className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Comprehensive appeal review interface
                      </li>
                      <li className="flex items-start">
                        <svg
                          className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Decision templates and guidelines
                      </li>
                      <li className="flex items-start">
                        <svg
                          className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Collaborative review process
                      </li>
                      <li className="flex items-start">
                        <svg
                          className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Automated notifications
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "help" && (
              <div
                id="help-section"
                className="space-y-8"
                role="tabpanel"
                aria-labelledby="help-tab"
                aria-hidden="false"
              >
                <h3 className="text-3xl font-bold text-gray-900 text-center mb-8">
                  Help & Support
                </h3>

                <div className="space-y-6">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">
                      Getting Started
                    </h4>
                    <div className="space-y-3 text-gray-600">
                      <p>
                        <strong>1. Create an Account:</strong> Use your
                        University of Sheffield credentials to log in.
                      </p>
                      <p>
                        <strong>2. Submit an Appeal:</strong> Navigate to the
                        student dashboard and click &quot;New Appeal&quot;.
                      </p>
                      <p>
                        <strong>3. Upload Documents:</strong> Attach all
                        relevant supporting documentation.
                      </p>
                      <p>
                        <strong>4. Track Progress:</strong> Monitor your appeal
                        status through the dashboard.
                      </p>
                    </div>
                  </div>

                  <div className="bg-green-50 p-6 rounded-lg">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">
                      Frequently Asked Questions
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium text-gray-900">
                          What documents do I need for an appeal?
                        </h5>
                        <p className="text-gray-600 mt-1">
                          You&apos;ll need your original assessment results, any
                          relevant medical certificates, and supporting evidence
                          for your appeal.
                        </p>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900">
                          How long does the appeal process take?
                        </h5>
                        <p className="text-gray-600 mt-1">
                          Typically, appeals are reviewed within 20 working
                          days, though complex cases may take longer.
                        </p>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900">
                          Can I appeal multiple decisions?
                        </h5>
                        <p className="text-gray-600 mt-1">
                          Yes, you can submit separate appeals for different
                          decisions, but each must be submitted individually.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-6 rounded-lg">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">
                      Need More Help?
                    </h4>
                    <p className="text-gray-600 mb-4">
                      If you can&apos;t find the answer you&apos;re looking for,
                      our support team is here to help.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <button
                        onClick={() => setActiveTab("contact")}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md transition-colors"
                      >
                        Contact Support
                      </button>
                      <a
                        href="mailto:appeals@sheffield.ac.uk"
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
                      >
                        Email Support
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "contact" && (
              <div
                id="contact-section"
                className="space-y-8"
                role="tabpanel"
                aria-labelledby="contact-tab"
                aria-hidden="false"
              >
                <h3 className="text-3xl font-bold text-gray-900 text-center mb-8">
                  Contact & Support
                </h3>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h4 className="text-xl font-semibold text-gray-900">
                      Get in Touch
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <svg
                          className="w-6 h-6 text-purple-600 mt-1 mr-3 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        <div>
                          <p className="font-medium text-gray-900">
                            Email Support
                          </p>
                          <p className="text-gray-600">
                            appeals@sheffield.ac.uk
                          </p>
                          <p className="text-sm text-gray-500">
                            Response within 24 hours
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <svg
                          className="w-6 h-6 text-purple-600 mt-1 mr-3 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <div>
                          <p className="font-medium text-gray-900">
                            Phone Support
                          </p>
                          <p className="text-gray-600">+44 (0) 114 222 2000</p>
                          <p className="text-sm text-gray-500">
                            Monday-Friday, 9:00-17:00 GMT
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <svg
                          className="w-6 h-6 text-purple-600 mt-1 mr-3 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <div>
                          <p className="font-medium text-gray-900">
                            In-Person Support
                          </p>
                          <p className="text-gray-600">
                            Student Services Information Desk
                          </p>
                          <p className="text-sm text-gray-500">
                            Level 3, Students&apos; Union Building
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-xl font-semibold text-gray-900">
                      Office Hours
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Monday - Friday</span>
                          <span className="font-medium">9:00 AM - 5:00 PM</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Saturday</span>
                          <span className="font-medium">
                            10:00 AM - 2:00 PM
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Sunday</span>
                          <span className="font-medium">Closed</span>
                        </div>
                      </div>
                    </div>

                    <h4 className="text-xl font-semibold text-gray-900">
                      Emergency Contact
                    </h4>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <p className="text-red-800 text-sm">
                        For urgent matters outside office hours, please contact
                        the University&apos;s 24/7 support line:
                        <strong className="block mt-1">
                          +44 (0) 114 222 4085
                        </strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer onNavigateToSection={handleFooterNavigation} />
    </div>
  );
}
