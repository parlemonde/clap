import { useRouter } from 'next/router';
import React, { useRef, useState } from 'react';
import Camera from 'react-html5-camera-photo';

import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CreateIcon from '@mui/icons-material/Create';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { Backdrop, Button, CircularProgress, Box, Typography } from '@mui/material';
import type { Theme as MaterialTheme } from '@mui/material/styles';

import { PlanUpload } from './PlanUpload';
import { useTranslation } from 'src/i18n/useTranslation';

const styles = {
    verticalLine: {
        backgroundColor: (theme: MaterialTheme) => theme.palette.secondary.main,
        flex: 1,
        width: '1px',
        margin: '0.2rem 0',
    },
    horizontalLine: {
        backgroundColor: (theme: MaterialTheme) => theme.palette.secondary.main,
        flex: 1,
        height: '1px',
        margin: '2rem 1rem',
    },
    secondaryColor: {
        color: (theme: MaterialTheme) => theme.palette.secondary.main,
    },
};

interface PlanEditButtonsProps {
    questionIndex: number;
    planIndex: number;
    submitImageWithUrl?(img: Blob): Promise<void>;
}

export const PlanEditButtons: React.FunctionComponent<PlanEditButtonsProps> = ({
    questionIndex,
    planIndex,
    submitImageWithUrl = async () => {},
}: PlanEditButtonsProps) => {
    const router = useRouter();
    const { t } = useTranslation();

    const inputRef = useRef<HTMLInputElement | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [showCamera, setShowCamera] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleInputchange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files !== null && event.target.files.length > 0) {
            const url = URL.createObjectURL(event.target.files[0]);
            setImageUrl(url);
        } else {
            setImageUrl(null);
        }
    };

    const handleClearInput = () => {
        setImageUrl(null);
        if (inputRef.current !== undefined && inputRef.current !== null) {
            inputRef.current.value = '';
        }
    };

    const submitImage = async (img: Blob) => {
        setIsLoading(true);
        await submitImageWithUrl(img);
        setIsLoading(false);
    };

    const handleDraw = (event: React.MouseEvent) => {
        event.preventDefault();
        router.push(`/create/3-storyboard-and-filming-schedule/draw?question=${questionIndex}&plan=${planIndex}`);
    };

    const toggleShowCamera = (show: boolean) => () => {
        setShowCamera(show);
    };

    const handlePhotoTaken = (imageUri: string) => {
        setTimeout(() => {
            setShowCamera(false);
            setImageUrl(imageUri);
        }, 0);
    };

    let content;
    if (showCamera) {
        content = (
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <Camera onTakePhoto={handlePhotoTaken} isSilentMode={true} />
                <Button variant="outlined" color="secondary" className="mobile-full-width" onClick={toggleShowCamera(false)}>
                    {t('cancel')}
                </Button>
            </div>
        );
    } else if (imageUrl !== null && imageUrl.length > 0) {
        content = <PlanUpload imageUrl={imageUrl} handleClearInput={handleClearInput} handleSubmit={submitImage} />;
    } else {
        content = (
            <React.Fragment>
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                    <Typography color="inherit" variant="h2">
                        {t('part3_plan_edit_title_desktop')}
                    </Typography>
                    <div className="edit-plans-container">
                        <Button
                            variant="outlined"
                            color="secondary"
                            component="label"
                            htmlFor="plan-img-upload"
                            style={{ textTransform: 'none' }}
                            startIcon={<CloudUploadIcon />}
                        >
                            {t('import_image')}
                        </Button>
                        <div className="or-vertical-divider">
                            <Box sx={styles.verticalLine} />
                            <Box component="span" sx={styles.secondaryColor}>
                                {t('or').toUpperCase()}
                            </Box>
                            <Box sx={styles.verticalLine} />
                        </div>
                        <Button
                            variant="outlined"
                            color="secondary"
                            style={{ textTransform: 'none' }}
                            onClick={toggleShowCamera(true)}
                            startIcon={<PhotoCameraIcon />}
                        >
                            {t('take_picture')}
                        </Button>
                        <div className="or-vertical-divider">
                            <Box sx={styles.verticalLine} />
                            <Box component="span" sx={styles.secondaryColor}>
                                {t('or').toUpperCase()}
                            </Box>
                            <Box sx={styles.verticalLine} />
                        </div>
                        <Button
                            component="a"
                            variant="outlined"
                            color="secondary"
                            style={{ textTransform: 'none' }}
                            startIcon={<CreateIcon />}
                            href={`/create/3-storyboard-and-filming-schedule/draw?question=${questionIndex}&plan=${planIndex}`}
                            onClick={handleDraw}
                        >
                            {t('draw_plan')}
                        </Button>
                    </div>
                </Box>
                <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                    <Typography color="inherit" variant="h2">
                        {t('part3_plan_edit_title_mobile')}
                    </Typography>
                    <div className="edit-plans-container-mobile" style={{ marginTop: '1rem' }}>
                        <Button
                            variant="outlined"
                            component="label"
                            htmlFor="plan-img-upload"
                            color="secondary"
                            style={{ textTransform: 'none', width: '100%' }}
                            startIcon={<CloudUploadIcon />}
                        >
                            {t('import_image')}
                        </Button>
                        <div className="or-horizontal-divider">
                            <Box sx={styles.horizontalLine} />
                            <Box component="span" sx={styles.secondaryColor}>
                                {t('or').toUpperCase()}
                            </Box>
                            <Box sx={styles.horizontalLine} />
                        </div>
                        <Button
                            variant="outlined"
                            color="secondary"
                            style={{ textTransform: 'none' }}
                            onClick={toggleShowCamera(true)}
                            startIcon={<PhotoCameraIcon />}
                        >
                            {t('take_picture')}
                        </Button>
                    </div>
                </Box>
            </React.Fragment>
        );
    }

    return (
        <React.Fragment>
            <Backdrop sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, color: '#fff' }} open={isLoading}>
                <CircularProgress color="inherit" />
            </Backdrop>
            {content}
            <input id="plan-img-upload" type="file" accept="image/*" onChange={handleInputchange} ref={inputRef} style={{ display: 'none' }} />
        </React.Fragment>
    );
};
