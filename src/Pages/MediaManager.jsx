import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Typography,
  Grid,
  IconButton,
  TextField,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { styled } from "@mui/system";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadIcon from "@mui/icons-material/Upload";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cropper from 'react-easy-crop';

const Input = styled("input")({
  display: "none",
});


const UploadButton = styled(Button)({
  marginTop: "16px",
  marginBottom: "32px",
  backgroundColor: "#1976d2",
  color: "#fff",
  "&:hover": {
    backgroundColor: "#115293",
  },
});

const SaveButton = styled(Button)({
  marginTop: "16px",
  backgroundColor: "#4caf50",
  color: "#fff",
  "&:hover": {
    backgroundColor: "#388e3c",
  },
});

const StyledCard = styled(Card)({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.03)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
  },
});

function MediaManager() {
  const [mediaEntries, setMediaEntries] = useState([]);
  const [newImage, setNewImage] = useState(null);
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [bannerEntries, setBannerEntries] = useState([]);
  const [bannerImage, setBannerImage] = useState(null);
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerDescription, setBannerDescription] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [newImagePreview, setNewImagePreview] = useState(null);
  const [bannerImagePreview, setBannerImagePreview] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [cropType, setCropType] = useState(null);
  const [aspect, setAspect] = useState(16 / 9);
  const accessToken = localStorage.getItem("accessToken");
  const backendUrl = import.meta.env.VITE_BACK_END_URL;

  useEffect(() => {
    fetchMediaData();
  }, []);


  const fetchMediaData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/api/media/all`);
      console.log("Media data", response.data);
      setMediaEntries(response.data);
    } catch (error) {
      console.error("Error fetching media data", error);
      toast.error("Failed to fetch media data");
    }
  };

  const handleImageUploadChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setNewImagePreview(reader.result);
        setIsCropping(true);
        setCropType('media');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUrlChange = (event) => {
    setNewVideoUrl(event.target.value);
  };

  const handleBannerImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setBannerImagePreview(reader.result);
        setIsCropping(true);
        setCropType('banner');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerTitleChange = (event) => {
    setBannerTitle(event.target.value);
  };

  const handleBannerDescriptionChange = (event) => {
    setBannerDescription(event.target.value);
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);


  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = new Image();
    image.src = imageSrc;
    const canvas = document.createElement('canvas');
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );


    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(URL.createObjectURL(blob));
      }, 'image/jpeg');
    });
  };

  const handleCropSave = async () => {
    try {
      const croppedImageUrl = await getCroppedImg(
        cropType === 'media' ? newImagePreview : bannerImagePreview,
        croppedAreaPixels
      );
      if (cropType === 'media') {
        setNewImage(croppedImageUrl);
        setNewImagePreview(croppedImageUrl);
      } else {
        setBannerImage(croppedImageUrl);
        setBannerImagePreview(croppedImageUrl);
      }
      setIsCropping(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveMedia = async () => {
    if (!newImage && !newVideoUrl) {
      toast.error("Please upload an image or enter a video URL");
      return;
    }

    const formData = new FormData();

    if (newImage) {
      const response = await fetch(newImage);
      const blob = await response.blob();
      formData.append("images", blob, "image.jpg");
    }

    if (newVideoUrl) {
      formData.append("videoUrl", newVideoUrl);
    }

    try {
      const response = await axios.post(`${backendUrl}/api/api/media/add`, formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setMediaEntries((prevEntries) => [...prevEntries, response.data]);
      setNewImage(null);
      setNewImagePreview(null);
      setNewVideoUrl("");
      toast.success("Media saved successfully");
      fetchMediaData();
    } catch (error) {
      console.error("Error saving media data", error);
      toast.error("Failed to save media");
    }
  };


  const handleSaveBanner = () => {
    if (!bannerImage || !bannerTitle || !bannerDescription) {
      toast.error("Please fill all banner fields");
      return;
    }

    const newBanner = {
      id: Date.now(),
      imageUrl: bannerImagePreview,
      title: bannerTitle,
      description: bannerDescription,
    };

    setBannerEntries((prevEntries) => [...prevEntries, newBanner]);
    console.log("New banner added:", newBanner);

    setBannerImage(null);
    setBannerImagePreview(null);
    setBannerTitle("");
    setBannerDescription("");
    toast.success("Banner saved successfully");
  };

  const handleDeleteMedia = async (id) => {
    try {
      await axios.delete(`${backendUrl}/api/api/media/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setMediaEntries((prevEntries) =>
        prevEntries.filter((entry) => entry.id !== id)
      );
      toast.success("Media deleted successfully");
    } catch (error) {
      console.error("Error deleting media", error);
      toast.error("Failed to delete media");
    }
  };

  const handleDeleteBanner = (id) => {
    setBannerEntries((prevEntries) =>
      prevEntries.filter((entry) => entry.id !== id)
    );
    console.log("Banner deleted:", id);
    toast.success("Banner deleted successfully");
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAspectChange = (event) => {
    setAspect(parseFloat(event.target.value));
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", color: '#333' }}>
        Media Management
      </Typography>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Media Upload" />
        <Tab label="Banner Upload" />
      </Tabs>

      {isCropping && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ width: '80%', height: '80%', backgroundColor: 'white', borderRadius: '8px', p: 3, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Crop Image</Typography>
            <FormControl sx={{ mb: 2, minWidth: 120 }}>
              <InputLabel id="aspect-ratio-label">Aspect Ratio</InputLabel>
              <Select
                labelId="aspect-ratio-label"
                value={aspect}
                label="Aspect Ratio"
                onChange={handleAspectChange}
              >
                <MenuItem value={1}>1:1</MenuItem>
                <MenuItem value={16/9}>16:9</MenuItem>
                <MenuItem value={4/3}>4:3</MenuItem>
                <MenuItem value={3/2}>3:2</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ position: 'relative', width: '100%', height: 'calc(100% - 100px)' }}>
              <Cropper
                image={cropType === 'media' ? newImagePreview : bannerImagePreview}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button onClick={() => setIsCropping(false)} sx={{ mr: 2 }}>Cancel</Button>
              <Button variant="contained" onClick={handleCropSave}>Save</Button>
            </Box>
          </Box>
        </Box>
      )}

      {tabValue === 0 && (
        <Box sx={{ backgroundColor: '#fff', p: 4, borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", mb: 3 }}>
            Add New Media
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Upload Image
              </Typography>
              <label htmlFor="upload-image-button">
                <Input
                  accept="image/*"
                  id="upload-image-button"
                  type="file"
                  onChange={handleImageUploadChange}
                />
                <UploadButton
                  variant="contained"
                  component="span"
                  startIcon={<UploadIcon />}
                >
                  Select Image
                </UploadButton>
              </label>
              {newImagePreview && (
                <Box sx={{ mt: 2 }}>
                  <img src={newImagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }} />
                </Box>
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Video URL
              </Typography>
              <TextField
                fullWidth
                value={newVideoUrl}
                onChange={handleVideoUrlChange}
                placeholder="Enter video URL"
                sx={{ mb: 2 }}
              />
              <SaveButton variant="contained" onClick={handleSaveMedia} fullWidth>
                Save Media
              </SaveButton>
            </Grid>
          </Grid>
        </Box>
      )}

      {tabValue === 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", mb: 3 }}>
            Media Entries
          </Typography>
          <Grid container spacing={3}>
            {mediaEntries.map((media, index) => (
              <Grid item xs={12} sm={6} md={4} key={media.id}>
                <StyledCard>
                  <CardMedia
                    component="img"
                    height="140"
                    image={JSON.parse(media.images)[0]?.url || 'https://via.placeholder.com/300x140'}
                    alt={`Media ${index + 1}`}
                  />
                  <CardContent>
                    <Typography variant="h6" component="div">
                      Media Entry {index + 1}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Video URL: {media.videoUrl || 'N/A'}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleDeleteMedia(media.id)}
                      startIcon={<DeleteIcon />}
                    >
                      Delete
                    </Button>
                  </CardActions>
                </StyledCard>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {tabValue === 1 && (
        <Box sx={{ backgroundColor: '#fff', p: 4, borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", mb: 3 }}>
            Add New Banner
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Upload Banner Image
              </Typography>
              <label htmlFor="upload-banner-image">
                <Input
                  accept="image/*"
                  id="upload-banner-image"
                  type="file"
                  onChange={handleBannerImageChange}
                />
                <UploadButton
                  variant="contained"
                  component="span"
                  startIcon={<UploadIcon />}
                >
                  Select Banner Image
                </UploadButton>
              </label>
              {bannerImagePreview && (
                <Box sx={{ mt: 2 }}>
                  <img src={bannerImagePreview} alt="Banner Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }} />
                </Box>
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                value={bannerTitle}
                onChange={handleBannerTitleChange}
                placeholder="Enter banner title"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                value={bannerDescription}
                onChange={handleBannerDescriptionChange}
                placeholder="Enter banner description"
                multiline
                rows={4}
                sx={{ mb: 2 }}
              />
              <SaveButton variant="contained" onClick={handleSaveBanner} fullWidth>
                Save Banner
              </SaveButton>
            </Grid>
          </Grid>
        </Box>
      )}

      {tabValue === 1 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", mb: 3 }}>
            Banner Entries
          </Typography>
          <Grid container spacing={3}>
            {bannerEntries.map((banner, index) => (
              <Grid item xs={12} sm={6} md={4} key={banner.id}>
                <StyledCard>
                  <CardMedia
                    component="img"
                    height="140"
                    image={banner.imageUrl || 'https://via.placeholder.com/300x140'}
                    alt={`Banner ${index + 1}`}
                  />
                  <CardContent>
                    <Typography variant="h6" component="div">
                      {banner.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {banner.description}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleDeleteBanner(banner.id)}
                      startIcon={<DeleteIcon />}
                    >
                      Remove
                    </Button>
                  </CardActions>
                </StyledCard>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
}

export default MediaManager;