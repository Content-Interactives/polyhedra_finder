import React from 'react';

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
const Shape3D = ({ shapeData, width = 200, height = 150, color = '#0ea5e9', hideInternalEdges = false, showCircularOutline = false }) => {
  // Fixed rotation for consistent shape presentation
  const rotation = { x: 15, y: 25 };

  const projectedVertices = shapeData.vertices.map(vertex => project(vertex, rotation));

  const sortedFaces = [...shapeData.faces].map((face, index) => ({
    vertices: face,
    center: getFaceCenter(shapeData.vertices, face),
    index
  })).sort((a, b) => {
    const centerA = rotatePoint(a.center, rotation)[2];
    const centerB = rotatePoint(b.center, rotation)[2];
    return centerB - centerA;
  });

    return (
    <svg 
      width={width} 
      height={height} 
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-full select-none"
    >
       {/* Render outline edges first so faces can cover them */}
       {hideInternalEdges && shapeData.outlineEdges && shapeData.outlineEdges.map((edge, index) => (
         <line
           key={`outline-${index}`}
           x1={projectedVertices[edge[0]].x}
           y1={projectedVertices[edge[0]].y}
           x2={projectedVertices[edge[1]].x}
           y2={projectedVertices[edge[1]].y}
           stroke="black"
           strokeWidth="2"
         />
       ))}
       
       {sortedFaces.map(({ vertices, index }) => (
         <polygon
           key={`face-${index}`}
           points={vertices
             .map(v => `${projectedVertices[v].x},${projectedVertices[v].y}`)
             .join(' ')}
           fill={color}
           fillOpacity="0.7"
           stroke={hideInternalEdges ? "none" : "black"}
           strokeWidth="2"
         />
       ))}
       
       {showCircularOutline && (
         <circle
           cx={100}
           cy={75}
           r={45 * (4 / (4 + 0))}
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

  return <Shape3D shapeData={shapeData} color="#0ea5e9" />;
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

  return <Shape3D shapeData={shapeData} color="#48bb78" />;
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

  return <Shape3D shapeData={shapeData} color="#ed8936" />;
};

export const Cylinder = () => {
  const createCylinderVertices = (radius = 0.5, height = 1, segments = 16) => {
    const vertices = [];
    const faces = [];
    const outlineEdges = [];
    
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
    
    // Create side faces
    for (let i = 0; i < segments; i++) {
      const next = (i + 1) % segments;
      faces.push([i*2, next*2, next*2+1, i*2+1]);
    }
    
    // Create top and bottom faces
    for (let i = 0; i < segments; i++) {
      const next = (i + 1) % segments;
      faces.push([topCenter, next*2, i*2]);
      faces.push([bottomCenter, i*2+1, next*2+1]);
    }
    
    // Create outline edges (only top and bottom circles)
    for (let i = 0; i < segments; i++) {
      const next = (i + 1) % segments;
      // Top circle outline
      outlineEdges.push([i*2, next*2]);
      // Bottom circle outline  
      outlineEdges.push([i*2+1, next*2+1]);
    }
    
    return { vertices, faces, outlineEdges };
  };

  const { vertices, faces, outlineEdges } = createCylinderVertices();
  const shapeData = { vertices, faces, edges: [], outlineEdges };

  return <Shape3D shapeData={shapeData} hideInternalEdges={true} color="#ed64a6" />;
};

export const Cone = () => {
  const createConeVertices = (radius = 0.5, height = 1, segments = 16) => {
    const vertices = [];
    const faces = [];
    const outlineEdges = [];
    
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
    
    // Create side faces
    for (let i = 0; i < segments; i++) {
      const next = (i + 1) % segments;
      faces.push([apex, next, i]);
    }
    
    // Create base face
    for (let i = 0; i < segments; i++) {
      const next = (i + 1) % segments;
      faces.push([baseCenter, i, next]);
    }
    
    // Create outline edges (only base circle)
    for (let i = 0; i < segments; i++) {
      const next = (i + 1) % segments;
      // Base circle outline
      outlineEdges.push([i, next]);
    }
    
    return { vertices, faces, outlineEdges };
  };

  const { vertices, faces, outlineEdges } = createConeVertices();
  const shapeData = { vertices, faces, edges: [], outlineEdges };

  return <Shape3D shapeData={shapeData} hideInternalEdges={true} color="#667eea" />;
};

export const Sphere = () => {
  const createSphereVertices = (radius = 0.5, latSegments = 8, lonSegments = 12) => {
    const vertices = [];
    const faces = [];
    const outlineEdges = [];
    
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
    
    // Create faces
    for (let lat = 0; lat < latSegments; lat++) {
      for (let lon = 0; lon < lonSegments; lon++) {
        const first = (lat * (lonSegments + 1)) + lon;
        const second = first + lonSegments + 1;
        
        faces.push([first, second, first + 1]);
        faces.push([second, second + 1, first + 1]);
      }
    }
    
    // Sphere has no outline edges - completely smooth
    
    return { vertices, faces, outlineEdges };
  };

  const { vertices, faces, outlineEdges } = createSphereVertices();
  const shapeData = { vertices, faces, edges: [], outlineEdges };

  return <Shape3D shapeData={shapeData} hideInternalEdges={true} showCircularOutline={true} color="#d69e2e" />;
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

  return <Shape3D shapeData={shapeData} color="#dc2626" />;
};

