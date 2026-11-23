import React from 'react';
import { motion } from 'framer-motion';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';
import { Button } from './ui/button';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setSearchedQuery } from '@/redux/jobSlice';

const category = [
    "Frontend Developer",
    "Backend Developer",
    "Data Science",
    "Graphic Designer",
    "FullStack Developer"
];

const CategoryCarousel = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const searchJobHandler = (query) => {
        dispatch(setSearchedQuery(query));
        navigate("/browse");
    };

    const itemVariants = {
        hidden: { opacity: 0, x: 50 },
        visible: { opacity: 1, x: 0 },
    };

    return (
        <div className="w-full max-w-4xl mx-auto my-16 px-4">
            <Carousel className="w-full">
                <CarouselContent>
                    {
                        category.map((cat, index) => (
                            <motion.div
                                key={ index }
                                className="p-3"
                                variants={ itemVariants }
                                initial="hidden"
                                animate="visible"
                                transition={ { delay: index * 0.15, duration: 0.4 } }
                            >
                                <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                                    <Button
                                        onClick={ () => searchJobHandler(cat) }
                                        variant="outline"
                                        className="w-full rounded-full text-sm font-semibold bg-neu-base border border-white/30 text-charcoal shadow-neu-flat hover:shadow-neu-raised-xs hover:text-burnt-orange active:shadow-neu-inset-xs transition-all duration-300"
                                    >
                                        { cat }
                                    </Button>
                                </CarouselItem>
                            </motion.div>
                        ))
                    }
                </CarouselContent>

                {/* Previous and Next buttons with soft UI styling */}
                <CarouselPrevious className="border-white/30 bg-neu-base text-charcoal shadow-neu-raised-sm hover:shadow-neu-raised hover:text-burnt-orange" />
                <CarouselNext className="border-white/30 bg-neu-base text-charcoal shadow-neu-raised-sm hover:shadow-neu-raised hover:text-burnt-orange" />
            </Carousel>
        </div>
    );
};

export default CategoryCarousel;
