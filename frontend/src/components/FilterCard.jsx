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
            className="w-full bg-white border border-[--border-subtle] p-5 rounded-xl shadow-warm-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
        >
            <div className="flex items-center justify-between">
                <h1 className="font-bold text-lg text-charcoal">Filter Jobs</h1>
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="text-xs text-burnt-orange hover:underline font-semibold"
                    >
                        Reset
                    </button>
                )}
            </div>
            <hr className="mt-3 mb-4 border-[--border-subtle]" />
            {filterData.map((data, index) => (
                <div key={index} className="mt-4">
                    <h2 className="font-bold text-xs uppercase tracking-wider text-burnt-orange mb-2.5">
                        {data.filterType}
                    </h2>
                    {data.array.map((item, idx) => {
                        const itemId = `id${index}-${idx}`;
                        const isChecked = (selectedFilters[data.filterType] || []).includes(item);

                        return (
                            <div key={itemId} className="flex items-center space-x-2.5 my-2">
                                <input
                                    type="checkbox"
                                    id={itemId}
                                    checked={isChecked}
                                    onChange={() => handleFilterChange(data.filterType, item)}
                                    className="h-4 w-4 rounded cursor-pointer border-[--border-subtle] text-burnt-orange accent-burnt-orange focus:ring-burnt-orange"
                                />
                                <label
                                    htmlFor={itemId}
                                    className={`text-sm cursor-pointer transition-colors select-none ${
                                        isChecked ? 'text-charcoal font-semibold' : 'text-charcoal-muted hover:text-charcoal'
                                    }`}
                                >
                                    {item}
                                </label>
                            </div>
                        );
                    })}
                </div>
            ))}
        </motion.div>
    );
};

export default FilterCard;