/**
 * Accessibility utility functions for the Student Appeal Manager
 * Provides common accessibility helpers and ARIA utilities
 */

/**
 * Announce a message to screen readers
 * @param {string} message - The message to announce
 * @param {string} priority - 'polite' or 'assertive'
 */
export const announceToScreenReader = (message, priority = "polite") => {
  const announcement = document.createElement("div");
  announcement.setAttribute("aria-live", priority);
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Focus management for modals and dialogs
 * @param {HTMLElement} element - The element to focus
 * @param {boolean} trap - Whether to trap focus within the element
 */
export const manageFocus = (element, trap = false) => {
  if (!element) return;

  element.focus();

  if (trap) {
    const previouslyFocused = document.activeElement;

    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            lastFocusable.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            firstFocusable.focus();
            e.preventDefault();
          }
        }
      }
    };

    element.addEventListener("keydown", handleTabKey);

    return () => {
      element.removeEventListener("keydown", handleTabKey);
      if (previouslyFocused) {
        previouslyFocused.focus();
      }
    };
  }
};

/**
 * Generate unique IDs for form elements
 * @param {string} prefix - The prefix for the ID
 * @returns {string} - A unique ID
 */
export const generateId = (prefix = "element") => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Validate color contrast ratio
 * @param {string} foreground - Foreground color (hex)
 * @param {string} background - Background color (hex)
 * @returns {number} - Contrast ratio
 */
export const getContrastRatio = (foreground, background) => {
  const getLuminance = (color) => {
    const rgb = parseInt(color.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;

    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const lum1 = getLuminance(foreground);
  const lum2 = getLuminance(background);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
};

/**
 * Check if color combination meets WCAG AA standards
 * @param {string} foreground - Foreground color (hex)
 * @param {string} background - Background color (hex)
 * @param {string} size - Text size ('normal' or 'large')
 * @returns {boolean} - Whether it meets WCAG AA standards
 */
export const meetsWCAGAA = (foreground, background, size = "normal") => {
  const ratio = getContrastRatio(foreground, background);
  const requiredRatio = size === "large" ? 3 : 4.5;
  return ratio >= requiredRatio;
};

/**
 * Format status for screen readers
 * @param {string} status - The status value
 * @returns {string} - Formatted status for screen readers
 */
export const formatStatusForScreenReader = (status) => {
  const statusMap = {
    submitted: "Submitted",
    "under review": "Under review",
    "awaiting information": "Awaiting information",
    "decision made": "Decision made",
    resolved: "Resolved",
    rejected: "Rejected",
  };

  return statusMap[status] || status;
};

/**
 * Format priority for screen readers
 * @param {string} priority - The priority value
 * @returns {string} - Formatted priority for screen readers
 */
export const formatPriorityForScreenReader = (priority) => {
  const priorityMap = {
    low: "Low priority",
    medium: "Medium priority",
    high: "High priority",
    urgent: "Urgent priority",
  };

  return priorityMap[priority] || priority;
};

/**
 * Create accessible error message
 * @param {string} message - Error message
 * @param {string} fieldId - ID of the field with error
 * @returns {Object} - Error object with accessibility attributes
 */
export const createAccessibleError = (message, fieldId) => {
  const errorId = generateId("error");

  return {
    id: errorId,
    message,
    attributes: {
      role: "alert",
      "aria-live": "polite",
      "aria-describedby": fieldId,
    },
  };
};

/**
 * Keyboard navigation helpers
 */
export const keyboardNavigation = {
  handleEnterKey: (callback) => (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      callback();
    }
  },

  handleArrowKeys: (options, currentIndex, setIndex) => (e) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setIndex(Math.min(currentIndex + 1, options.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setIndex(Math.max(currentIndex - 1, 0));
        break;
      case "Enter":
      case " ":
        e.preventDefault();

        break;
    }
  },
};

/**
 * Screen reader only text utility
 */
export const srOnly = {
  className: "sr-only",
  styles: {
    position: "absolute",
    width: "1px",
    height: "1px",
    padding: "0",
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    border: "0",
  },
};

/**
 * Focus visible utility for better focus indicators
 */
export const focusVisible = {
  className: "focus-visible",
  styles: {
    outline: "2px solid #8b5cf6",
    outlineOffset: "2px",
  },
};

const accessibilityUtils = {
  announceToScreenReader,
  manageFocus,
  generateId,
  getContrastRatio,
  meetsWCAGAA,
  formatStatusForScreenReader,
  formatPriorityForScreenReader,
  createAccessibleError,
  keyboardNavigation,
  srOnly,
  focusVisible,
};

export default accessibilityUtils;
