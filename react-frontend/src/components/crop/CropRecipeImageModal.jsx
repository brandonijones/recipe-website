import { React, useState } from 'react';

// Styles
import { DialogActions, DialogContent, Box, Typography, Slider, Button } from '@mui/material';
import { Cancel } from '@mui/icons-material';
import CropIcon from '@mui/icons-material/Crop';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage';

function CropRecipeImageModal(props) {
    const [crop, setCrop] = useState({x: 0, y: 0});
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const cropComplete = (croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }

    const zoomPercent = (value) => {
        return `${Math.round(value * 100)}%`;
    }

    const cropImage = async() => {
        const { file, url } = await getCroppedImg(props.photoURL, croppedAreaPixels, rotation);
        props.setImageURL(url);
        props.setSelectedFile(file);
        props.setShowCropModal(false);
    }

    return (
        <div>
            <DialogContent dividers className='cropper'>
                <Cropper
                    image={props.photoURL}
                    crop={crop}
                    zoom={zoom}
                    rotation={rotation}
                    aspect={1}
                    onZoomChange={setZoom}
                    onRotationChange={setRotation}
                    onCropChange={setCrop}
                    onCropComplete={cropComplete}
                />
            </DialogContent>
            <DialogActions className='my-2 mx-3 cropper-sliders' >
                <Box className='croppper-sliders-container mb-1' >
                    <Box>
                        <Typography>Zoom: {zoomPercent(zoom)} </Typography>
                        <Slider
                            valueLabelDisplay='auto'
                            valueLabelFormat={zoomPercent}
                            min={1}
                            max={3}
                            step={0.1}
                            value={zoom}
                            onChange={(e, zoom) => setZoom(zoom)}
                        />
                    </Box>
                    <Box>
                        <Typography>Rotation: {rotation} </Typography>
                        <Slider
                            valueLabelDisplay='auto'
                            min={0}
                            max={360}
                            value={rotation}
                            onChange={(e, rotation) => setRotation(rotation)}
                        />
                    </Box>
                </Box>
                <Box className='button-container g-2' >
                    <Button
                        variant='outlined'
                        startIcon={<Cancel />}
                        onClick={() => {
                            props.setShowCropModal(false);
                            props.setSelectedFile(null);
                            props.setImageURL(props.defaultImageURL);
                            props.cancelRecipeImageUpdate();
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant='contained'
                        startIcon={<CropIcon />}
                        onClick={cropImage}
                    >
                        Crop
                    </Button>
                </Box>
            </DialogActions>
        </div>
    )
}

export default CropRecipeImageModal;