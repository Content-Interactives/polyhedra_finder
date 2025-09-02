import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Container } from './ui/reused-ui/Container.jsx'
import { generateShapesSet } from './Shapes.jsx'
import './PolyhedraFinder.css'

const PolyhedraFinder = () => {
    // State Management
    const [answer, setAnswer] = useState('cube');
    const [displayedShapes, setDisplayedShapes] = useState([]);
    const [clickedCorrectShape, setClickedCorrectShape] = useState(null);
    const [shakingShape, setShakingShape] = useState(null);
    const [generation, setGeneration] = useState(0);
    const autoResetTimeoutRef = useRef(null);

    // Functions
    const generateShapes = () => {
        const { shapes, answer } = generateShapesSet();
        setAnswer(answer);
        setDisplayedShapes(shapes);
        setShakingShape(null);
        setGeneration(prev => prev + 1);
        return shapes;
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

    const handleShapeClick = (shape, controls) => {
        // If the correct shape has already been selected, ignore further clicks on it
        if (clickedCorrectShape && shape.name === clickedCorrectShape) {
            return;
        }
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
        } else {
            // Wrong selection: spin only for 1 second, then stop
            setTimeout(() => {
                if (controls && controls.stopPersistentSpin) {
                    controls.stopPersistentSpin();
                }
            }, 1000);
            // Trigger a brief shake animation
            setShakingShape(shape.name);
            setTimeout(() => {
                setShakingShape(null);
            }, 500);
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
            <div className='flex-grow p-4 pt-0 pb-0'>
                <div className='grid grid-cols-2 justify-items-center'>
                    {displayedShapes.map((shape, index) => {
                        const ShapeComponent = shape.component;
                        const shouldHide = clickedCorrectShape && shape.name !== clickedCorrectShape;
                        return (
                            <ShapeComponent 
                                key={`${generation}-${shape.name}-${index}`} 
                                onClick={(e, controls) => handleShapeClick(shape, controls)}
                                className={`${shouldHide ? 'hideShapes' : ''} ${shakingShape === shape.name ? 'shake-once' : ''}`.trim()}
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