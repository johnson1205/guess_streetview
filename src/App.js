import React, { useState, useEffect } from 'react';
import { GoogleMap, StreetViewPanorama, useJsApiLoader, Marker, Polyline } from "@react-google-maps/api";

const containerStyle = {
  width: '100%',
  height: '400px'
};

const GeoGuesser = ({ apiKey }) => {
  const [lat, setLat] = useState(0);
  const [lng, setLng] = useState(0);
  const [guessLat, setGuessLat] = useState(25.04622497198321);
  const [guessLng, setGuessLng] = useState(121.51743120852169);
  const [difference, setDifference] = useState(null);
  const [showDifference, setShowDifference] = useState(false);
  const [markers, setMarkers] = useState([]);
  const [showButton, setShowButton] = useState(true); // 新增一個狀態來控制按鈕顯示
  const MIN_LATITUDE = 25.109648919691022;
  const MAX_LATITUDE = 24.938563476039995;
  const MIN_LONGITUDE = 121.42900431428681;
  const MAX_LONGITUDE = 121.66949047322854;
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey
  });

  useEffect(() => {
    // 隨機生成街景的經緯度
    const randomLat = Math.random() * (MAX_LATITUDE - MIN_LATITUDE) + MIN_LATITUDE;
    const randomLng = Math.random() * (MAX_LONGITUDE - MIN_LONGITUDE) + MIN_LONGITUDE;
    setLat(randomLat);
    setLng(randomLng);
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

  // 在 handleGuess 函數中計算距離
  const handleGuess = () => {
    // 計算猜測的經緯度與實際經緯度之間的距離
    const diff = calculateDistance(parseFloat(guessLat), parseFloat(guessLng), lat, lng);
    setDifference(diff.toFixed(2)); // 四捨五入到小數點後兩位
    setShowDifference(true);
    // 將猜測位置和實際位置添加到標記列表中
    setMarkers([...markers, {lat: guessPosition.lat, lng: guessPosition.lng}, {lat: lat, lng: lng}]);
    setShowButton(false); // 按下按鈕後隱藏按鈕
  };


  return (
    <div>
      <h1>GeoGuesser</h1>
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1 }}>
          {/* 全景視窗 */}
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
          {/* Google 地圖視窗 */}
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
        {/* 地圖元件，用於使用者猜測街景的位置 */}
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
