"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "../../components/Footer";
import { useAuth } from "../../contexts/AuthContext";

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    studentId: "",
    department: "",
  });
  const [errors, setErrors] = useState({});
  const router = useRouter();
  const { login, register, error: authError, clearError } = useAuth();

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setErrors({});
    clearError();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (authError) {
      clearError();
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else {
      const password = formData.password;
      const errors = [];

      // Check minimum length
      if (password.length < 8) {
        errors.push("at least 8 characters");
      }

      // Check for uppercase letter
      if (!/[A-Z]/.test(password)) {
        errors.push("one uppercase letter");
      }

      // Check for lowercase letter
      if (!/[a-z]/.test(password)) {
        errors.push("one lowercase letter");
      }

      // Check for special character
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push("one special character");
      }

      // Check if password contains first name or last name
      if (
        formData.firstName &&
        password.toLowerCase().includes(formData.firstName.toLowerCase())
      ) {
        errors.push("not contain your first name");
      }
      if (
        formData.lastName &&
        password.toLowerCase().includes(formData.lastName.toLowerCase())
      ) {
        errors.push("not contain your last name");
      }

      if (errors.length > 0) {
        newErrors.password = `Password must contain ${errors.join(", ")}`;
      }
    }

    if (!isLogin) {
      if (!formData.firstName) newErrors.firstName = "First name is required";
      if (!formData.lastName) newErrors.lastName = "Last name is required";

      if (selectedRole === "student" && !formData.studentId) {
        newErrors.studentId = "Student ID is required";
      }

      if (selectedRole === "admin" && !formData.department) {
        newErrors.department = "Department is required";
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    if (!selectedRole) {
      newErrors.role = "Please select a role";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (isLogin) {
        await login({
          email: formData.email,
          password: formData.password,
          role: selectedRole,
        });

        if (selectedRole === "student") {
          router.push("/student");
        } else if (selectedRole === "admin") {
          router.push("/admin");
        } else if (selectedRole === "reviewer") {
          router.push("/reviewer");
        }
      } else {
        const userData = {
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: selectedRole,
          ...(selectedRole === "student" && { studentId: formData.studentId }),
          ...(selectedRole === "admin" && { department: formData.department }),
        };

        await register(userData);
        if (selectedRole === "student") {
          router.push("/student");
        } else if (selectedRole === "admin") {
          router.push("/admin");
        } else if (selectedRole === "reviewer") {
          router.push("/reviewer");
        }
      }
    } catch (error) {}
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      studentId: "",
      department: "",
    });
    setErrors({});
    clearError();
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-purple-600 text-white px-4 py-2 rounded z-50"
      >
        Skip to main content
      </a>

      <main
        id="main-content"
        className="flex flex-col justify-center py-12 sm:px-6 lg:px-8"
        role="main"
        aria-label="Login and registration form"
      >
        <header className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to SAM
            </h1>
            <p className="text-gray-600 mb-8">Student Appeal Manager</p>
          </div>
        </header>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="flex justify-center mb-6">
              <div
                className="flex bg-gray-100 rounded-lg p-1"
                role="tablist"
                aria-label="Authentication mode"
              >
                <button
                  onClick={toggleMode}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                    isLogin
                      ? "bg-white text-purple-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  role="tab"
                  aria-selected={isLogin}
                  aria-controls="signin-panel"
                  id="signin-tab"
                >
                  Sign In
                </button>
                <button
                  onClick={toggleMode}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                    !isLogin
                      ? "bg-white text-purple-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  role="tab"
                  aria-selected={!isLogin}
                  aria-controls="signup-panel"
                  id="signup-tab"
                >
                  Register
                </button>
              </div>
            </div>

            <form
              className="space-y-6"
              onSubmit={handleSubmit}
              role="tabpanel"
              aria-labelledby={isLogin ? "signin-tab" : "signup-tab"}
              id={isLogin ? "signin-panel" : "signup-panel"}
              aria-hidden={false}
            >
              <fieldset>
                <legend
                  id="role-legend"
                  className="block text-sm font-medium text-gray-700 mb-3"
                >
                  Select Your Role
                </legend>
                <div
                  className="space-y-3"
                  role="radiogroup"
                  aria-labelledby="role-legend"
                >
                  {[
                    {
                      id: "student",
                      label: "Student",
                      description: "Submit and track appeals",
                      icon: "👨‍🎓",
                    },
                    {
                      id: "admin",
                      label: "Administrative Staff",
                      description: "Manage cases and communications",
                      icon: "👨‍💼",
                    },
                    {
                      id: "reviewer",
                      label: "Academic Reviewer",
                      description: "Review and provide decisions",
                      icon: "👨‍🏫",
                    },
                  ].map((role) => (
                    <div
                      key={role.id}
                      className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 focus-within:ring-2 focus-within:ring-purple-500 focus-within:ring-offset-2 ${
                        selectedRole === role.id
                          ? "border-purple-600 bg-purple-50"
                          : "border-gray-200 hover:border-purple-300 hover:bg-gray-50"
                      }`}
                      onClick={() => handleRoleSelect(role.id)}
                      role="radio"
                      aria-checked={selectedRole === role.id}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleRoleSelect(role.id);
                        }
                      }}
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <span className="text-2xl">{role.icon}</span>
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center">
                            <input
                              type="radio"
                              name="role"
                              value={role.id}
                              checked={selectedRole === role.id}
                              onChange={() => handleRoleSelect(role.id)}
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                              aria-describedby={`${role.id}-description`}
                            />
                            <label className="ml-2 block text-sm font-medium text-gray-900">
                              {role.label}
                            </label>
                          </div>
                          <p
                            id={`${role.id}-description`}
                            className="text-sm text-gray-500 mt-1"
                          >
                            {role.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {errors.role && (
                  <p
                    className="mt-1 text-sm text-red-600"
                    role="alert"
                    aria-live="polite"
                  >
                    {errors.role}
                  </p>
                )}
              </fieldset>

              {!isLogin && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.firstName}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  {selectedRole === "student" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Student ID
                      </label>
                      <input
                        type="text"
                        name="studentId"
                        value={formData.studentId}
                        onChange={handleInputChange}
                        placeholder="e.g., 12345678"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                      />
                      {errors.studentId && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.studentId}
                        </p>
                      )}
                    </div>
                  )}

                  {selectedRole === "admin" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Department
                      </label>
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                      >
                        <option value="">Select Department</option>
                        <option value="student-administration">
                          Student Administration
                        </option>
                        <option value="academic-services">
                          Academic Services
                        </option>
                        <option value="student-support">Student Support</option>
                        <option value="examinations">Examinations</option>
                      </select>
                      {errors.department && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.department}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                  aria-describedby={errors.email ? "email-error" : undefined}
                  aria-invalid={!!errors.email}
                  required
                />
                {errors.email && (
                  <p
                    id="email-error"
                    className="mt-1 text-sm text-red-600"
                    role="alert"
                    aria-live="polite"
                  >
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                {!isLogin && (
                  <p className="mt-1 text-xs text-gray-500">
                    Must be at least 8 characters with uppercase, lowercase,
                    special character, and not contain your name
                  </p>
                )}
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="mt-1 block w-full pr-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                    aria-describedby={
                      errors.password ? "password-error" : undefined
                    }
                    aria-invalid={!!errors.password}
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    title={showPassword ? "Hide password" : "Show password"}
                    aria-controls="password"
                  >
                    {showPassword ? (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p
                    id="password-error"
                    className="mt-1 text-sm text-red-600"
                    role="alert"
                    aria-live="polite"
                  >
                    {errors.password}
                  </p>
                )}
              </div>

              {!isLogin && (
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="mt-1 block w-full pr-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                      aria-describedby={
                        errors.confirmPassword
                          ? "confirmPassword-error"
                          : undefined
                      }
                      aria-invalid={!!errors.confirmPassword}
                      required
                    />
                    <button
                      type="button"
                      onClick={toggleConfirmPasswordVisibility}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded"
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                      title={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                      aria-controls="confirmPassword"
                    >
                      {showConfirmPassword ? (
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p
                      id="confirmPassword-error"
                      className="mt-1 text-sm text-red-600"
                      role="alert"
                      aria-live="polite"
                    >
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              )}

              {(errors.general || authError) && (
                <div
                  className="bg-red-50 border border-red-200 rounded-md p-4"
                  role="alert"
                  aria-live="polite"
                >
                  <p className="text-sm text-red-600">
                    {errors.general || authError}
                  </p>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={!selectedRole}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  aria-describedby={!selectedRole ? "role-required" : undefined}
                >
                  {isLogin ? "Sign In" : "Create Account"}
                </button>
                {!selectedRole && (
                  <p
                    id="role-required"
                    className="mt-1 text-sm text-gray-500 text-center"
                  >
                    Please select a role to continue
                  </p>
                )}
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    System Information
                  </span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  This is a demonstration system for the University of
                  Sheffield&apos;s Student Appeal Manager (SAM).
                  <br />
                  All data is simulated for testing purposes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
