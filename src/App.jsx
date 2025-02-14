import { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Container, 
  Typography, 
  Paper, 
  Grid,
  ThemeProvider,
  createTheme,
  CircularProgress,
  Fade,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  useMediaQuery,
  Switch,
  FormControlLabel
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import html2canvas from 'html2canvas';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import ShareIcon from '@mui/icons-material/Share';
import InstagramIcon from '@mui/icons-material/Instagram';
import SnapchatIcon from '@mui/icons-material/PhotoCamera';
import TwitterIcon from '@mui/icons-material/Twitter';
import FacebookIcon from '@mui/icons-material/Facebook';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

const getTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: '#ff69b4',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: mode === 'dark' ? '#121212' : '#fce4ec',
      paper: mode === 'dark' ? '#1e1e1e' : '#fff5f8',
    },
    text: {
      primary: mode === 'dark' ? '#fff' : '#213547',
      secondary: mode === 'dark' ? '#b0b0b0' : '#666666',
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      color: mode === 'dark' ? '#ff8ec7' : '#ff69b4',
      textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
    },
  },
});

const customTheme = getTheme('light');

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const rotate = keyframes`
  0% {
    transform: rotate(-2deg);
  }
  50% {
    transform: rotate(2deg);
  }
  100% {
    transform: rotate(-2deg);
  }
`;

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: '15px',
  boxShadow: '0 8px 32px rgba(255, 105, 180, 0.15)',
  animation: `${fadeIn} 0.6s ease-out`,
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
}));

const PhotoStrip = styled(Box)(({ theme }) => ({
  width: '300px',
  minHeight: '600px',
  backgroundColor: '#fff',
  padding: theme.spacing(2),
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  border: '15px solid #fff',
  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
    pointerEvents: 'none',
  },
  animation: `${rotate} 6s infinite ease-in-out`,
  transform: 'rotate(-3deg)',
}));

const PhotoFrame = styled(Box)(({ theme, filter }) => ({
  width: '100%',
  height: '200px',
  backgroundColor: '#f5f5f5',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  position: 'relative',
  borderRadius: '4px',
  border: '1px solid rgba(0,0,0,0.1)',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(120deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)',
    pointerEvents: 'none',
  },
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    filter: filter || 'none',
    transition: 'filter 0.3s ease',
  },
}));

const UploadButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #ff69b4 30%, #ff8ec7 90%)',
  border: 0,
  borderRadius: 50,
  boxShadow: '0 3px 5px 2px rgba(255, 105, 180, .3)',
  color: 'white',
  height: 48,
  padding: '0 30px',
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const filterOptions = {
  vintage: 'sepia(0.5) contrast(1.2)',
  retro: 'grayscale(0.5) contrast(1.1) brightness(1.1)',
  classic: 'contrast(1.1) brightness(1.1)',
  modern: 'none',
};

function App() {
  const [photos, setPhotos] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState('vintage');
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [photoStripUrl, setPhotoStripUrl] = useState(null);
  const stripRef = useRef(null);
  const isMobile = useMediaQuery('(max-width:600px)');
  const db = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

  const theme = getTheme(darkMode ? 'dark' : 'light');

  const handlePhotoUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length < 3) {
      alert('Please upload at least 3 photos!');
      return;
    }

    const imagePromises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    });

    const images = await Promise.all(imagePromises);
    setPhotos(images.slice(0, 3));
    setGenerated(false);

    // Save photos to IndexedDB
    try {
      const request = db.open('photos', 1);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        db.createObjectStore('photos', { keyPath: 'id', autoIncrement: true });
      };
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction('photos', 'readwrite');
        const store = transaction.objectStore('photos');
        images.slice(0, 3).forEach((photo) => {
          store.add({ photo });
        });
        transaction.oncomplete = () => {
          db.close();
        };
      };
    } catch (error) {
      console.error('Error saving photos:', error);
    }
  };

  const generatePhotoStrip = async () => {
    if (photos.length < 3) {
      alert('Please upload at least 3 photos first');
      return;
    }

    try {
      const stripContainer = stripRef.current;
      const canvas = await html2canvas(stripContainer);
      const photoStripImage = canvas.toDataURL('image/jpeg');

      // Save the photo strip to IndexedDB
      try {
        const request = db.open('photos', 1);
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          db.createObjectStore('photos', { keyPath: 'id', autoIncrement: true });
        };
        request.onsuccess = (event) => {
          const db = event.target.result;
          const transaction = db.transaction('photos', 'readwrite');
          const store = transaction.objectStore('photos');
          store.add({ photo: photoStripImage });
          transaction.oncomplete = () => {
            db.close();
          };
        };
      } catch (error) {
        console.error('Error saving photo strip:', error);
      }

      // Auto-download the photo strip
      const link = document.createElement('a');
      link.href = photoStripImage;
      link.download = `photo-strip-${new Date().toISOString().slice(0, 10)}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setGenerated(true);
    } catch (error) {
      console.error('Error generating photo strip:', error);
      alert('Failed to generate photo strip');
    }
  };

  const handleShare = async (platform) => {
    if (!generated) {
      alert('Please generate a photo strip first');
      return;
    }

    try {
      const stripContainer = stripRef.current;
      const canvas = await html2canvas(stripContainer);
      const photoStripUrl = canvas.toDataURL('image/jpeg');
      const blob = await (await fetch(photoStripUrl)).blob();
      const file = new File([blob], 'photo-strip.jpg', { type: 'image/jpeg' });

      switch (platform) {
        case 'instagram':
          if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            window.location.href = 'instagram://camera';
          } else {
            window.open('https://instagram.com');
          }
          break;
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`);
          break;
        case 'twitter':
          // Convert the blob to a data URL for Twitter
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => {
            const base64data = reader.result;
            // Twitter Web Intent with media
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out my photo strip!')}&url=${encodeURIComponent(window.location.href)}&media=${encodeURIComponent(base64data)}`);
          };
          break;
        case 'whatsapp':
          window.open(`https://wa.me/?text=${encodeURIComponent('Check out my photo strip!')}`);
          break;
        default:
          if (navigator.share) {
            try {
              await navigator.share({
                files: [file],
                title: 'My Photo Strip',
                text: 'Check out my photo strip!',
              });
            } catch (error) {
              console.error('Error sharing:', error);
            }
          }
      }
    } catch (error) {
      console.error('Error preparing photo for sharing:', error);
    }
  };

  const shareActions = [
    { icon: <InstagramIcon />, name: 'Instagram', action: () => handleShare('instagram') },
    { icon: <SnapchatIcon />, name: 'Snapchat', action: () => handleShare('snapchat') },
    { icon: <TwitterIcon />, name: 'Twitter', action: () => handleShare('twitter') },
    { icon: <FacebookIcon />, name: 'Facebook', action: () => handleShare('facebook') },
    { icon: <WhatsAppIcon />, name: 'WhatsApp', action: () => handleShare('whatsapp') },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md" sx={{ 
        py: 4, 
        backgroundColor: 'background.default', 
        minHeight: '100vh',
        transition: 'background-color 0.3s ease' 
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h1" align="center" gutterBottom>
            Vintage Photo Booth
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
                icon={<LightModeIcon />}
                checkedIcon={<DarkModeIcon />}
              />
            }
            label={darkMode ? "Dark Mode" : "Light Mode"}
          />
        </Box>
        
        <StyledPaper>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <UploadButton
                  variant="contained"
                  component="label"
                  fullWidth
                  startIcon={<CameraAltIcon />}
                >
                  Upload Photos
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                  />
                </UploadButton>
                
                <FormControl fullWidth>
                  <InputLabel>Photo Style</InputLabel>
                  <Select
                    value={selectedTheme}
                    onChange={(e) => setSelectedTheme(e.target.value)}
                    label="Photo Style"
                  >
                    <MenuItem value="vintage">Vintage</MenuItem>
                    <MenuItem value="retro">Retro</MenuItem>
                    <MenuItem value="classic">Classic</MenuItem>
                    <MenuItem value="modern">Modern</MenuItem>
                  </Select>
                </FormControl>

                <Typography variant="body1" gutterBottom sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
                  Upload at least 3 photos to create your vintage photo strip!
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Fade in={true} timeout={1000}>
                <Box>
                  <PhotoStrip ref={stripRef}>
                    {photos.slice(0, 3).map((photo, index) => (
                      <PhotoFrame key={index} filter={filterOptions[selectedTheme]}>
                        <img src={photo} alt={`Photo ${index + 1}`} />
                      </PhotoFrame>
                    ))}
                    {photos.length < 3 && Array(3 - photos.length).fill(null).map((_, index) => (
                      <PhotoFrame key={`empty-${index}`}>
                        <Typography variant="body2" color="text.secondary">
                          Upload Photo {photos.length + index + 1}
                        </Typography>
                      </PhotoFrame>
                    ))}
                  </PhotoStrip>
                </Box>
              </Fade>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              variant="contained"
              onClick={generatePhotoStrip}
              disabled={photos.length < 3 || loading}
              sx={{
                minWidth: 200,
                background: 'linear-gradient(45deg, #ff69b4 30%, #ff8ec7 90%)',
                boxShadow: '0 3px 5px 2px rgba(255, 105, 180, .3)',
                borderRadius: 50,
                '&:hover': {
                  transform: 'scale(1.05)',
                },
                transition: 'transform 0.2s ease',
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Generate Photo Strip'}
            </Button>
            
            {generated && (
              <Fade in={generated}>
                <Typography variant="body2" color="success.main" sx={{ mt: 2 }}>
                  Photo strip generated! Check your downloads folder
                </Typography>
              </Fade>
            )}
          </Box>
        </StyledPaper>
        
        {generated && (
          <SpeedDial
            ariaLabel="Share photo strip"
            sx={{ position: 'fixed', bottom: 16, right: 16 }}
            icon={<SpeedDialIcon openIcon={<ShareIcon />} />}
          >
            {shareActions.map((action) => (
              <SpeedDialAction
                key={action.name}
                icon={action.icon}
                tooltipTitle={action.name}
                onClick={action.action}
              />
            ))}
          </SpeedDial>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;
