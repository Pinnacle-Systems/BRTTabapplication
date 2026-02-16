import { useNavigate } from "react-router-dom";
import io from 'socket.io-client';
import { useEffect, useMemo } from "react";
import { getCommonParams } from "../Utils/helper";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

console.log(BASE_URL, 'url');


const socket = io.connect(BASE_URL);

export const loginSocket = (user) => {

    console.log(user, 'user');
    socket.emit(`login`, { user });
}

export const useLogout = () => {
    const { user } = useMemo(() => getCommonParams(), [])

    let navigate = useNavigate();
    useEffect(() => {
        socket.on('connect', () => {
            console.log("connected")
        });

        socket.on('disconnect', () => {
            console.log("disconnect")
        });
        socket.on(`logout/${user}`, () => {
            console.log("logout", user)
            const removeKeys = [];
            let len = localStorage.length;
            for (let i = 0; i < len; ++i) {
                if (localStorage.key(i).split(".").length === 3) {
                    if (
                        localStorage
                            .key(i)
                            .split(".")[2]
                            .startsWith(sessionStorage.getItem("sessionId"))
                    ) {
                        removeKeys.push(localStorage.key(i));
                    }
                }
            }
            for (let i of removeKeys) {
                localStorage.removeItem(i);
            }
            sessionStorage.removeItem("sessionId");
            navigate('/');
            window.location.reload()
        })
        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off(`/${user}`);
        }
    }, [])

};

export default useLogout;