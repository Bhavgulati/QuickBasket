import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './index.css' // ✅ Make sure you’re importing Tailwind here

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="flex justify-center gap-6 py-4">
        <a href="https://vite.dev" target="_blank" rel="noreferrer">
          <img src={viteLogo} className="w-24 hover:scale-110 transition" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="w-24 hover:scale-110 transition" alt="React logo" />
        </a>
      </div>
      <h1 className="text-4xl font-bold text-center text-blue-600">Vite + React + Tailwind</h1>
      <div className="card text-center mt-6">
        <button
          onClick={() => setCount((count) => count + 1)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          count is {count}
        </button>
        <p className="mt-4 text-gray-700">
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs text-center mt-6 text-gray-500">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
