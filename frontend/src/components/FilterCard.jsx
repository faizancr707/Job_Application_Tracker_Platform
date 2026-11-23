import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import { motion } from 'framer-motion';

const filterData = [
    {
        filterType: "Location",
        array: ["Delhi NCR", "Bangalore", "Hyderabad", "Pune", "Mumbai"],
    },
    {
        filterType: "Industry",
        array: ["Frontend Developer", "Backend Developer", "FullStack Developer"],
    },
    {
        filterType: "Skills",
        array: ["React.js", "Java", "DevOps", "Swift", "Flutter", "AWS"]
    },
];

const FilterCard = () => {
    const [selectedFilters, setSelectedFilters] = useState({
        Location: [],
        Industry: [],
        Skills: []
    });

    const dispatch = useDispatch();

    const handleFilterChange = (filterType, value) => {
        setSelectedFilters((prevFilters) => {
            const currentSelections = prevFilters[filterType] || [];
            const newSelections = currentSelections.includes(value)
                ? currentSelections.filter((item) => item !== value)
                : [...currentSelections, value];

            return {
                ...prevFilters,
                [filterType]: newSelections,
            };
        });
    };

    useEffect(() => {
        const searchQuery = Object.values(selectedFilters)
            .flat()
            .join(' ')
            .trim();
        dispatch(setSearchedQuery(searchQuery));
    }, [selectedFilters, dispatch]);

    const clearFilters = () => {
        setSelectedFilters({
            Location: [],
            Industry: [],
            Skills: []
        });
    };

    const hasActiveFilters = Object.values(selectedFilters).some(arr => arr.length > 0);

    return (
        <motion.div
            className="w-full bg-neu-base border border-white/25 p-6 rounded-neu shadow-neu-raised"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
        >
            <div className="flex items-center justify-between">
                <h1 className="font-extrabold text-lg text-charcoal tracking-tight">Filter Jobs</h1>
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="text-xs text-burnt-orange hover:text-burnt-orange-hover font-bold px-2.5 py-1 rounded-full bg-neu-base shadow-neu-flat border border-white/20 transition active:shadow-neu-inset-xs"
                    >
                        Reset
                    </button>
                )}
            </div>
            <hr className="mt-3 mb-4 border-white/20" />
            {filterData.map((data, index) => (
                <div key={index} className="mt-5">
                    <h2 className="font-bold text-xs uppercase tracking-wider text-burnt-orange mb-3">
                        {data.filterType}
                    </h2>
                    <div className="space-y-2.5">
                        {data.array.map((item, idx) => {
                            const itemId = `id${index}-${idx}`;
                            const isChecked = (selectedFilters[data.filterType] || []).includes(item);

                            return (
                                <div
                                    key={itemId}
                                    onClick={() => handleFilterChange(data.filterType, item)}
                                    className={`flex items-center space-x-3 px-3 py-2 rounded-xl cursor-pointer transition-all select-none border border-white/10 ${
                                        isChecked
                                            ? 'bg-neu-base shadow-neu-inset-xs border-burnt-orange/20 text-burnt-orange font-bold'
                                            : 'hover:shadow-neu-flat text-charcoal-muted hover:text-charcoal'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        id={itemId}
                                        checked={isChecked}
                                        onChange={() => {}}
                                        className="h-4 w-4 rounded cursor-pointer accent-burnt-orange"
                                    />
                                    <label
                                        htmlFor={itemId}
                                        className="text-sm cursor-pointer flex-1"
                                    >
                                        {item}
                                    </label>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </motion.div>
    );
};

export default FilterCard;
