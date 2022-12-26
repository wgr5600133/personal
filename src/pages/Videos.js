import React, {useEffect, useState} from 'react';
import {Player} from "../components/player/Player";
import axios from "axios";
import {Avatar, Container, IconButton, List, ListItem, ListItemAvatar, ListItemText} from "@material-ui/core";
import {secondary} from "../components/theme/Themes";
export const Videos = () => {
    const [url, setUrl] = useState("");
    const [videoNameList, setVideoNameList] = useState([]);
    const URL = process.env.REACT_APP_ENV_STATE === 'DEV' ? process.env.REACT_APP_DEV_URL : process.env.REACT_APP_PROD_URL;
    const generate = (element) =>{
        return [0, 1, 2].map((value) =>
            React.cloneElement(element, {
                key: value,
            }),
        );
    }
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
            <Container maxWidth="md">
                <Player videoName={url}/>
                <List>
                    {
                        videoNameList.map((videoName,index)=> {
                            return (
                                <ListItem key={index} button >
                                    <ListItemAvatar onClick={()=>setUrl(videoName)}>
                                        <Avatar>
                                            <IconButton>
                                                <i className="fas fa-play-circle"></i>
                                            </IconButton>
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText primary={videoName} onClick={()=>setUrl(videoName)}/>
                                    <Avatar onClick={()=>{console.log("delete")}}>
                                        <IconButton>
                                            <i className="fas fa-trash-alt"></i>
                                        </IconButton>
                                    </Avatar>
                                </ListItem>
                            )
                        })
                    }

                </List>
            </Container>

        </div>
    );
};

