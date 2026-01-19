export function Footer() {
  return (
    <footer id="contact" className="py-16 px-4 border-t border-zinc-800">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Contact
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto">
            프로젝트 협업이나 문의사항이 있으시면 연락해주세요.
          </p>
        </div>

        <div className="flex flex-col items-center gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-600/20 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-brand-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-zinc-500 text-sm">Email</p>
              <p className="text-white font-medium">contact@example.com</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-600/20 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-brand-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-zinc-500 text-sm">Company</p>
              <p className="text-white font-medium">KUSRC</p>
            </div>
          </div>
        </div>

        <div className="text-center pt-8 border-t border-zinc-800">
          <p className="text-zinc-500 text-sm">
            {new Date().getFullYear()} 박현범. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
