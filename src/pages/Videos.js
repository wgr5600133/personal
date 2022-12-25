import React, {useEffect, useState} from 'react';
import {Player} from "../components/player/Player";
import axios from "axios";
export const Videos = () => {
    const [url, setUrl] = useState("");
    const [videoNameList, setVideoNameList] = useState([]);
    const URL = process.env.REACT_APP_ENV_STATE === 'DEV' ? process.env.REACT_APP_DEV_URL : process.env.REACT_APP_PROD_URL;

    useEffect(()=>{
        axios.get(`${URL}/api/video/getAllVideos`)
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

