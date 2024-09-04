import './App.css';
import Router from './components/router'
import Context from './components/context'
import { useState } from 'react'

function App() {
  const [userInfo, setUserInfo] = useState('')

  return (
    <Context.Provider value={[userInfo, setUserInfo]}>
      <Router />
    </Context.Provider>
  );
}

export default App;
