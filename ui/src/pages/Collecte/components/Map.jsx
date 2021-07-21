import { Box, Input, Spinner, Image, Text, HStack } from "@chakra-ui/react";
import React, { useState } from "react";
import markerMove from "./marker.png";
import { GoogleMap, Autocomplete, Marker, useLoadScript, InfoBox } from "@react-google-maps/api";

const defaultContainerStyle = {
  width: "100%",
  height: "600px",
  marginTop: "2rem",
};

const defaultCenter = {
  lat: 46.856731,
  lng: 2.515597,
};

const libraries = ["places"];

function Map({ onPositionChanged, withAutoComplete, position, defaultZoom, containerStyle }) {
  const [autocomplete, setAutocomplete] = useState();
  const [showMarker, setShowMarker] = useState(!withAutoComplete);
  const [zoom, setZoom] = useState(defaultZoom || 6);
  // eslint-disable-next-line no-unused-vars
  const [map, setMap] = React.useState(null);
  const [currentPosition, setCurrentPosition] = useState(!position ? defaultCenter : position);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GMAP_API_KEY,
    libraries,
    language: "fr",
  });

  const onLoadA = (autocomplete) => {
    setAutocomplete(autocomplete);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      setAutocomplete(autocomplete.getPlace());
      setShowMarker(true);
      setZoom(17);

      const lat = autocomplete.getPlace().geometry.location.lat();
      const lng = autocomplete.getPlace().geometry.location.lng();
      setCurrentPosition({
        lat,
        lng,
      });
      onPositionChanged({
        latitude: lat,
        longitude: lng,
      });
    } else {
      console.log("Autocomplete is not loaded yet!");
    }
  };

  const onMarkerChanged = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setCurrentPosition({ lat: lat, lng: lng });
    onPositionChanged({ latitude: lat, longitude: lng });
  };

  const onLoad = React.useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null);
  }, []);

  if (loadError) {
    return <div>Map cannot be loaded right now, sorry.</div>;
  }

  return isLoaded ? (
    <Box p={3}>
      {withAutoComplete && (
        <Autocomplete onLoad={onLoadA} onPlaceChanged={onPlaceChanged}>
          <Box mb={3}>
            <Input type="text" name="cfd" placeholder="Chercher une adresse" required />
          </Box>
        </Autocomplete>
      )}

      <GoogleMap
        mapContainerStyle={containerStyle || defaultContainerStyle}
        center={currentPosition}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {showMarker && !withAutoComplete && <Marker position={currentPosition} />}
        {showMarker && withAutoComplete && (
          <Marker position={currentPosition} onDragEnd={(e) => onMarkerChanged(e)} draggable={true} />
        )}
        <></>
      </GoogleMap>
      {showMarker && withAutoComplete && (
        <HStack>
          <Image src={markerMove} alt="move marker" w="35px" />
          <Text fontSize="0.8rem">
            Si vous souhaitez être plus précis sur la position, vous pouvez déplacer le marqueur sur la carte.
          </Text>
        </HStack>
      )}
    </Box>
  ) : (
    <Spinner />
  );
}

export default React.memo(Map);
