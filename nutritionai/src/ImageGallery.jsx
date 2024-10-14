// src/ImageGallery.jsx
import axios from 'axios';
import { useEffect, useState } from 'react';

function ImageGallery() {
    const [images, setImages] = useState([]);

    useEffect(() => {
        axios.get('/api/images')
            .then((response) => {
                setImages(response.data);
            })
            .catch((error) => {
                console.error('Error fetching images:', error);
            });
    }, []);

    return (
        <div>
            <h1>Image Gallery</h1>
            {images.length > 0 ? (
                images.map((imageSrc, index) => (
                    <img
                        key={index}
                        src={imageSrc}
                        alt={`Image ${index}`}
                        style={{ width: '200px', margin: '10px' }}
                    />
                ))
            ) : (
                <p>Loading images...</p>
            )}
        </div>
    );
}

export default ImageGallery;
