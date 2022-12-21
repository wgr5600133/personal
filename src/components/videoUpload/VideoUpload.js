import React, {useState} from 'react';
import { Button, Input, LinearProgress,Box, WithStyles,Container  } from '@material-ui/core';
import axios from 'axios';

// TODO: fix the style of this page
export const VideoUpload = props => {
    const [selectedVideo,setVideo] = useState()
    const [progress, setProgress] = React.useState(0);
    const handleFileSelection = (event) => {
        setVideo(event.target.files[0]);
    }
    const handleUpload = () => {
        const formData = new FormData();
        formData.append('videoName', selectedVideo.name);
        formData.append('file', selectedVideo);


        axios.post('http://localhost/api/video/uploadVideo', formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            },
            onUploadProgress: (axiosProgressEvent)=>{
                setProgress(axiosProgressEvent.progress * 100)
                console.log(axiosProgressEvent.progress);
                console.log(axiosProgressEvent.estimated)
            }
        })
            .then(data => console.log(data))
            .catch(error => console.log(error));
    }


    return (
        <Container maxWidth="md">
            <Input type="file" onChange={(e)=>handleFileSelection(e)} />
            <Button variant="contained" color="primary" onClick={()=>handleUpload()}>
                Upload Video
            </Button>
            <LinearProgress variant="determinate" value={progress} />
        </Container>
    );
};

VideoUpload.propTypes = {

};
