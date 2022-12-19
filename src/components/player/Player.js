import React, {useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import Hls from "hls.js"
import { v4 as uuidv4 } from 'uuid';
import SockJS from "sockjs-client"
import Stomp from "stomp-websocket"
import {Button} from "@material-ui/core";

export const Player = props => {
    const player = useRef();
    const [stompClient,setStompClient] = useState(null);
    const [timer,setTimer] = useState(null);
    const [id,setId] = useState(uuidv4());

    const createPkg = (obj) =>{
        return JSON.stringify({...obj,id:id})
    }

    const setHost=()=>{
        console.log("This is the host");
        if (stompClient !== null) {
            stompClient.send("/app/setHost", {}, id);
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
       let socket = new SockJS('http://localhost:8080/websocket');
       setStompClient(Stomp.over(socket));
    }
    useEffect(()=>{
        if (Hls.isSupported()){
            let hlt = new Hls();
            hlt.attachMedia(player.current);
            hlt.loadSource(props.video_url);
            if (stompClient != null){
                console.log(props.video_url);
                let message = createPkg({videoUrl:props.video_url});
                stompClient.send("/app/videoSync",{}, message);
            }
        }else{
            player.current.innerHTML = "Sorry, your browser does not support M3U8 files.";
        }
    },[props.video_url])

    useEffect(()=>{
        if(timer != null){
            clearInterval(timer);
            setTimer(null);
        }
        if(stompClient !== null){
            stompClient.connect({},(frame)=>{
                console.log("Connected:" + frame);
                stompClient.subscribe('/topic/videoSync',(m)=>{
                    console.log("receive from server" + m.body);
                    let hlt = new Hls();
                    hlt.attachMedia(player.current);
                    if (m.body !== null){
                        hlt.loadSource(JSON.parse(m.body).videoUrl);
                    }
                })
                stompClient.subscribe('/topic/time',(m)=>{
                    console.log("receive from server" + m.body);
                    if (player.current != null){
                        if (m.body !== null){
                            let hostTime = JSON.parse(m.body).time;
                            if (Math.abs(hostTime - player.current.currentTime) > 1){
                                player.current.currentTime = hostTime;
                            }
                        }
                    }
                })
                stompClient.subscribe('/topic/action',(m)=>{
                    console.log("receive from server" + m.body);
                    if (player.current != null){
                        if (m.body !== null){
                            let action = JSON.parse(m.body).action;
                            if (action === "play"){
                                player.current.play();
                            }else if (action === "pause"){
                                player.current.pause();
                            }
                        }
                    }
                })

            })
            let t = setInterval(()=>{
                syncTime(player.current.currentTime);
            },1000)
            setTimer(t);
        }
    },[stompClient])

    return (
        <div>
            <video id="video-player"
                   ref={player}
                   controls
                   onPlay={() => syncVideoState("play")}
                   onPause={() => syncVideoState("pause")}
            />
            <Button onClick={()=>connect()}>Sync video</Button>
            <Button onClick={()=>setHost()}>Make this as Host</Button>
        </div>
    );
};

Player.propTypes = {
    video_url:PropTypes.string
};

