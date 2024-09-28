import { useEffect, useContext, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Context from '../components/providers/context'
import Online from '../components/providers/online';
import io from 'socket.io-client';

const socket = io('http://localhost:4000')

const useOnlineStatus = () => {
    const location = useLocation();
    const [online, setOnline] = useContext(Online)
    const [userInfo, setUserInfo] = useContext(Context)
    let sentUpdate = false

    useEffect(() => {
        if (userInfo !== null && location.pathname !== '/' && !online && !sentUpdate) {
            socket.emit('userOnline', userInfo.username)
            setOnline(true)
            sentUpdate = true
        }

        if (userInfo !== null && location.pathname === '/' && online && !sentUpdate) {
            socket.emit('userOffline', userInfo)
            setUserInfo(null)
            setOnline(false)
            sentUpdate = true
        }

        const handleBeforeUnload = () => {
            if (userInfo !== null) {
                console.log('unloaded')
                socket.emit('userOffline', userInfo.username);
            }
         }

        //Needs testing with backend socket 
        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        }
    }, [location, userInfo])
}

export default useOnlineStatus