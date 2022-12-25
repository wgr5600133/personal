import React, {useState} from 'react';
import { Button, Input, LinearProgress,Box, WithStyles,Container  } from '@material-ui/core';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import {showToast} from "../../utils/toastUtils";
import {toast, ToastContainer} from "react-toastify";

export const VideoUpload = props => {
    const [selectedVideo,setVideo] = useState()
    const [progress, setProgress] = React.useState(0);
    const [uploading, setUploading] = useState(false);
    const [chunkSize, setChunkSize] = useState(1024 * 1024);
    const URL = process.env.REACT_APP_ENV_STATE === 'DEV' ? process.env.REACT_APP_DEV_URL : process.env.REACT_APP_PROD_URL;

    const handleFileSelection = (event) => {
        setVideo(event.target.files[0]);
    }
    const handleUpload = () => {
        const fileReader  = new FileReader();
        let offset = 0;
        const fileSize = selectedVideo.size;
        const videoName = selectedVideo.name;
        const id = uuidv4();
        setUploading(true);
        const toastID = showToast("Uploading video, please wait","info");

        fileReader.onload = (event) => {
            const chunk = event.target.result;
            offset += chunk.byteLength;
            uploadChunks(offset,chunk)
        }
        // read the next chunk
        const readChunk = (offset) => {
            const slice = selectedVideo.slice(offset, offset + chunkSize);
            fileReader.readAsArrayBuffer(slice);
        }
        // upload the chunks to the server
        const uploadChunks = (offset,chunk) => {
            const formData = new FormData();
            formData.append('file',new Blob([chunk], { type: selectedVideo.type}));
            formData.append('fileName',videoName);
            formData.append('offset',offset);
            formData.append('fileSize',fileSize);
            formData.append('id',id);

            axios.post(`${URL}/api/video/uploadChuckVideo`,formData,{
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Content-Disposition': `attachment; filename="${videoName}"`
                },
                onUploadProgress: (progressEvent) => {
                    const currentChunk = Math.round(offset / fileSize * 100);
                    setProgress(currentChunk);
                }
            }
            ).then((res)=>{
                    console.log(res.data);
                    if (offset < fileSize) {
                        readChunk(offset);
                        toast.update(toastID, {autoClose: false,closeOnClick: false, render: `Uploading video, please wait!! Progress ${Math.round(offset / fileSize * 100)}%` });
                    }else{
                        toast.update(toastID, {autoClose: 5000, render: "Video uploaded successfully", type: toast.TYPE.SUCCESS});
                    }
                }).catch((err)=>{
                    toast.update(toastID, {autoClose: 5000, render: "Video upload failed", type: toast.TYPE.ERROR});
                    console.log(err);
                }
            )
        }
        readChunk(offset);
        setUploading(false);
    }


    return (
        <Container maxWidth="md">
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={1} m={1}>
                <Input type="file" onChange={(e)=>handleFileSelection(e)} />
            </Box>
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={1} m={1}>
                <Button variant="contained" color="primary" onClick={()=>handleUpload()} disabled={uploading}>
                    Upload Video
                </Button>
            </Box>
            <LinearProgress variant="determinate" value={progress} />
            <ToastContainer/>
        </Container>
    );
};

VideoUpload.propTypes = {

};
