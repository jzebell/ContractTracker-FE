import React from 'react';
import './App.css';
import LCATManagement from './components/LCAT/LCATManagement';

function App() {
  return (
    <div className="App">
      <header className="bg-blue-900 text-white p-4">
        <h1 className="text-2xl font-bold">Contract Financial Tracker</h1>
      </header>
      <main className="container mx-auto">
        <LCATManagement />
      </main>
    </div>
  );
}

export default App;