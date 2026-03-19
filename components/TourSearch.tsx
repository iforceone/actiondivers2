import React, { useState, useMemo } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { INITIAL_TOURS } from '../constants';

interface SearchFilters {
  category: string;
  priceRange: [number, number];
  duration: string;
  difficulty: string;
  searchTerm: string;
}

const TourSearch: React.FC<{ onToursFiltered: (tours: typeof INITIAL_TOURS) => void }> = ({ onToursFiltered }) => {
  const [filters, setFilters] = useState<SearchFilters>({
    category: 'all',
    priceRange: [0, 1000],
    duration: 'all',
    difficulty: 'all',
    searchTerm: ''
  });
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const categories = [
    { value: 'all', label: 'All Tours' },
    { value: 'island', label: 'Island Adventures' },
    { value: 'mainland', label: 'Mainland Expeditions' }
  ];

  const durations = [
    { value: 'all', label: 'Any Duration' },
    { value: 'half', label: 'Half Day' },
    { value: 'full', label: 'Full Day' },
    { value: 'multi', label: 'Multi Day' }
  ];

  const difficulties = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  const filteredTours = useMemo(() => {
    return INITIAL_TOURS.filter(tour => {
      // Category filter
      if (filters.category !== 'all' && tour.category !== filters.category) {
        return false;
      }

      // Price range filter
      if (tour.price < filters.priceRange[0] || tour.price > filters.priceRange[1]) {
        return false;
      }

      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch = 
          tour.name.toLowerCase().includes(searchLower) ||
          tour.description.toLowerCase().includes(searchLower) ||
          tour.longDescription.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [filters]);

  React.useEffect(() => {
    onToursFiltered(filteredTours);
  }, [filteredTours, onToursFiltered]);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: 'all',
      priceRange: [0, 1000],
      duration: 'all',
      difficulty: 'all',
      searchTerm: ''
    });
  };

  const activeFiltersCount = [
    filters.category !== 'all',
    filters.priceRange[0] > 0 || filters.priceRange[1] < 1000,
    filters.duration !== 'all',
    filters.difficulty !== 'all',
    filters.searchTerm !== ''
  ].filter(Boolean).length;

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-[2rem] p-6 border border-white/10">
      {/* Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#E9D8A6]/40 w-5 h-5" />
          <input
            type="text"
            placeholder="Search tours, activities, destinations..."
            value={filters.searchTerm}
            onChange={(e) => updateFilter('searchTerm', e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-[#E9D8A6] placeholder-[#E9D8A6]/40 focus:outline-none focus:border-[#E9D8A6]/40 transition-all"
          />
        </div>
        
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center gap-3 px-6 py-4 bg-[#005F73] text-[#E9D8A6] rounded-2xl hover:bg-[#005F73]/80 transition-all relative"
        >
          <Filter className="w-5 h-5" />
          <span className="font-medium">Filters</span>
          {activeFiltersCount > 0 && (
            <span className="absolute -top-2 -right-2 w-6 h-6 bg-[#E9D8A6] text-[#001219] rounded-full text-xs font-bold flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Expandable Filters */}
      {isFilterOpen && (
        <div className="space-y-6 pt-6 border-t border-white/10">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-[#E9D8A6]/80 mb-3">Category</label>
              <select
                value={filters.category}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-[#E9D8A6] focus:outline-none focus:border-[#E9D8A6]/40 transition-all"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value} className="bg-[#001219]">
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration Filter */}
            <div>
              <label className="block text-sm font-medium text-[#E9D8A6]/80 mb-3">Duration</label>
              <select
                value={filters.duration}
                onChange={(e) => updateFilter('duration', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-[#E9D8A6] focus:outline-none focus:border-[#E9D8A6]/40 transition-all"
              >
                {durations.map(dur => (
                  <option key={dur.value} value={dur.value} className="bg-[#001219]">
                    {dur.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium text-[#E9D8A6]/80 mb-3">Difficulty</label>
              <select
                value={filters.difficulty}
                onChange={(e) => updateFilter('difficulty', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-[#E9D8A6] focus:outline-none focus:border-[#E9D8A6]/40 transition-all"
              >
                {difficulties.map(diff => (
                  <option key={diff.value} value={diff.value} className="bg-[#001219]">
                    {diff.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-[#E9D8A6]/80 mb-3">
                Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="50"
                  value={filters.priceRange[1]}
                  onChange={(e) => updateFilter('priceRange', [filters.priceRange[0], parseInt(e.target.value)])}
                  className="w-full accent-[#E9D8A6]"
                />
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-[#E9D8A6]/60">
              {filteredTours.length} tours found
            </p>
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 text-sm text-[#E9D8A6]/60 hover:text-[#E9D8A6] transition-colors"
            >
              <X className="w-4 h-4" />
              Clear all filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TourSearch;
