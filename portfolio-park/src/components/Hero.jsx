export function Hero() {
  // 무신사 스타일 지하철 이미지 사용
  const hasSubwayImage = true;

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Subway Background Image or CSS Fallback */}
      {hasSubwayImage ? (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/subway.webp')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </div>
      ) : (
        <>
          {/* Metallic Subway Door Style Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#2a2a2a] via-[#3d3d3d] to-[#1a1a1a]" />

          {/* Subway door frame effect - left */}
          <div className="absolute left-0 top-0 bottom-0 w-[15%] bg-gradient-to-r from-[#4a4a4a] via-[#5a5a5a] to-[#3a3a3a] opacity-80">
            <div className="absolute inset-y-0 right-0 w-2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>

          {/* Subway door frame effect - right */}
          <div className="absolute right-0 top-0 bottom-0 w-[15%] bg-gradient-to-l from-[#4a4a4a] via-[#5a5a5a] to-[#3a3a3a] opacity-80">
            <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-l from-transparent via-white/10 to-transparent" />
          </div>

          {/* Metallic horizontal lines */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-[20%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
            <div className="absolute top-[40%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
            <div className="absolute top-[60%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
            <div className="absolute top-[80%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
          </div>

          {/* Brushed metal texture */}
          <div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(90deg,transparent,transparent_1px,rgba(255,255,255,0.03)_1px,rgba(255,255,255,0.03)_2px)]" />

          {/* Gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
        </>
      )}

      <div className="relative z-10 max-w-[960px] mx-auto px-5 text-center py-20">
        {/* Badge */}
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-white text-black text-sm font-bold rounded mb-8 animate-fade-up">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3AB449] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3AB449]"></span>
          </span>
          Backend · Salesforce · DevOps
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 animate-fade-up stagger-1 tracking-tight text-white">
          박현범
        </h1>

        <p className="text-xl md:text-2xl text-gray-300 font-medium mb-4 animate-fade-up stagger-2">
          Backend · Salesforce · DevOps Engineer
        </p>

        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-up stagger-3">
          실서비스 <span className="text-white font-semibold">2개 운영</span> ·
          MSA 아키텍처 설계 ·
          CI/CD 파이프라인 구축
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-12 animate-fade-up stagger-4">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
            <p className="text-3xl font-black text-white">2</p>
            <p className="text-gray-400 text-xs mt-1">Live Services</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
            <p className="text-3xl font-black text-white">1.7<span className="text-lg">년</span></p>
            <p className="text-gray-400 text-xs mt-1">Experience</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
            <p className="text-3xl font-black text-white">4</p>
            <p className="text-gray-400 text-xs mt-1">Certifications</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up stagger-5">
          <a
            href="#projects"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black font-bold rounded hover:bg-gray-100 transition-all"
          >
            <span>프로젝트 보기</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </a>
          <a
            href="https://www.venus-eshop.co.kr/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#3AB449] text-white font-bold rounded hover:brightness-[0.94] transition-all"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <span>Live 서비스</span>
          </a>
        </div>

        {/* Quick Links */}
        <div className="mt-16 flex items-center justify-center gap-6 animate-fade-up stagger-6">
          <a
            href="https://github.com/ParkHyeonBeom"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">GitHub</span>
          </a>
          <span className="w-px h-4 bg-gray-600" />
          <a
            href="https://dokhakbaksa.tistory.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-sm font-medium">Tech Blog</span>
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
