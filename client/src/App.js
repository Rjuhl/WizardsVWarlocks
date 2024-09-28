import './App.css';
import Router from './components/router'
import Context from './components/providers/context'
import Online from './components/providers/online';
import { useState } from 'react'

function App() {
  const [userInfo, setUserInfo] = useState('')
  const [online, setOnline] = useState(false)

  return (
    <Online.Provider value={[online, setOnline]}>
      <Context.Provider value={[userInfo, setUserInfo]}>
        <Router />
      </Context.Provider>
    </Online.Provider>
  );
}

export default App;
