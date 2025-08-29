import React, { useState, useEffect, useRef } from 'react';

// Utility functions for 3D rendering
const toRadians = (degrees) => (degrees * Math.PI) / 180;

const rotatePoint = (point, rotation) => {
  const { x: rx, y: ry } = rotation;
  const cosX = Math.cos(toRadians(rx));
  const sinX = Math.sin(toRadians(rx));
  const cosY = Math.cos(toRadians(ry));
  const sinY = Math.sin(toRadians(ry));

  const y1 = point[1] * cosX - point[2] * sinX;
  const z1 = point[1] * sinX + point[2] * cosX;

  const x2 = point[0] * cosY + z1 * sinY;
  const z2 = -point[0] * sinY + z1 * cosY;

  return [x2, y1, z2];
};

const project = (point, rotation, scale = 90) => {
  const rotatedPoint = rotatePoint(point, rotation);
  const perspective = 4;
  const factor = perspective / (perspective + rotatedPoint[2]);
  
  return {
    x: rotatedPoint[0] * scale * factor + 100,
    y: rotatedPoint[1] * scale * factor + 75,
    z: rotatedPoint[2]
  };
};

const getFaceCenter = (vertices, face) => {
  const points = face.map(idx => vertices[idx]);
  const center = points.reduce(
    (acc, point) => [acc[0] + point[0], acc[1] + point[1], acc[2] + point[2]],
    [0, 0, 0]
  );
  return center.map(coord => coord / face.length);
};

// Base 3D Shape Component  
const Shape3D = ({ shapeData, width = 200, height = 150, color = '#0ea5e9', rotation = { x: 15, y: 25 } }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentRotation, setCurrentRotation] = useState(rotation);
  const animationRef = useRef();
  const startTimeRef = useRef();

  useEffect(() => {
    if (isHovered) {
      const animate = (timestamp) => {
        if (!startTimeRef.current) {
          startTimeRef.current = timestamp;
        }
        
        const elapsed = timestamp - startTimeRef.current;
        const rotationSpeed = 1.06; // Slow rotation speed
        
        setCurrentRotation(prev => ({
          x: prev.x,
          y: prev.y + rotationSpeed
        }));
        
        animationRef.current = requestAnimationFrame(animate);
      };
      
      startTimeRef.current = null;
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      startTimeRef.current = null;
      // Don't reset position - keep current rotation
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isHovered]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const projectedVertices = shapeData.vertices.map(vertex => project(vertex, currentRotation));

  const sortedFaces = [...shapeData.faces].map((face, index) => ({
    vertices: Array.isArray(face) ? face : face.vertices || face,
    center: getFaceCenter(shapeData.vertices, Array.isArray(face) ? face : face.vertices || face),
    index,
    showStroke: Array.isArray(face) ? true : (face.showStroke !== false),
    isEdgeFace: Array.isArray(face) ? false : (face.isEdgeFace || false)
  })).sort((a, b) => {
    const centerA = rotatePoint(a.center, currentRotation)[2];
    const centerB = rotatePoint(b.center, currentRotation)[2];
    return centerB - centerA;
  });

    return (
    <svg 
      width={width} 
      height={height} 
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-full select-none cursor-pointer hover:cursor-pointer transition-transform"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
       {sortedFaces.map(({ vertices, index, showStroke = true, isEdgeFace = false }) => (
         <polygon
           key={`face-${index}`}
           points={vertices
             .map(v => `${projectedVertices[v].x},${projectedVertices[v].y}`)
             .join(' ')}
           fill={isEdgeFace ? "black" : color}
           fillOpacity={isEdgeFace ? 1.0 : 0.7}
           stroke={showStroke ? "black" : "none"}
           strokeWidth="2"
         />
       ))}
       
       {/* Add circular outline for sphere */}
       {shapeData.isSpherical && (
         <circle
           cx={100}
           cy={75}
           r={45}
           fill="none"
           stroke="black"
           strokeWidth="2"
         />
       )}
    </svg>
  );
};

export const Cube = () => {
  const shapeData = {
    vertices: [
      [-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, 0.5, -0.5], [-0.5, 0.5, -0.5],
      [-0.5, -0.5, 0.5], [0.5, -0.5, 0.5], [0.5, 0.5, 0.5], [-0.5, 0.5, 0.5]
    ],
    edges: [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7]
    ],
    faces: [
      [0, 1, 2, 3],
      [4, 5, 6, 7],
      [0, 1, 5, 4],
      [2, 3, 7, 6],
      [0, 3, 7, 4],
      [1, 2, 6, 5]
    ]
  };

  // 4 different viewing angles that clearly show cube form
  const rotations = [
    { x: 15, y: 25 },   // corner view
    { x: 10, y: 45 },   // angled face view
    { x: 20, y: 10 },   // edge view
    { x: 25, y: 35 }    // different corner
  ];
  const selectedRotation = rotations[Math.floor(Math.random() * 4)];

  return <Shape3D shapeData={shapeData} color="#0ea5e9" rotation={selectedRotation} />;
};

export const RectangularPrism = () => {
  const shapeData = {
    vertices: [
      [-0.7, -0.4, -0.3], [0.7, -0.4, -0.3], [0.7, 0.4, -0.3], [-0.7, 0.4, -0.3],
      [-0.7, -0.4, 0.3], [0.7, -0.4, 0.3], [0.7, 0.4, 0.3], [-0.7, 0.4, 0.3]
    ],
    edges: [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7]
    ],
    faces: [
      [0, 1, 2, 3],
      [4, 5, 6, 7],
      [0, 1, 5, 4],
      [2, 3, 7, 6],
      [0, 3, 7, 4],
      [1, 2, 6, 5]
    ]
  };

  // 4 angles showing rectangular (non-square) proportions clearly
  const rotations = [
    { x: 12, y: 30 },   // shows length difference
    { x: 18, y: 15 },   // side view showing width
    { x: 8, y: 40 },    // angled to show depth
    { x: 22, y: 20 }    // corner view
  ];
  const selectedRotation = rotations[Math.floor(Math.random() * 4)];

  return <Shape3D shapeData={shapeData} color="#48bb78" rotation={selectedRotation} />;
};

export const TriangularPrism = () => {
  const shapeData = {
    vertices: [
      [0, 0.6, -0.5], [-0.5, -0.3, -0.5], [0.5, -0.3, -0.5],
      [0, 0.6, 0.5], [-0.5, -0.3, 0.5], [0.5, -0.3, 0.5]
    ],
    edges: [
      [0, 1], [1, 2], [2, 0],
      [3, 4], [4, 5], [5, 3],
      [0, 3], [1, 4], [2, 5]
    ],
    faces: [
      [0, 1, 2],
      [3, 4, 5],
      [0, 1, 4, 3],
      [1, 2, 5, 4],
      [2, 0, 3, 5]
    ]
  };

  // 4 angles showing triangular cross-section clearly
  const rotations = [
    { x: 15, y: 0 },    // front view showing triangle
    { x: 10, y: 30 },   // angled to show triangle and depth
    { x: 20, y: 60 },   // side angle
    { x: 5, y: 15 }     // slight angle showing form
  ];
  const selectedRotation = rotations[Math.floor(Math.random() * 4)];

  return <Shape3D shapeData={shapeData} color="#ed8936" rotation={selectedRotation} />;
};

export const Cylinder = () => {
  const createCylinderVertices = (radius = 0.5, height = 1, segments = 16) => {
    const vertices = [];
    const faces = [];
    
    // Create top and bottom circles
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * 2 * Math.PI;
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);
      
      vertices.push([x, height/2, z]);  // top circle
      vertices.push([x, -height/2, z]); // bottom circle
    }
    
    // Add center points
    vertices.push([0, height/2, 0]);   // top center
    vertices.push([0, -height/2, 0]);  // bottom center
    
    const topCenter = segments * 2;
    const bottomCenter = segments * 2 + 1;
    
    // Create additional vertices for thin edge outlines
    const edgeWidth = 0.04; // Thicker edge width for better visibility
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * 2 * Math.PI;
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);
      
      // Inner edge vertices (slightly smaller radius)
      vertices.push([(radius - edgeWidth) * Math.cos(angle), height/2, (radius - edgeWidth) * Math.sin(angle)]);  // top inner
      vertices.push([(radius - edgeWidth) * Math.cos(angle), -height/2, (radius - edgeWidth) * Math.sin(angle)]); // bottom inner
    }
    
    const innerStart = segments * 2 + 2;
    
    // Create side faces (no strokes - just colored surface)
    for (let i = 0; i < segments; i++) {
      const next = (i + 1) % segments;
      faces.push({ vertices: [i*2, next*2, next*2+1, i*2+1], showStroke: false });
    }
    
    // Create top and bottom faces (no strokes - these are internal triangulation)
    for (let i = 0; i < segments; i++) {
      const next = (i + 1) % segments;
      faces.push({ vertices: [topCenter, next*2, i*2], showStroke: false });
      faces.push({ vertices: [bottomCenter, i*2+1, next*2+1], showStroke: false });
    }
    
    // Create thin edge faces for circular outlines
    for (let i = 0; i < segments; i++) {
      const next = (i + 1) % segments;
      
      // Top circular edge (thin rectangle between outer and inner circle)
      faces.push({ 
        vertices: [i*2, next*2, innerStart + next*2, innerStart + i*2], 
        showStroke: false, 
        isEdgeFace: true 
      });
      
      // Bottom circular edge  
      faces.push({ 
        vertices: [i*2+1, innerStart + i*2+1, innerStart + next*2+1, next*2+1], 
        showStroke: false, 
        isEdgeFace: true 
      });
    }
    
    return { vertices, faces };
  };

  const { vertices, faces } = createCylinderVertices();
  const shapeData = { vertices, faces, edges: [] };

  // 4 angles showing cylindrical form with circular ends
  const rotations = [
    { x: 10, y: 25 },   // slight angle showing circles and height
    { x: 20, y: 0 },    // side view showing cylinder profile
    { x: 5, y: 45 },    // angled view
    { x: 15, y: 10 }    // showing circular top clearly
  ];
  const selectedRotation = rotations[Math.floor(Math.random() * 4)];

  return <Shape3D shapeData={shapeData} color="#ed64a6" rotation={selectedRotation} />;
};

export const Cone = () => {
  const createConeVertices = (radius = 0.5, height = 1, segments = 16) => {
    const vertices = [];
    const faces = [];
    
    // Create base circle
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * 2 * Math.PI;
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);
      vertices.push([x, -height/2, z]);
    }
    
    // Add apex and base center
    vertices.push([0, height/2, 0]);   // apex
    vertices.push([0, -height/2, 0]);  // base center
    
    const apex = segments;
    const baseCenter = segments + 1;
    
    // Create additional vertices for thin edge outline
    const edgeWidth = 0.04; // Thicker edge width for better visibility
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * 2 * Math.PI;
      // Inner edge vertices (slightly smaller radius) at base level
      vertices.push([(radius - edgeWidth) * Math.cos(angle), -height/2, (radius - edgeWidth) * Math.sin(angle)]);
    }
    
    const innerStart = segments + 2;
    
    // Create side faces (no strokes - just colored surface)
    for (let i = 0; i < segments; i++) {
      const next = (i + 1) % segments;
      faces.push({ vertices: [apex, next, i], showStroke: false });
    }
    
    // Create base face (no strokes - these are internal triangulation)
    for (let i = 0; i < segments; i++) {
      const next = (i + 1) % segments;
      faces.push({ vertices: [baseCenter, i, next], showStroke: false });
    }
    
    // Create thin edge faces for circular base outline
    for (let i = 0; i < segments; i++) {
      const next = (i + 1) % segments;
      
      // Base circular edge (thin rectangle between outer and inner circle)
      faces.push({ 
        vertices: [i, innerStart + i, innerStart + next, next], 
        showStroke: false, 
        isEdgeFace: true 
      });
    }
    
    return { vertices, faces };
  };

  const { vertices, faces } = createConeVertices();
  const shapeData = { vertices, faces, edges: [] };

  // 4 angles showing cone form with circular base and apex
  const rotations = [
    { x: 15, y: 20 },   // showing base circle and point
    { x: 10, y: 40 },   // angled view of cone
    { x: 25, y: 10 },   // side profile
    { x: 8, y: 30 }     // clear base and apex view
  ];
  const selectedRotation = rotations[Math.floor(Math.random() * 4)];

  return <Shape3D shapeData={shapeData} color="#667eea" rotation={selectedRotation} />;
};

export const Sphere = () => {
  const createSphereVertices = (radius = 0.5, latSegments = 8, lonSegments = 12) => {
    const vertices = [];
    const faces = [];
    
    // Create vertices
    for (let lat = 0; lat <= latSegments; lat++) {
      const theta = lat * Math.PI / latSegments;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);
      
      for (let lon = 0; lon <= lonSegments; lon++) {
        const phi = lon * 2 * Math.PI / lonSegments;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);
        
        const x = cosPhi * sinTheta;
        const y = cosTheta;
        const z = sinPhi * sinTheta;
        
        vertices.push([x * radius, y * radius, z * radius]);
      }
    }
    
    // Create faces (no strokes - would create too much mesh clutter)
    for (let lat = 0; lat < latSegments; lat++) {
      for (let lon = 0; lon < lonSegments; lon++) {
        const first = (lat * (lonSegments + 1)) + lon;
        const second = first + lonSegments + 1;
        
        faces.push({ vertices: [first, second, first + 1], showStroke: false });
        faces.push({ vertices: [second, second + 1, first + 1], showStroke: false });
      }
    }
    
    return { vertices, faces };
  };

  const { vertices, faces } = createSphereVertices();
  const shapeData = { vertices, faces, edges: [], isSpherical: true };

  // 4 different angles (sphere looks the same but adds variety)
  const rotations = [
    { x: 15, y: 25 },   // standard angle
    { x: 10, y: 35 },   // different rotation
    { x: 20, y: 15 },   // another angle
    { x: 12, y: 40 }    // varied position
  ];
  const selectedRotation = rotations[Math.floor(Math.random() * 4)];

  return <Shape3D shapeData={shapeData} color="#d69e2e" rotation={selectedRotation} />;
};

export const Pyramid = () => {
  const shapeData = {
    vertices: [
      [0, 0.7, 0],           // apex
      [-0.5, -0.3, -0.5],    // base vertex 1
      [0.5, -0.3, -0.5],     // base vertex 2
      [0.5, -0.3, 0.5],      // base vertex 3
      [-0.5, -0.3, 0.5]      // base vertex 4
    ],
    edges: [
      [0, 1], [0, 2], [0, 3], [0, 4],
      [1, 2], [2, 3], [3, 4], [4, 1]
    ],
    faces: [
      [0, 1, 2],    // side face 1
      [0, 2, 3],    // side face 2
      [0, 3, 4],    // side face 3
      [0, 4, 1],    // side face 4
      [1, 2, 3, 4]  // base face
    ]
  };

  // 4 angles showing pyramid form with square base and apex
  const rotations = [
    { x: 18, y: 30 },   // showing base and triangular faces
    { x: 12, y: 45 },   // angled to show square base
    { x: 25, y: 15 },   // side view showing height
    { x: 10, y: 20 }    // clear pyramid form
  ];
  const selectedRotation = rotations[Math.floor(Math.random() * 4)];

  return <Shape3D shapeData={shapeData} color="#dc2626" rotation={selectedRotation} />;
};

