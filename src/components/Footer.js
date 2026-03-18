import Link from "next/link";

export default function Footer({ onNavigateToSection }) {
  return (
    <footer
      className="bg-gray-800 text-white py-12 px-4 sm:px-6 lg:px-8"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Student Appeal Manager
            </h3>
            <p className="text-gray-300 text-sm">
              Streamlining academic appeals at the University of Sheffield with
              transparency and efficiency.
            </p>
          </div>
          <nav aria-label="Quick links">
            <h4 className="text-md font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-300" role="list">
              <li>
                <Link
                  href="/"
                  className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 rounded"
                  aria-label="Go to homepage"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 rounded"
                  aria-label="Login to your account"
                >
                  Login
                </Link>
              </li>
              <li>
                {onNavigateToSection ? (
                  <button
                    onClick={() => onNavigateToSection("help")}
                    className="hover:text-white transition-colors text-left w-full bg-transparent border-none p-0 text-gray-300 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 rounded"
                    aria-label="Go to help and support section"
                  >
                    Help
                  </button>
                ) : (
                  <Link
                    href="/#help"
                    className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 rounded"
                    aria-label="Go to help and support section"
                  >
                    Help
                  </Link>
                )}
              </li>
              <li>
                {onNavigateToSection ? (
                  <button
                    onClick={() => onNavigateToSection("contact")}
                    className="hover:text-white transition-colors text-left w-full bg-transparent border-none p-0 text-gray-300 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 rounded"
                    aria-label="Go to contact section"
                  >
                    Contact
                  </button>
                ) : (
                  <Link
                    href="/#contact"
                    className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 rounded"
                    aria-label="Go to contact section"
                  >
                    Contact
                  </Link>
                )}
              </li>
            </ul>
          </nav>
          <nav aria-label="Support links">
            <h4 className="text-md font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-300" role="list">
              <li>
                <a
                  href="mailto:appeals@sheffield.ac.uk"
                  className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 rounded"
                  aria-label="Send email to appeals support"
                >
                  Email Support
                </a>
              </li>
              <li>
                <a
                  href="tel:+441142222000"
                  className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 rounded"
                  aria-label="Call phone support"
                >
                  Phone Support
                </a>
              </li>
              <li>
                {onNavigateToSection ? (
                  <button
                    onClick={() => onNavigateToSection("help")}
                    className="hover:text-white transition-colors text-left w-full bg-transparent border-none p-0 text-gray-300 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 rounded"
                    aria-label="Go to frequently asked questions"
                  >
                    FAQ
                  </button>
                ) : (
                  <Link
                    href="/#help"
                    className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 rounded"
                    aria-label="Go to frequently asked questions"
                  >
                    FAQ
                  </Link>
                )}
              </li>
            </ul>
          </nav>
          <nav aria-label="University links">
            <h4 className="text-md font-semibold mb-4">University</h4>
            <ul className="space-y-2 text-sm text-gray-300" role="list">
              <li>
                <a
                  href="https://www.sheffield.ac.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 rounded"
                  aria-label="Visit University of Sheffield website (opens in new tab)"
                >
                  University Website
                </a>
              </li>
              <li>
                <a
                  href="https://www.sheffield.ac.uk/students"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 rounded"
                  aria-label="Visit student portal (opens in new tab)"
                >
                  Student Portal
                </a>
              </li>
              <li>
                <a
                  href="https://sheffield.ac.uk/saas"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 rounded"
                  aria-label="Visit student services (opens in new tab)"
                >
                  Student Services
                </a>
              </li>
            </ul>
          </nav>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-300">
          <p>&copy; 2025 University of Sheffield. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
