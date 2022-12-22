import React, {useEffect, useState} from 'react';
import {Player} from "../components/player/Player";
import axios from "axios";
export const Videos = () => {
    const [url, setUrl] = useState("");
    const [videoNameList, setVideoNameList] = useState([]);
    useEffect(()=>{
        axios.get("https://www.muma.icu/api/video/getAllVideos")
            .then((res)=>{
              if(res.data !== ''){
                  let videoList = res.data.map((video)=>{
                      return video.name;
                  })
                  setVideoNameList(videoList);
              }else{
                  setVideoNameList([]);
              }
            })
    },[]);
    return (
        <div>
            <Player videoName={url}/>
            <ul>
                {
                    videoNameList.map((videoName,index)=>{
                        return <li key={index} onClick={()=>setUrl(videoName)}>{index + "."}{videoName}</li>
                    })
                }
            </ul>

        </div>
    );
};

