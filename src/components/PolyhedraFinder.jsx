import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Container } from './ui/reused-ui/Container.jsx'
import { Cube, RectangularPrism, TriangularPrism, Cylinder, Cone, Sphere, Pyramid } from './Shapes.jsx'

const PolyhedraFinder = () => {
    // State Management
    const [answer, setAnswer] = useState('cube');
    const [displayedShapes, setDisplayedShapes] = useState([]);

    // Shape mapping with names
    const shapeLibrary = [
        { component: Cube, name: 'cube' },
        { component: RectangularPrism, name: 'rectangular prism' },
        { component: TriangularPrism, name: 'triangular prism' },
        { component: Cylinder, name: 'cylinder' },
        { component: Cone, name: 'cone' },
        { component: Sphere, name: 'sphere' },
        { component: Pyramid, name: 'pyramid' }
    ];

    // Functions
    const generateShapes = () => {
        // Create a copy of the shape library and shuffle it
        const shuffledShapes = [...shapeLibrary].sort(() => Math.random() - 0.5);
        
        // Take the first 4 unique shapes
        const selectedShapes = shuffledShapes.slice(0, 4);

        // Set the answer to one of the selected shapes
        const answerShape = selectedShapes[Math.floor(Math.random() * selectedShapes.length)];
        setAnswer(answerShape.name);
        setDisplayedShapes(selectedShapes);

        return selectedShapes;
    }

    const handleReset = () => {
        generateShapes();
    };

    useEffect(() => {
        generateShapes();
    }, []);
    
	return (
        <Container
            text="Polyhedra Finder" 
            showResetButton={true}
            onReset={handleReset}
            borderColor="#FF7B00"
            showSoundButton={true}
        >
            {/* Intro Text */}
            <div className='text-center text-sm text-gray-500 p-5 pb-3 flex-start'>
                Use your knowledge of 3d shapes to figure out which of the following shapes is the one you're looking for!
            </div>

            {/* Main Content */}
            <div className='flex-grow p-4'>
                <div className='grid grid-cols-2 justify-items-center'>
                    {displayedShapes.map((shape, index) => {
                        const ShapeComponent = shape.component;
                        return <ShapeComponent key={index} />;
                    })}
                </div>
            </div>

            {/* Prompt */}
            <div className='pb-5 font-bold text-lg text-center'>
                Which of these shapes is a <span className='text-blue-600'>{answer}</span>?
            </div>
        </Container>
)
};


export default PolyhedraFinder;