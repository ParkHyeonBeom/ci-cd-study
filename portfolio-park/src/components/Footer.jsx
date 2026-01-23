export function Footer() {
  return (
    <footer id="contact" className="py-20 px-5 bg-black text-white">
      <div className="max-w-[960px] mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-bold rounded mb-6">
            Contact
          </div>
          <h2 className="text-3xl md:text-5xl font-black mb-4">
            연락처
          </h2>
          <p className="text-gray-400 text-lg">
            협업 문의는 아래로 연락해주세요
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {/* Email */}
          <a
            href="mailto:sqja0213@kusrc.co.kr"
            className="flex flex-col items-center gap-4 p-8 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all group"
          >
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-1">Email</p>
              <p className="text-white font-bold">sqja0213@kusrc.co.kr</p>
            </div>
          </a>

          {/* GitHub */}
          <a
            href="https://github.com/ParkHyeonBeom"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-4 p-8 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all group"
          >
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-1">GitHub</p>
              <p className="text-white font-bold">ParkHyeonBeom</p>
            </div>
          </a>

          {/* Blog */}
          <a
            href="https://dokhakbaksa.tistory.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-4 p-8 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all group"
          >
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-1">Tech Blog</p>
              <p className="text-white font-bold">dokhakbaksa.tistory.com</p>
            </div>
          </a>
        </div>

        {/* Bottom */}
        <div className="text-center pt-8 border-t border-white/10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-gray-400">현재 재직</span>
            <span className="text-white font-bold">KUSRC</span>
          </div>
          <p className="text-gray-600 text-sm">
            {new Date().getFullYear()} 박현범 Portfolio
          </p>
        </div>
      </div>
    </footer>
  );
}
