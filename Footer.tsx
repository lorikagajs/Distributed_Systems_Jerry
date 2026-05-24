import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-400">
      {/* Top section */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link to="/" className="text-xl font-extrabold tracking-tight text-white">
              Shop<span className="text-indigo-400">Hub</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed">
              Your one-stop destination for everything you need, delivered fast.
            </p>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-300">
              Company
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="transition hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="transition hover:text-white">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/careers" className="transition hover:text-white">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-300">
              Support
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/faq" className="transition hover:text-white">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/returns" className="transition hover:text-white">
                  Returns
                </Link>
              </li>
              <li>
                <Link to="/orders" className="transition hover:text-white">
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-300">
              Legal
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/terms" className="transition hover:text-white">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="transition hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="transition hover:text-white">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-xs">
            &copy; {year} ShopHub. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs">
            <Link to="/terms" className="transition hover:text-white">
              Terms
            </Link>
            <Link to="/privacy" className="transition hover:text-white">
              Privacy
            </Link>
            <Link to="/contact" className="transition hover:text-white">
              Contact
            </Link>
            <Link to="/about" className="transition hover:text-white">
              About
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
