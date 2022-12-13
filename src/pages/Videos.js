import React, {useEffect, useState} from 'react';
import {Player} from "../components/player/Player";
export const Videos = () => {
    const [tmp_url, setTmpUrl] = useState("");
    const [url, setUrl] = useState("");
    return (
        <div>
            <Player video_url={url}/>
            <input onChange={(evt)=>setTmpUrl(evt.target.value)}></input>
            <button onClick={()=>setUrl(tmp_url)}>submit</button>
        </div>
    );
};

