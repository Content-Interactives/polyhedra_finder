import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Container } from './ui/reused-ui/Container.jsx'
import { Cube, RectangularPrism, TriangularPrism, Cylinder, Cone, Sphere, Pyramid } from './Shapes.jsx'

const PolyhedraFinder = () => {
    // State Management
    const [answer, setAnswer] = useState('cube');

    // Functions
    const generateShapes = () => {
        
    }
    
	return (
        <Container
            text="Polyhedra Finder" 
            showResetButton={false}
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
                    <Cube />
                    <RectangularPrism />
                    <Cylinder />
                    <Sphere />
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