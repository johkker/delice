import {
    Box,
    Typography,
    Grid as MuiGrid,
    Card,
    CardContent,
    CardMedia,
    Chip,
    Rating,
    Skeleton,
    Alert as MuiAlert,
} from '@mui/material';
import { useSearch } from '../../contexts/SearchContext';
import { formatCurrency } from '../../utils/format';

const Grid = MuiGrid as any; // Type assertion to fix Grid item prop issue
const Alert = MuiAlert as any; // Type assertion to fix children prop issue

export const SearchResults = () => {
    const { isLoading, error, searchResults } = useSearch();

    if (error) {
        return (
            <Alert severity="error" sx={{ mt: 2 }}>
                {error}
            </Alert>
        );
    }

    if (isLoading) {
        return (
            <Grid container spacing={2} sx={{ mt: 2 }}>
                {[...Array(6)].map((_, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card>
                            <Skeleton variant="rectangular" height={140} />
                            <CardContent>
                                <Skeleton variant="text" />
                                <Skeleton variant="text" width="60%" />
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        );
    }

    if (!searchResults) {
        return null;
    }

    return (
        <Box sx={{ mt: 4 }}>
            {searchResults.stores && searchResults.stores.items.length > 0 && (
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        Lojas ({searchResults.stores.total})
                    </Typography>
                    <Grid container spacing={2}>
                        {searchResults.stores.items.map((store) => (
                            <Grid item xs={12} sm={6} md={4} key={store.id}>
                                <Card>
                                    {store.banner_url && (
                                        <CardMedia
                                            component="img"
                                            height="140"
                                            image={store.banner_url}
                                            alt={store.name}
                                        />
                                    )}
                                    <CardContent>
                                        <Typography variant="h6" noWrap>
                                            {store.name}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <Rating value={store.rating} readOnly size="small" />
                                            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                                ({store.rating_count})
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" noWrap>
                                            {[store.city, store.neighborhood].filter(Boolean).join(' - ')}
                                        </Typography>
                                        <Box sx={{ mt: 1 }}>
                                            {store.categories.map((category) => (
                                                <Chip
                                                    key={category}
                                                    label={category}
                                                    size="small"
                                                    sx={{ mr: 0.5, mb: 0.5 }}
                                                />
                                            ))}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            {searchResults.products && searchResults.products.items.length > 0 && (
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Produtos ({searchResults.products.total})
                    </Typography>
                    <Grid container spacing={2}>
                        {searchResults.products.items.map((product) => (
                            <Grid item xs={12} sm={6} md={4} key={product.id}>
                                <Card>
                                    {product.images[0] && (
                                        <CardMedia
                                            component="img"
                                            height="140"
                                            image={product.images[0]}
                                            alt={product.name}
                                        />
                                    )}
                                    <CardContent>
                                        <Typography variant="h6" noWrap>
                                            {product.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" noWrap>
                                            {product.description}
                                        </Typography>
                                        <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                                            {formatCurrency(product.price)}
                                        </Typography>
                                        <Box sx={{ mt: 1 }}>
                                            {product.tags.map((tag) => (
                                                <Chip
                                                    key={tag}
                                                    label={tag}
                                                    size="small"
                                                    sx={{ mr: 0.5, mb: 0.5 }}
                                                />
                                            ))}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            {(!searchResults.stores?.items.length && !searchResults.products?.items.length) && (
                <Alert severity="info" sx={{ mt: 2 }}>
                    Nenhum resultado encontrado
                </Alert>
            )}
        </Box>
    );
}; 