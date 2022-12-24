import React, {useState} from 'react';
import { Button, Input, LinearProgress,Box, WithStyles,Container  } from '@material-ui/core';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// TODO: fix the style of this page
export const VideoUpload = props => {
    const [selectedVideo,setVideo] = useState()
    const [progress, setProgress] = React.useState(0);
    const [uploading, setUploading] = useState(false);
    const [chunkSize, setChunkSize] = useState(1024 * 1024);

    const handleFileSelection = (event) => {
        setVideo(event.target.files[0]);
    }
    const handleUpload = () => {
        const fileReader  = new FileReader();
        let offset = 0;
        const fileSize = selectedVideo.size;
        const videoName = selectedVideo.name;
        const id = uuidv4();


        fileReader.onload = (event) => {
            const chunk = event.target.result;
            console.log(chunk)
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

            axios.post('https://www.muma.icu/api/video/uploadChuckVideo',formData,{
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
                    }
                }).catch((err)=>{
                    console.log(err);
                }
            )
        }
        readChunk(offset);
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
