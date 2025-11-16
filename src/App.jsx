import Hero from './components/Hero'
import Game from './components/Game'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Hero />
      <Game />
      <footer className="mt-auto py-8 text-center text-sm text-gray-500">
        Feito com carinho — inspirado em Super Mario Bros (fan-made)
      </footer>
    </div>
  )
}

export default App
