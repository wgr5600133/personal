import React, {useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import Hls from "hls.js"
import { v4 as uuidv4 } from 'uuid';
import SockJS from "sockjs-client"
import Stomp from "stomp-websocket"
import {Button} from "@material-ui/core";
import axios from "axios";
import {showToast} from "../../utils/toastUtils";
import {ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export const Player = props => {
    const player = useRef();
    const [stompClient,setStompClient] = useState(null);
    const [id,setId] = useState(uuidv4());
    const [isSync,setIsSync] = useState(false);
    const [isConnected,setIsConnected] = useState(false);
    const [isHost,setIsHost] = useState(false);
    const URL = process.env.REACT_APP_ENV_STATE === 'DEV' ? process.env.REACT_APP_DEV_URL : process.env.REACT_APP_PROD_URL;


    const createPkg = (obj) =>{
        return JSON.stringify({...obj,id:id})
    }

    const setHost=()=>{
        if (stompClient !== null && stompClient.connected) {
            showToast("You are the host now, select video to play","info");
            stompClient.send("/app/setHost", {}, id);
            setIsHost(true);
        }else{
            showToast("Please connect to the websocket server first","error");
        }
    }
    const syncVideoURL = (url) =>{
        if (stompClient !== null && stompClient.connected) {
            let message = createPkg({videoUrl:url});
            stompClient.send("/app/videoSync",{}, message);
        }
    }
    const syncHostSeeked = () => {
        if(isHost){
            player.current.pause();
            syncVideoState("pause");
            syncTime(player.current.currentTime);
        }
    }

    const syncVideoState=(state)=>{
        let message = createPkg({action:state});
        if(stompClient !== null){
            console.log("sending message: ",message);
            stompClient.send("/app/action",{}, message);
        }
    }

    const syncTime = (time)=>{
        let message = createPkg({time:time});
        stompClient.send("/app/time",{}, message);
    }

    const connect=()=>{
       let socket = new SockJS(`${URL}/websocket`);
       setStompClient(Stomp.over(socket));
    }
    useEffect(()=>{
        if (Hls.isSupported()){
            let hlt = new Hls();
            if(isConnected && isHost){
                hlt.attachMedia(player.current);
            }else if(!isConnected){
                hlt.attachMedia(player.current);

            }

            axios.get(
                `${URL}/api/video/getVideoInfo`,
                {params:{videoName:props.videoName}}
            )
            .then((res)=>{
                if (res.data !== ''){
                    let streamLocation = `${URL}/${res.data.steamLocation}`;
                    if(isConnected){
                        if (isHost){
                            console.log("host is sending video url");
                            syncVideoURL(streamLocation);
                            hlt.loadSource(streamLocation);
                        }
                    }else{
                        hlt.loadSource(streamLocation);
                    }
                }
            }).catch((err)=>{
                console.log(err);
            })
        }else{
            player.current.innerHTML = "Sorry, your browser does not support M3U8 files.";
        }
    },[props.videoName])

    useEffect(()=>{
        let t = null;
        if(stompClient !== null){
            stompClient.connect({},()=>{
                setIsConnected(true);
                showToast("Connected to websocket server!!", "success");
            }, () =>{
                setIsConnected(false);
                showToast("Cannot connect to websocket server!!","error");
            })
        }
    },[stompClient])
    useEffect(()=>{
        let t = null;
        if (isConnected){
            setIsSync(true);
            stompClient.subscribe('/topic/videoSync',(m)=>{
                if (m.body !== null){
                    const message = JSON.parse(m.body);
                    if (message.id !== id){
                        let hlt = new Hls();
                        hlt.attachMedia(player.current);
                        hlt.loadSource(message.videoUrl);
                    }
                }
            })
            stompClient.subscribe('/topic/time',(m)=>{
                console.log("receive from server" + m.body);
                if (player.current != null){
                    if (m.body !== null){
                        const message = JSON.parse(m.body);
                        if (message.id !== id && Math.abs(message.time - player.current.currentTime) > 1){
                            player.current.currentTime = message.time;
                        }
                    }
                }
            })
            stompClient.subscribe('/topic/action',(m)=>{
                console.log("receive from server" + m.body);
                if (player.current != null){
                    if (m.body !== null){
                        const message = JSON.parse(m.body);
                        if(message.id !== id){
                            if (message.action === "play"){
                                player.current.play();
                            }else if (message.action === "pause"){
                                player.current.pause();
                            }
                        }
                    }
                }
            })
            t = setInterval(()=>{
                syncTime(player.current.currentTime);
            },1000)
        }else{
            setIsSync(false);
        }
        return ()=>{
            if (t !== null){
                clearInterval(t);
            }
            setIsSync(false);
        }

    },[isConnected])

    return (
        <div>
            <video id="video-player"
                   ref={player}
                   controls
                   onPlay={() => syncVideoState("play")}
                   onPause={() => syncVideoState("pause")}
                   onSeeked={() => syncHostSeeked()}
            />
            <Button onClick={()=>connect()} disabled={isSync}>Sync video</Button>
            <Button onClick={()=>setHost()}>Make this as Host</Button>
            <ToastContainer />
        </div>
    );
};

Player.propTypes = {
    videoName:PropTypes.string
};

