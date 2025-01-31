import { useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import Context from '../components/providers/context'
import Online from '../components/providers/online';
import socket from '../socket'

const useOnlineStatus = () => {
    const location = useLocation();
    const [online, setOnline] = useContext(Online)
    const [userInfo, setUserInfo] = useContext(Context)
    let sentUpdate = false

    useEffect(() => {
        if (userInfo !== null && location.pathname !== '/' && !online && !sentUpdate) {
            socket.connect()
            socket.emit('userOnline', userInfo.username, userInfo.password)
            setOnline(true)
            sentUpdate = true
        }

        if (userInfo !== null && location.pathname === '/' && online && !sentUpdate) {
            socket.emit('userOffline', userInfo.username)
            setUserInfo(null)
            setOnline(false)
            sentUpdate = true
            socket.disconnect()
        }

        const handleBeforeUnload = () => {
            if (userInfo !== null) {
                socket.emit('userOffline', userInfo.username)
                socket.disconnect()
            }
         }

        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        }
    }, [location, userInfo])
}

export default useOnlineStatus