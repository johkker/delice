import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { search, SearchFilters, SearchResponse, SearchType } from '../services/search-service';

interface SearchContextData {
    isLoading: boolean;
    error: string | null;
    searchResults: SearchResponse | null;
    searchFilters: SearchFilters;
    setSearchFilters: (filters: SearchFilters) => void;
    performSearch: (newFilters?: Partial<SearchFilters>) => Promise<void>;
    clearSearch: () => void;
}

const defaultFilters: SearchFilters = {
    type: 'all' as SearchType,
    page: 1,
    limit: 10,
};

const SearchContext = createContext<SearchContextData>({} as SearchContextData);

export const useSearch = () => {
    const context = useContext(SearchContext);
    if (!context) {
        throw new Error('useSearch must be used within a SearchProvider');
    }
    return context;
};

interface SearchProviderProps {
    children: ReactNode;
}

export const SearchProvider = ({ children }: SearchProviderProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
    const [searchFilters, setSearchFilters] = useState<SearchFilters>(defaultFilters);

    const performSearch = useCallback(async (newFilters?: Partial<SearchFilters>) => {
        try {
            setIsLoading(true);
            setError(null);

            const filters: SearchFilters = {
                ...searchFilters,
                ...newFilters,
            };

            setSearchFilters(filters);
            const results = await search(filters);
            setSearchResults(results);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while searching');
            setSearchResults(null);
        } finally {
            setIsLoading(false);
        }
    }, [searchFilters]);

    const clearSearch = useCallback(() => {
        setSearchResults(null);
        setSearchFilters(defaultFilters);
        setError(null);
    }, []);

    return (
        <SearchContext.Provider
            value={{
                isLoading,
                error,
                searchResults,
                searchFilters,
                setSearchFilters,
                performSearch,
                clearSearch,
            }}
        >
            {children}
        </SearchContext.Provider>
    );
}; 