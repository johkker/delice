import { useState, useEffect, useMemo } from 'react';
import {
    TextField,
    InputAdornment,
    IconButton,
    Box,
    Autocomplete,
    CircularProgress,
    useTheme,
    Typography,
    Avatar,
    ToggleButtonGroup,
    ToggleButton,
    Tooltip,
} from '@mui/material';
import {
    Search as SearchIcon,
    Clear as ClearIcon,
    Store as StoreIcon,
    Inventory as ProductIcon,
    FilterList as FilterIcon,
} from '@mui/icons-material';
import { useSearch } from '../../contexts/SearchContext';
import { debounce } from 'lodash';
import { formatCurrency } from '../../utils/format';
import { SearchType } from '../../services/search-service';

type AutocompleteOption = {
    id: string;
    type: 'product' | 'store';
    name: string;
    description?: string;
    image?: string | null;
    price?: number;
    rating?: number;
    location?: string;
};

export const SearchBar = () => {
    const theme = useTheme();
    const { isLoading, searchResults, searchFilters, setSearchFilters, performSearch, clearSearch } = useSearch();
    const [searchTerm, setSearchTerm] = useState('');
    const [open, setOpen] = useState(false);

    // Convert search results to autocomplete options
    const options = useMemo(() => {
        if (!searchResults) return [];

        const productOptions: AutocompleteOption[] = 
            (searchFilters.type === 'all' || searchFilters.type === 'products') 
                ? searchResults.products?.items.map(product => ({
                    id: product.id,
                    type: 'product',
                    name: product.name,
                    description: product.description,
                    image: product.images[0],
                    price: product.price,
                })) || []
                : [];

        const storeOptions: AutocompleteOption[] = 
            (searchFilters.type === 'all' || searchFilters.type === 'stores')
                ? searchResults.stores?.items.map(store => ({
                    id: store.id,
                    type: 'store',
                    name: store.name,
                    description: store.description,
                    image: store.logo_url,
                    rating: store.rating,
                    location: [store.city, store.neighborhood].filter(Boolean).join(' - '),
                })) || []
                : [];

        return [...productOptions, ...storeOptions];
    }, [searchResults, searchFilters.type]);

    // Debounced search function
    const debouncedSearch = debounce((query: string) => {
        if (query.trim()) {
            performSearch({ ...searchFilters, query });
        } else {
            clearSearch();
        }
    }, 300);

    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

    const handleInputChange = (_: any, newValue: string) => {
        setSearchTerm(newValue);
        debouncedSearch(newValue);
    };

    const handleOptionSelect = (_: any, option: AutocompleteOption | null) => {
        if (!option) return;
        
        // Navigate to the selected item's page
        // TODO: Implement navigation
        console.log('Selected:', option);
    };

    const handleClear = () => {
        setSearchTerm('');
        clearSearch();
    };

    const handleTypeChange = (_: React.MouseEvent<HTMLElement>, newType: SearchType | null) => {
        const type = newType || 'all';
        setSearchFilters({ ...searchFilters, type });
        if (searchTerm) {
            performSearch({ ...searchFilters, type, query: searchTerm });
        }
    };

    return (
        <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <ToggleButtonGroup
                    value={searchFilters.type}
                    exclusive
                    onChange={handleTypeChange}
                    aria-label="search type"
                    size="small"
                >
                    <ToggleButton value="all" aria-label="all">
                        <Tooltip title="Todos">
                            <FilterIcon />
                        </Tooltip>
                    </ToggleButton>
                    <ToggleButton value="products" aria-label="products only">
                        <Tooltip title="Apenas Produtos">
                            <ProductIcon />
                        </Tooltip>
                    </ToggleButton>
                    <ToggleButton value="stores" aria-label="stores only">
                        <Tooltip title="Apenas Lojas">
                            <StoreIcon />
                        </Tooltip>
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>
            <Autocomplete
                open={open}
                onOpen={() => setOpen(true)}
                onClose={() => setOpen(false)}
                inputValue={searchTerm}
                onInputChange={handleInputChange}
                onChange={handleOptionSelect}
                options={options}
                getOptionLabel={(option) => option.name}
                loading={isLoading}
                filterOptions={(x) => x} // Disable client-side filtering
                noOptionsText="Nenhum resultado encontrado"
                groupBy={(option) => option.type === 'product' ? 'Produtos' : 'Lojas'}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder={
                            searchFilters.type === 'products' ? "Buscar produtos..." :
                            searchFilters.type === 'stores' ? "Buscar lojas..." :
                            "Buscar produtos ou lojas..."
                        }
                        variant="outlined"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: theme.shape.borderRadius * 3,
                                backgroundColor: theme.palette.background.paper,
                                transition: theme.transitions.create(['box-shadow']),
                                '&:hover': {
                                    boxShadow: theme.shadows[2],
                                },
                                '&.Mui-focused': {
                                    boxShadow: theme.shadows[4],
                                },
                            },
                        }}
                        InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    {isLoading ? (
                                        <CircularProgress size={20} />
                                    ) : searchTerm && (
                                        <IconButton
                                            aria-label="clear search"
                                            onClick={handleClear}
                                            edge="end"
                                            size="small"
                                        >
                                            <ClearIcon />
                                        </IconButton>
                                    )}
                                    {params.InputProps.endAdornment}
                                </InputAdornment>
                            ),
                        }}
                    />
                )}
                renderOption={(props, option) => (
                    <Box component="li" {...props}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            {option.image ? (
                                <Avatar
                                    src={option.image}
                                    alt={option.name}
                                    variant={option.type === 'product' ? 'square' : 'circular'}
                                    sx={{ width: 40, height: 40, mr: 2 }}
                                />
                            ) : (
                                <Avatar sx={{ width: 40, height: 40, mr: 2 }}>
                                    {option.type === 'store' ? <StoreIcon /> : option.name[0]}
                                </Avatar>
                            )}
                            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                <Typography variant="subtitle1" noWrap>
                                    {option.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" noWrap>
                                    {option.type === 'product' 
                                        ? formatCurrency(option.price!)
                                        : option.location}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                )}
            />
        </Box>
    );
}; 