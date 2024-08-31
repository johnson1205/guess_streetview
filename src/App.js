import React, { useState, useEffect } from 'react';
import { GoogleMap, StreetViewPanorama, useJsApiLoader, Marker, Polyline } from "@react-google-maps/api";
import { DOMParser } from 'xmldom';
import raw from './map.kml';
import * as toGeoJSON from '@tmcw/togeojson';
import earcut from 'earcut';



const containerStyle = {
  width: '100%',
  height: '400px'
};

const kmlFilePath = './map.kml';


const GeoGuesser = ({ apiKey }) => {
  const [lat, setLat] = useState(0);
  const [lng, setLng] = useState(0);
  const [guessLat, setGuessLat] = useState(25.04622497198321);
  const [guessLng, setGuessLng] = useState(121.51743120852169);
  const [difference, setDifference] = useState(null);
  const [showDifference, setShowDifference] = useState(false);
  const [markers, setMarkers] = useState([]);
  const [showButton, setShowButton] = useState(true);
  const [polygons, setPolygons] = useState([]);
  const MIN_LATITUDE = 25.109648919691022;
  const MAX_LATITUDE = 24.938563476039995;
  const MIN_LONGITUDE = 121.42900431428681;
  const MAX_LONGITUDE = 121.66949047322854;
  
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey
  });


  const isPointInPolygon = (point, coordinates) => {
    const [lng, lat] = point;
    let inside = false;
    for (let i = 0, j = coordinates.length - 1; i < coordinates.length; j = i++) {
      const xi = coordinates[i][0], yi = coordinates[i][1];
      const xj = coordinates[j][0], yj = coordinates[j][1];
      const intersect = ((yi > lat) !== (yj > lat)) && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  const getBoundingBox = (coordinates) => {
    const lats = coordinates.map(coord => coord[1]);
    const lngs = coordinates.map(coord => coord[0]);
    return [Math.min(...lngs), Math.min(...lats), Math.max(...lngs), Math.max(...lats)];
  };

  const generateRandomPosition = (polygons) => {
    if (polygons.length > 0) {
      const polygon = polygons[Math.floor(Math.random() * polygons.length)];
      const coordinates = polygon.geometry.coordinates[0].map(coord => [coord[0], coord[1]]);
      const flatCoordinates = coordinates.flat();
      const triangles = earcut(flatCoordinates);
      const triangleIndex = Math.floor(Math.random() * triangles.length / 3) * 3;
      const point = randomPointInTriangle(
        [flatCoordinates[triangles[triangleIndex] * 2], flatCoordinates[triangles[triangleIndex] * 2 + 1]],
        [flatCoordinates[triangles[triangleIndex + 1] * 2], flatCoordinates[triangles[triangleIndex + 1] * 2 + 1]],
        [flatCoordinates[triangles[triangleIndex + 2] * 2], flatCoordinates[triangles[triangleIndex + 2] * 2 + 1]]
      );
      setLng(point[0]);
      setLat(point[1]);
    }
  };
  
  
  const randomPointInTriangle = (a, b, c) => {
    const r1 = Math.random();
    const r2 = Math.random();
    const sqrtR1 = Math.sqrt(r1);
  
    return [
      (1 - sqrtR1) * a[0] + sqrtR1 * (1 - r2) * b[0] + sqrtR1 * r2 * c[0],
      (1 - sqrtR1) * a[1] + sqrtR1 * (1 - r2) * b[1] + sqrtR1 * r2 * c[1]
    ];
  };


  useEffect(() => {
    fetch(raw)
      .then(response => response.text())
      .then(data => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, "text/xml");
        const kml = toGeoJSON.kml(xmlDoc);

        const newPolygons = kml.features.filter(feature => feature.geometry.type === 'Polygon');
        setPolygons(newPolygons);
        generateRandomPosition(newPolygons);
      });
  }, []);

  const randomPosition = {
    lat: lat,
    lng: lng
  }

  const guessPosition = {
    lat: parseFloat(guessLat) || 0,
    lng: parseFloat(guessLng) || 0
  };

  // 將經度和緯度轉換為弧度
  const toRadians = (angle) => {
    return angle * (Math.PI / 180);
  };

  // 使用球面三角法計算兩點之間的距離
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const earthRadius = 6371; // 地球半徑，單位為公里
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = earthRadius * c;
    return distance;
  };

  const handleGuess = () => {
    const diff = calculateDistance(parseFloat(guessLat), parseFloat(guessLng), lat, lng);
    setDifference(diff.toFixed(2));
    setShowDifference(true);
    setMarkers([...markers, {lat: guessPosition.lat, lng: guessPosition.lng}, {lat: lat, lng: lng}]);
    setShowButton(false);
  };


  return (
    <div>
      <h1>GeoGuesser</h1>
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1 }}>
          {isLoaded && (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={randomPosition}
              zoom={14}
              onClick={(e) => {
                setGuessLat(e.latLng.lat());
                setGuessLng(e.latLng.lng());
              }}
            >
              <StreetViewPanorama
                position={randomPosition}
                visible
                options={{
                  radius: 5000,
                  source: 'outdoor'
                }}
              />
              {markers.map((marker, index) => (
                <Marker
                  key={index}
                  position={marker}
                  icon={{
                    url: index % 2 === 0 ? 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
                    scaledSize: new window.google.maps.Size(30, 30),
                  }}
                  onClick={() => {
                    if (index % 2 === 0) {
                      alert(`Guessed Coordinate: ${marker.lat}, ${marker.lng}`);
                    } else {
                      alert(`Actual Coordinate: ${marker.lat}, ${marker.lng}`);
                    }
                  }}
                />
              ))}
              {markers.length === 2 && (
                <Polyline
                  path={markers}
                  options={{
                    strokeColor: '#FF0000',
                    strokeOpacity: 1.0,
                    strokeWeight: 2,
                  }}
                />
              )}
            </GoogleMap>
          )}
        </div>
        <div style={{ flex: 1 }}>
          {isLoaded && (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={guessPosition}
              zoom={14}
              onClick={(e) => {
                setGuessLat(e.latLng.lat());
                setGuessLng(e.latLng.lng());
              }}
            >
              {markers.map((marker, index) => (
                <Marker
                  key={index}
                  position={marker}
                  icon={{
                    url: index % 2 === 0 ? 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
                    scaledSize: new window.google.maps.Size(30, 30),
                  }}
                  onClick={() => {
                    if (index % 2 === 0) {
                      alert(`Guessed Coordinate: ${marker.lat}, ${marker.lng}`);
                    } else {
                      alert(`Actual Coordinate: ${marker.lat}, ${marker.lng}`);
                    }
                  }}
                />
              ))}
              {markers.length === 2 && (
                <Polyline
                  path={markers}
                  options={{
                    strokeColor: '#FF0000',
                    strokeOpacity: 1.0,
                    strokeWeight: 2,
                  }}
                />
              )}
            </GoogleMap>
          )}
        </div>
      </div>
      <div>
        <input
          type="text"
          placeholder="Guess Latitude"
          value={guessLat}
          onChange={(e) => setGuessLat(e.target.value)}
        />
        <input
          type="text"
          placeholder="Guess Longitude"
          value={guessLng}
          onChange={(e) => setGuessLng(e.target.value)}
        />
        {showButton && <button onClick={handleGuess}>Confirm</button>}
      </div>
      {showDifference && (
        <div>
          <p>Actual Location: Latitude: {lat}, Longitude: {lng}</p>
          <p>Your Guess: Latitude: {guessLat}, Longitude: {guessLng}</p>
          <p>Difference: {difference} km</p>
        </div>
      )}
    </div>
  );
};

function App() {
  const [apiKey, setApiKey] = useState('');
  const [isApiKeySet, setIsApiKeySet] = useState(false);

  const handleSubmit = () => {
    if (apiKey.trim() !== '') {
      setIsApiKeySet(true);
    }
  };

  return (
    <div className="App">
      {!isApiKeySet && (
        <div>
          <h1>Please enter your Google Maps API Key:</h1>
          <h1>version 1.1</h1>
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <button onClick={handleSubmit}>Submit</button>
        </div>
      )}
      {isApiKeySet && <GeoGuesser apiKey={apiKey}></GeoGuesser>}
    </div>
  );
}

export default App;
