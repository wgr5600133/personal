import React, {useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import Hls from "hls.js"
import SockJS from "sockjs-client"
import Stomp from "stomp-websocket"
import {Button} from "@material-ui/core";

export const Player = props => {
    const player = useRef();
    const [stompClient,setStompClient] = useState(null);

    const sendToSocket=()=>{
        stompClient.send("/app/videoSync",{},'1')
    }
    const connect=()=>{
       let socket = new SockJS('http://localhost:8080/videoSync');
       let client = Stomp.over(socket);
       console.log(client);
       setStompClient(client);
       stompClient.connect({},(frame)=>{
           console.log("Connected:" + frame);
           stompClient.subscribe('/topic/videoSync',(m)=>{
               console.log(m)
           })
       })
    }
    useEffect(()=>{
        if (Hls.isSupported()){
            let hlt = new Hls();
            hlt.attachMedia(player.current);
            hlt.loadSource(props.video_url);
            console.log(props.video_url)
        }else{
            player.current.innerHTML = "Sorry, your browser does not support M3U8 files.";
        }
    },[props.video_url])

    useEffect(()=>{

    },[stompClient])

    return (
        <div>
            <video id="video-player" ref={player} controls onTimeUpdate={() => console.log(player.current.currentTime)}></video>
            <Button onClick={()=>connect()}>Sync video</Button>
            <Button onClick={()=>sendToSocket()}>test send to socket</Button>
        </div>
    );
};

Player.propTypes = {
    video_url:PropTypes.string
};

