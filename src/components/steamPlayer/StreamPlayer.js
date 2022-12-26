import React from 'react';
import PropTypes from 'prop-types';
import ReactPlayer from 'react-player';

export const StreamPlayer = props => {
    return (
        <div>
            <ReactPlayer url="https://www.muma.icu/hls/obs_stream.m3u8" controls width="300" height="300" autoPlay/>
        </div>
    );
};

StreamPlayer.propTypes = {

};