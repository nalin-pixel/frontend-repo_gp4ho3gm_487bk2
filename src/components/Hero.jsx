import Spline from '@splinetool/react-spline'

export default function Hero() {
  return (
    <section className="relative h-[70vh] w-full overflow-hidden">
      <div className="absolute inset-0">
        <Spline
          scene="https://prod.spline.design/OIGfFUmCnZ3VD8gH/scene.splinecode"
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-white pointer-events-none" />
      <div className="relative z-10 h-full flex items-center justify-center text-center px-6">
        <div className="max-w-3xl">
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white drop-shadow-md">
            Aventuras no Mundo do Mario
          </h1>
          <p className="mt-4 text-white/90 text-lg sm:text-xl">
            Corra, pule e colete moedas neste minijogo inspirado em Super Mario Bros.
          </p>
          <a href="#jogo" className="inline-block mt-8 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 py-3 rounded-lg transition-colors">
            Jogar agora
          </a>
        </div>
      </div>
    </section>
  )
}
