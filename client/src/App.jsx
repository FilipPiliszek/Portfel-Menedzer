import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold text-blue-600 underline">
          Tailwind dziala
        </h1>
      </div>
    </>
  )
}

export default App
