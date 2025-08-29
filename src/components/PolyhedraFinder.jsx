import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Container } from './ui/reused-ui/Container.jsx'
import { Cube, RectangularPrism, TriangularPrism, Cylinder, Cone, Sphere, Pyramid } from './Shapes.jsx'
import './PolyhedraFinder.css'

const PolyhedraFinder = () => {
    // State Management
    const [answer, setAnswer] = useState('cube');
    const [displayedShapes, setDisplayedShapes] = useState([]);
    const [clickedCorrectShape, setClickedCorrectShape] = useState(null);
    const autoResetTimeoutRef = useRef(null);

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
        // Clear any existing auto-reset timeout
        if (autoResetTimeoutRef.current) {
            clearTimeout(autoResetTimeoutRef.current);
            autoResetTimeoutRef.current = null;
        }
        
        setClickedCorrectShape(null);
        generateShapes();
    };

    useEffect(() => {
        generateShapes();
        
        // Cleanup timeout on component unmount
        return () => {
            if (autoResetTimeoutRef.current) {
                clearTimeout(autoResetTimeoutRef.current);
            }
        };
    }, []);

    const handleShapeClick = (shape) => {
        if (shape.name === answer) {
            // Clear any existing auto-reset timeout
            if (autoResetTimeoutRef.current) {
                clearTimeout(autoResetTimeoutRef.current);
            }
            
            // Set the clicked correct shape to apply hideShapes class
            setClickedCorrectShape(shape.name);
            
            // Fire confetti from multiple positions for better visibility
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.5, x: 0.5 }
            });
            
            // Add a second burst for extra celebration
            setTimeout(() => {
                confetti({
                    particleCount: 50,
                    spread: 60,
                    origin: { y: 0.55, x: 0.3 }
                });
                confetti({
                    particleCount: 50,
                    spread: 60,
                    origin: { y: 0.55, x: 0.7 }
                });
            }, 200);
            
            // Auto-reset after 3 seconds
            autoResetTimeoutRef.current = setTimeout(() => {
                setClickedCorrectShape(null);
                generateShapes();
                autoResetTimeoutRef.current = null;
            }, 3000);
        }
    }
    
	return (
        <Container
            text="Polyhedra Finder" 
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
                        const shouldHide = clickedCorrectShape && shape.name !== clickedCorrectShape;
                        return (
                            <ShapeComponent 
                                key={index} 
                                onClick={() => handleShapeClick(shape)}
                                className={shouldHide ? 'hideShapes' : ''}
                            />
                        );
                    })}
                </div>
            </div>

            {/* Prompt */}
            {!clickedCorrectShape && (
                <div className='w-[95%] pb-5 font-bold text-lg text-center'>
                    Which of these shapes is a <span className='text-[#FF7B00]'>{answer}</span>?
                </div>
            )}
            {clickedCorrectShape && (
                <div className='w-[95%] pb-5 font-bold text-lg text-center'>
                    That's correct! That's a <span className='text-green-700'>{answer}</span>!
                </div>
            )}
        </Container>
)
};


export default PolyhedraFinder;