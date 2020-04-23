import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  StyleSheet,
  Alert,
  StatusBar,
} from "react-native";
import * as Location from "expo-location";
import MapView from "react-native-maps";
import Constants from "expo-constants";
import facade from "./serverFacade";
import Login from "./components/login";
import { Icon, Header, Button } from "react-native-elements";

export default App = () => {
  //HOOKS
  const [position, setPosition] = useState({ latitude: null, longitude: null });
  const [errorMessage, setErrorMessage] = useState(null);
  const [gameArea, setGameArea] = useState([]);
  const [region, setRegion] = useState(null);
  const [serverIsUp, setServerIsUp] = useState(false);
  const [status, setStatus] = useState("");
  const [nearByPlayers, setNearByPlayers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  let mapRef = useRef(null);

  useEffect(() => {
    getLocationAsync();
  }, []);

  useEffect(() => {
    getGameArea();
  }, []);

  getNearByPlayers = async (userName, password, lat, lon, distance) => {
    try {
      const players = await facade.fetchNearByPlayers();
      setNearByPlayers(players);
    } catch (err) {
      setErrorMessage("Could not fetch NearByPlayers");
    }
  };

  async function getGameArea() {
    //Fetch gameArea via the facade, and call this method from within (top) useEffect
    try {
      const area = await facade.fetchGameArea();
      setGameArea(area);
      setServerIsUp(true);
    } catch (err) {
      setErrorMessage("Could not fetch GameArea");
    }
  }

  getLocationAsync = async () => {
    //Request permission for users location, get the location and call this method from useEffect
    let { status } = await Location.requestPermissionsAsync();
    if (status !== "granted") {
      setErrorMessage("Permission to access location was denied");
      return;
    }

    let location = await Location.getCurrentPositionAsync({
      enableHighAccuracy: true,
    });
    setPosition({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
    setRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });
  };

  /*
  When a press is done on the map, coordinates (lat,lon) are provided via the event object
  */
  onMapPress = async (event) => {
    //Get location from where user pressed on map, and check it against the server
    const coordinate = event.nativeEvent.coordinate;
    const lon = coordinate.longitude;
    const lat = coordinate.latitude;
    try {
      const status = await facade.isUserInArea(lon, lat);
      showStatusFromServer(setStatus, status);
    } catch (err) {
      Alert.alert("Error", "Server could not be reached");
      setServerIsUp(false);
    }
  };

  onCenterGameArea = () => {
    // (RED) Center map around the gameArea fetched from the backend
    // Hardcoded, should be calculated as center of polygon received from server
    const latitude = 55.777055745928664;
    const longitude = 12.55897432565689;
    mapRef.current.animateToRegion(
      {
        latitude,
        longitude,
        latitudeDelta: 0.002,
        longitudeDelta: 0.04,
      },
      1000
    );
  };

  sendRealPosToServer = async () => {
    //Upload users current position to the isuserinarea endpoint and present result
    const lat = position.latitude;
    const lon = position.longitude;
    try {
      const status = await facade.isUserInArea(lon, lat);
      showStatusFromServer(setStatus, status);
    } catch (err) {
      setErrorMessage("Could not get result from server");
      setServerIsUp(false);
    }
  };

  const info = serverIsUp ? status : " Server is not up";
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {!region && <Text style={styles.fetching}>.. Fetching data</Text>}
      <Header
        placement="left"
        leftComponent={{ icon: "menu", color: "#fff" }}
        centerComponent={{ text: "GEO APP", style: { color: "#fff" } }}
        rightComponent={
          <Icon
            name="ios-log-in"
            onPress={() => setModalVisible(!modalVisible)}
            type="ionicon"
            color="#fff"
          />
        }
      />

      <Login visible={modalVisible} setVisible={setModalVisible} />

      {/* Add MapView */}
      {region && (
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          onPress={onMapPress}
          mapType="standard"
          region={region}
        >
          {/*App MapView.Polygon to show gameArea*/}
          {serverIsUp && (
            <MapView.Polygon
              coordinates={gameArea}
              strokeWidth={1}
              onPress={onMapPress}
              fillColor="rgba(255,255,255,0.4)"
              tappable={true}
            />
          )}

          {/*App MapView.Marker to show users current position*/}
          <MapView.Marker
            title="me"
            pinColor="blue"
            coordinate={{
              longitude: Number(position.longitude),
              latitude: Number(position.latitude),
            }}
          />
          {/* {nearByPlayers.map(p => {
            <MapView.Marker
              title={p.}
            />
          })} */}
          <View>
            <Text>
              Your position (lat,long): {position.latitude},{" "}
              {position.longitude}
            </Text>
            <Text>{info}</Text>
            <Button
              style={{ padding: 10 }}
              onPress={sendRealPosToServer}
              title="Upload real Position"
            />
            <Button
              style={{ padding: 10 }}
              onPress={() => onCenterGameArea()}
              title="Show Game Area"
            />
          </View>
        </MapView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  touchable: { backgroundColor: "#4682B4", margin: 3 },
  touchableTxt: { fontSize: 22, textAlign: "center", padding: 5 },
  positionInfo: {
    flex: 1,
    backgroundColor: "white",
  },

  fetching: {
    fontSize: 35,
    flex: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: Constants.statusBarHeight,
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    textAlign: "center",
  },
});

function showStatusFromServer(setStatus, status) {
  setStatus(status.msg);
  setTimeout(() => setStatus("- - - - - - - - - - - - - - - - - - - -"), 3000);
}
