import {
  Container,
  Typography,
  Box,
  IconButton,
  Avatar,
  useTheme,
  useMediaQuery,
  AppBar,
  Toolbar,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Button,
  MobileStepper,
  ButtonGroup,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  AccountCircle,
  ExitToApp,
  Search,
  ShoppingCart,
  Favorite,
  LocalOffer,
  History,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  ArrowForward,
} from '@mui/icons-material';
import { SearchProvider } from '../contexts/SearchContext';
import { SearchBar } from '../components/Search/SearchBar';
import { SearchResults } from '../components/Search/SearchResults';
import { useSearch } from '../contexts/SearchContext';
import { useState, useCallback, memo } from 'react';
import { useSwipeable } from 'react-swipeable';

const ITEMS_PER_PAGE = 4;

type CarouselType = 'favorites' | 'recent' | 'promotions';

const SectionHeader = memo(({ icon: Icon, title, onClick }: { icon: any, title: string, onClick: () => void }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Icon color="primary" />
      <Typography variant="h6">{title}</Typography>
    </Box>
    <Button
      endIcon={<ArrowForward />}
      onClick={onClick}
      sx={{ textTransform: 'none' }}
    >
      Ver todos
    </Button>
  </Box>
));

const ProductCard = memo(({ item, type }: { item: number, type: 'dessert' | 'cake' | 'pastry' }) => (
  <Card sx={{ 
    maxWidth: { sm: 250 }, // Fixed width on desktop
    width: '100%', // Full width of grid cell on mobile
  }}>
    <CardActionArea>
      <CardMedia
        component="img"
        height="140"
        image={`https://picsum.photos/seed/${type}-${item}/400`}
        alt={`${type} ${item}`}
      />
      <CardContent>
        <Typography variant="subtitle2" noWrap>
          {type === 'dessert' ? `Produto Favorito ${item}` :
           type === 'cake' ? `Pedido Recente ${item}` :
           `Promoção ${item}`}
        </Typography>
      </CardContent>
    </CardActionArea>
  </Card>
));

const CarouselSection = memo(({ 
  items, 
  currentStep, 
  setCurrentStep, 
  renderItem, 
  maxSteps 
}: { 
  items: number[], 
  currentStep: number, 
  setCurrentStep: (step: number) => void, 
  renderItem: (item: number) => React.ReactNode,
  maxSteps: number
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const itemsPerPage = isMobile ? 4 : ITEMS_PER_PAGE;
  const visibleItems = items.slice(currentStep * itemsPerPage, (currentStep + 1) * itemsPerPage);
  
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (currentStep < maxSteps - 1) {
        setCurrentStep(currentStep + 1);
      }
    },
    onSwipedRight: () => {
      if (currentStep > 0) {
        setCurrentStep(currentStep - 1);
      }
    },
    trackMouse: true,
    preventScrollOnSwipe: true,
  });

  return (
    <Box>
      <Box {...handlers} sx={{
        display: 'flex',
        gap: 2,
        overflowX: 'hidden',
        position: 'relative',
        maxWidth: { sm: 'calc((250px * 4) + (16px * 3))' }, // 4 items of 250px + 3 gaps of 16px
        mx: { sm: 'auto' },
      }}>
        <Box sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)', // 2 columns on mobile
            sm: 'repeat(4, 1fr)', // 4 columns on desktop
          },
          width: '100%',
        }}>
          {visibleItems.map(renderItem)}
        </Box>
      </Box>
      <MobileStepper
        steps={Math.ceil(items.length / itemsPerPage)}
        position="static"
        activeStep={currentStep}
        sx={{ 
          background: 'transparent', 
          mt: 2,
          maxWidth: { sm: 'calc((250px * 4) + (16px * 3))' },
          mx: 'auto',
        }}
        nextButton={
          <IconButton
            size="small"
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={currentStep === maxSteps - 1}
          >
            <KeyboardArrowRight />
          </IconButton>
        }
        backButton={
          <IconButton
            size="small"
            onClick={() => setCurrentStep(currentStep - 1)}
            disabled={currentStep === 0}
          >
            <KeyboardArrowLeft />
          </IconButton>
        }
      />
    </Box>
  );
});

const HomeContent = () => {
  const navigate = useNavigate();
  const [activeCarousel, setActiveCarousel] = useState<CarouselType>('favorites');
  const [favoriteStep, setFavoriteStep] = useState(0);
  const [recentStep, setRecentStep] = useState(0);
  const [promoStep, setPromoStep] = useState(0);

  const favorites = Array.from({ length: 12 }, (_, i) => i + 1);
  const recentOrders = Array.from({ length: 8 }, (_, i) => i + 1);
  const promotions = Array.from({ length: 16 }, (_, i) => i + 1);

  const carouselConfig = {
    favorites: {
      icon: Favorite,
      title: "Seus Favoritos",
      items: favorites,
      step: favoriteStep,
      setStep: setFavoriteStep,
      type: 'dessert' as const,
      path: '/favorites'
    },
    recent: {
      icon: History,
      title: "Produtos Recentes",
      items: recentOrders,
      step: recentStep,
      setStep: setRecentStep,
      type: 'cake' as const,
      path: '/orders'
    },
    promotions: {
      icon: LocalOffer,
      title: "Promoções",
      items: promotions,
      step: promoStep,
      setStep: setPromoStep,
      type: 'pastry' as const,
      path: '/promotions'
    }
  };

  const currentCarousel = carouselConfig[activeCarousel];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ 
        width: '100%', 
        display: 'flex', 
        justifyContent: 'center',
        px: 1
      }}>
        <ButtonGroup 
          variant="outlined" 
          sx={{ 
            maxWidth: '100%',
            '& .MuiButton-root': {
              textTransform: 'none',
              px: 3,
            }
          }}
        >
          <Button
            startIcon={<Favorite />}
            onClick={() => setActiveCarousel('favorites')}
            color={activeCarousel === 'favorites' ? 'primary' : 'inherit'}
            variant={activeCarousel === 'favorites' ? 'contained' : 'outlined'}
          >
            Favoritos
          </Button>
          <Button
            startIcon={<History />}
            onClick={() => setActiveCarousel('recent')}
            color={activeCarousel === 'recent' ? 'primary' : 'inherit'}
            variant={activeCarousel === 'recent' ? 'contained' : 'outlined'}
          >
            Recentes
          </Button>
          <Button
            startIcon={<LocalOffer />}
            onClick={() => setActiveCarousel('promotions')}
            color={activeCarousel === 'promotions' ? 'primary' : 'inherit'}
            variant={activeCarousel === 'promotions' ? 'contained' : 'outlined'}
          >
            Promoções
          </Button>
        </ButtonGroup>
      </Box>

      <Paper elevation={0} sx={{ p: 2 }}>
        <SectionHeader
          icon={currentCarousel.icon}
          title={currentCarousel.title}
          onClick={() => navigate(currentCarousel.path)}
        />
        <CarouselSection
          items={currentCarousel.items}
          currentStep={currentCarousel.step}
          setCurrentStep={currentCarousel.setStep}
          maxSteps={Math.ceil(currentCarousel.items.length / ITEMS_PER_PAGE)}
          renderItem={(item) => (
            <ProductCard key={item} item={item} type={currentCarousel.type} />
          )}
        />
      </Paper>
    </Box>
  );
};

export default function Home() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { searchResults } = useSearch();

  const handleLogout = useCallback(() => {
    signOut();
    navigate('/login');
  }, [signOut, navigate]);

  const ActionButtons = memo(() => (
    <>
      <IconButton color="inherit">
        <Favorite />
      </IconButton>
      <IconButton color="inherit">
        <ShoppingCart />
      </IconButton>
      <IconButton onClick={handleLogout} color="inherit">
        <ExitToApp />
      </IconButton>
    </>
  ));

  return (
    <SearchProvider>
      <Box sx={{ pb: isMobile ? 7 : 0 }}>
        {!isMobile && (
          <AppBar position="static" color="transparent" elevation={0}>
            <Toolbar sx={{ justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={user?.avatar_url}
                  alt={user?.name}
                  sx={{ width: 40, height: 40 }}
                >
                  {user?.name?.[0]?.toUpperCase()}
                </Avatar>
                <Typography variant="h6">
                  Olá, {user?.name?.split(' ')[0]}!
                </Typography>
              </Box>
              <Box>
                <ActionButtons />
              </Box>
            </Toolbar>
          </AppBar>
        )}

        <Container maxWidth={false} sx={{ width: '100%', p: { xs: 2, sm: 3 } }}>
          <Box sx={{ width: '100%', mb: { xs: 3, sm: 4 } }}>
            {isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar
                  src={user?.avatar_url}
                  alt={user?.name}
                  sx={{ width: 40, height: 40 }}
                >
                  {user?.name?.[0]?.toUpperCase()}
                </Avatar>
                <Typography variant="h6">
                  Olá, {user?.name?.split(' ')[0]}!
                </Typography>
              </Box>
            )}
            <Typography variant="body1" color="text.secondary" gutterBottom>
              O que você deseja encontrar hoje?
            </Typography>
            <SearchBar />
          </Box>

          {searchResults && <SearchResults />}
          {!searchResults && <HomeContent />}
        </Container>

        {isMobile && (
          <BottomNavigation
            showLabels
            sx={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              borderTop: 1,
              borderColor: 'divider',
            }}
          >
            <BottomNavigationAction label="Buscar" icon={<Search />} />
            <BottomNavigationAction label="Favoritos" icon={<Favorite />} />
            <BottomNavigationAction label="Carrinho" icon={<ShoppingCart />} />
            <BottomNavigationAction label="Perfil" icon={<AccountCircle />} />
          </BottomNavigation>
        )}
      </Box>
    </SearchProvider>
  );
} 