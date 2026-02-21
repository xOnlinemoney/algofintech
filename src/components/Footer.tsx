import {
  Cpu,
  Mail,
  Phone,
  MapPin,
  Clock,
  Linkedin,
  Twitter,
  Youtube,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#020408] border-t border-white/5 pt-16 pb-8 font-sans text-slate-400">
      <div className="max-w-7xl mx-auto px-6">
        {/* Newsletter */}
        <div className="flex flex-col lg:flex-row gap-12 justify-between items-start pb-16 border-b border-white/5 mb-16">
          <div className="max-w-lg">
            <h3 className="text-xl font-semibold text-white tracking-tight mb-2">
              Stay ahead of the market
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Get the latest algorithm releases, platform updates, and industry
              insights delivered to your inbox.
            </p>
            <form className="flex gap-2 max-w-sm">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-600" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full bg-[#0B0E14] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                />
              </div>
              <button
                type="button"
                className="bg-white text-black hover:bg-slate-200 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                Subscribe
              </button>
            </form>
            <p className="text-[10px] text-slate-600 mt-3">
              We respect your privacy. Unsubscribe anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-12 w-full lg:w-auto">
            <ContactItem
              icon={<Mail className="w-4 h-4" />}
              label="Email Support"
              value="support@algostack.com"
              href="mailto:support@algostack.com"
            />
            <ContactItem
              icon={<Phone className="w-4 h-4" />}
              label="Phone"
              value="+1 (888) 123-4567"
              href="tel:+18881234567"
            />
            <ContactItem
              icon={<MapPin className="w-4 h-4" />}
              label="Location"
              value="100 Financial District, NY"
            />
            <ContactItem
              icon={<Clock className="w-4 h-4" />}
              label="Business Hours"
              value="Mon-Fri, 9AM-6PM EST"
            />
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 mb-16">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Cpu className="text-white w-4 h-4" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                AlgoStack
              </span>
            </div>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              The leading white-label solution for algorithmic trading firms.
              Launch in days, scale for years.
            </p>
            <div className="flex gap-4 mb-8">
              <SocialIcon icon={<Linkedin className="w-4 h-4" />} />
              <SocialIcon icon={<Twitter className="w-4 h-4" />} />
              <SocialIcon icon={<Youtube className="w-4 h-4" />} />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
              <span className="text-[10px] font-medium text-blue-400">
                Trusted by 500+ Agency Partners
              </span>
            </div>
          </div>

          <FooterColumn
            title="Algorithms"
            links={[
              "Crypto Engines",
              "Futures Scalping",
              "Forex Mean Reversion",
              "Stock Equities",
            ]}
          />
          <FooterColumn
            title="Platform"
            links={[
              "Infrastructure",
              "Security & Compliance",
              "API Documentation",
              "White-Label Solutions",
            ]}
          />
          <FooterColumn
            title="Partnership"
            links={[
              "Become a Partner",
              "Pricing Models",
              "Partner Portal",
              "Marketing Assets",
            ]}
          />
          <FooterColumn
            title="Company"
            links={["About Us", "Careers", "Press & Media", "Contact Support"]}
          />
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600 mb-12">
          <div>&copy; 2025 AlgoStack Inc. All rights reserved.</div>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service", "Cookie Settings", "Sitemap"].map(
              (item, i) => (
                <span key={item} className="flex items-center gap-6">
                  {i > 0 && <span className="text-slate-700">|</span>}
                  <a href="#" className="hover:text-slate-400 transition-colors">
                    {item}
                  </a>
                </span>
              )
            )}
          </div>
        </div>

        {/* Risk Disclaimer */}
        <div className="bg-[#050609] rounded-xl p-6 border border-white/5 text-[10px] leading-relaxed text-slate-500 text-justify">
          <h5 className="text-slate-400 font-bold mb-2 uppercase tracking-wider text-[11px]">
            Risk Disclosure &amp; Important Information
          </h5>
          <div className="space-y-3 opacity-80 hover:opacity-100 transition-opacity">
            <p>
              Futures, forex, cryptocurrency, and stock trading involves
              substantial risk of loss and is not suitable for all investors.
              The high degree of leverage that is often obtainable in commodity
              interest trading can work against you as well as for you. Past
              performance is not necessarily indicative of future results.
            </p>
            <p>
              Hypothetical performance results have many inherent limitations.
              No representation is being made that any account will or is likely
              to achieve profits or losses similar to those shown.
            </p>
            <p>
              AlgoStack does not provide investment, legal, or tax advice. The
              information provided on this website and platform is for
              educational and informational purposes only and should not be
              construed as financial advice.
            </p>
            <p>
              Automated trading systems are subject to technology failures,
              network outages, and programming errors. No algorithm can guarantee
              profits or prevent losses.
            </p>
            <p className="mt-4 pt-2 text-[9px] text-slate-600 border-t border-white/5">
              Software and Technology Disclaimer: The software is provided
              &quot;as is&quot; without warranty of any kind. | Last Updated:
              December 2024
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function ContactItem({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 text-blue-400">
        {icon}
      </div>
      <div>
        <div className="text-xs font-semibold text-white uppercase tracking-wider mb-0.5">
          {label}
        </div>
        {href ? (
          <a
            href={href}
            className="text-sm hover:text-blue-400 transition-colors"
          >
            {value}
          </a>
        ) : (
          <span className="text-sm">{value}</span>
        )}
      </div>
    </div>
  );
}

function SocialIcon({ icon }: { icon: React.ReactNode }) {
  return (
    <a
      href="#"
      className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white hover:text-black hover:border-white transition-all text-slate-400"
    >
      {icon}
    </a>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: string[];
}) {
  return (
    <div>
      <h4 className="text-white font-semibold mb-6">{title}</h4>
      <ul className="space-y-3 text-sm">
        {links.map((link) => (
          <li key={link}>
            <a href="#" className="hover:text-white transition-colors">
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
