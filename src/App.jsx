// App.jsx
import React, { useState } from 'react';
import { ClipLoader } from 'react-spinners';
import Game from './Game';
import './App.css';

function App() {
  const [loading, setLoading] = useState(true);

  setTimeout(() => {
    setLoading(false);
  }, 5000);

  return (
    <>
      {loading ? (
        <div className="loading">
          <ClipLoader color="#36d7b7" size={50} />
        </div>
      ) : (
        <Game />
      )}
    </>
  )
}

export default App;