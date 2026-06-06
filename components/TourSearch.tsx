import React, { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { INITIAL_TOURS } from '../constants';

interface SearchFilters {
  category: string;
  priceRange: [number, number];
  searchTerm: string;
}

const TourSearch: React.FC<{ onToursFiltered: (tours: typeof INITIAL_TOURS) => void }> = ({ onToursFiltered }) => {
  const [filters, setFilters] = useState<SearchFilters>({
    category: 'all',
    priceRange: [0, 1000],
    searchTerm: '',
  });

  const filteredTours = useMemo(() => {
    return INITIAL_TOURS.filter((tour) => {
      if (filters.category !== 'all' && tour.category !== filters.category) {
        return false;
      }

      if (tour.price < filters.priceRange[0] || tour.price > filters.priceRange[1]) {
        return false;
      }

      if (filters.searchTerm.trim()) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch =
          tour.name.toLowerCase().includes(searchLower) ||
          tour.description.toLowerCase().includes(searchLower) ||
          tour.longDescription.toLowerCase().includes(searchLower) ||
          tour.features?.some((feature) => feature.toLowerCase().includes(searchLower));

        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [filters]);

  React.useEffect(() => {
    onToursFiltered(filteredTours);
  }, [filteredTours, onToursFiltered]);

  const updateFilter = (key: keyof SearchFilters, value: SearchFilters[keyof SearchFilters]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: 'all',
      priceRange: [0, 1000],
      searchTerm: '',
    });
  };

  const quickFilters = [
    { label: 'All', category: 'all', maxPrice: 1000 },
    { label: 'Island', category: 'island', maxPrice: 1000 },
    { label: 'Mainland', category: 'mainland', maxPrice: 1000 },
    { label: 'Under $150', category: 'all', maxPrice: 150 },
    { label: 'Under $350', category: 'all', maxPrice: 350 },
  ];

  const activeFiltersCount = [
    filters.category !== 'all',
    filters.priceRange[0] > 0 || filters.priceRange[1] < 1000,
    filters.searchTerm.trim() !== '',
  ].filter(Boolean).length;

  const searchLabel = filters.searchTerm.trim() ? ` matching "${filters.searchTerm.trim()}"` : '';

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-lg md:p-8">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.45em] text-[#48CAE4]">Adventure Finder</p>
            <h2 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
              Find Your Belize Adventure
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#E9D8A6]/60 md:text-base">
              Search by reef, ruin, cave, snorkel, dive, or fishing. Matching tours update right below.
            </p>
          </div>
          <div className="text-left lg:text-right">
            <p className="text-3xl font-extrabold tracking-tight text-[#E9D8A6]">{filteredTours.length}</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#E9D8A6]/40">
              {filteredTours.length === 1 ? 'Adventure Found' : 'Adventures Found'}
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-[#E9D8A6]/40" />
          <input
            type="text"
            placeholder="Try “Hol Chan”, “cave”, “snorkeling”, “fishing”..."
            value={filters.searchTerm}
            onChange={(e) => updateFilter('searchTerm', e.target.value)}
            className="w-full rounded-2xl border border-white/20 bg-white/10 py-5 pl-14 pr-14 text-lg text-[#E9D8A6] placeholder-[#E9D8A6]/40 transition-all focus:border-[#E9D8A6]/60 focus:bg-white/[0.13] focus:outline-none"
          />
          {filters.searchTerm && (
            <button
              type="button"
              onClick={() => updateFilter('searchTerm', '')}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-2 text-[#E9D8A6]/45 transition-colors hover:bg-white/10 hover:text-[#E9D8A6]"
              aria-label="Clear search"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="flex flex-col gap-5 border-t border-white/10 pt-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-3">
            {quickFilters.map((filter) => {
              const isActive =
                filters.category === filter.category &&
                filters.priceRange[0] === 0 &&
                filters.priceRange[1] === filter.maxPrice;

              return (
                <button
                  key={filter.label}
                  type="button"
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      category: filter.category,
                      priceRange: [0, filter.maxPrice],
                    }))
                  }
                  className={`rounded-full border px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] transition-all ${
                    isActive
                      ? 'border-[#E9D8A6] bg-[#E9D8A6] text-[#001219]'
                      : 'border-white/15 bg-white/5 text-[#E9D8A6]/60 hover:border-[#E9D8A6]/50 hover:text-[#E9D8A6]'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <label className="text-xs font-bold uppercase tracking-[0.25em] text-[#E9D8A6]/45">
              Max price: <span className="text-[#E9D8A6]">${filters.priceRange[1]}</span>
            </label>
            <input
              type="range"
              min="100"
              max="1000"
              step="50"
              value={filters.priceRange[1]}
              onChange={(e) => updateFilter('priceRange', [0, parseInt(e.target.value)])}
              className="w-full accent-[#E9D8A6] sm:w-44"
            />
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#E9D8A6]/45 transition-colors hover:text-[#E9D8A6]"
              >
                <X className="h-4 w-4" />
                Reset
              </button>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#001219]/45 px-5 py-4">
          {filteredTours.length > 0 ? (
            <p className="text-sm text-[#E9D8A6]/65">
              Showing <span className="font-bold text-[#E9D8A6]">{filteredTours.length}</span>{' '}
              {filteredTours.length === 1 ? 'adventure' : 'adventures'}
              {searchLabel}.
            </p>
          ) : (
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-[#E9D8A6]/70">
                No exact matches{searchLabel}. Try a broader search or ask us to customize the day.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-full bg-[#E9D8A6] px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-[#001219] transition-colors hover:bg-white"
              >
                View All Tours
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TourSearch;
