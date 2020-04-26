import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  StyleSheet,
  Alert,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import * as Location from "expo-location";
import MapView from "react-native-maps";
import Constants from "expo-constants";
import facade from "./serverFacade";
import Login from "./components/Login";
import { Icon, Header, Button } from "react-native-elements";

export default App = () => {
  //HOOKS
  const [position, setPosition] = useState({ latitude: null, longitude: null });
  const [errorMessage, setErrorMessage] = useState(null);
  const [region, setRegion] = useState(null);
  const [serverIsUp, setServerIsUp] = useState(false);
  const [status, setStatus] = useState("");
  const [nearByPlayers, setNearByPlayers] = useState();
  const [modalVisible, setModalVisible] = useState(false);
  const [showNearByPlayer, setShowNearByPlayer] = useState(false);
  let mapRef = useRef(null);

  useEffect(() => {
    getLocationAsync();
    // console.log(nearByPlayers)
  }, []);

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

  const loginHandler = async (credentials) => {
    setModalVisible(false);
    try {
      const players = await facade.fetchNearByPlayers(
        credentials.username,
        credentials.password,
        Number(position.latitude),
        Number(position.longitude),
        100,
      );
      setNearByPlayers(players);
      setShowNearByPlayer(true);
    } catch (err) {
      setErrorMessage("Wrong credentials");
    }
  };

  const info = serverIsUp ? status : " Server is not up";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Header
        placement="left"
        leftComponent={{ icon: "menu", color: "#fff" }}
        centerComponent={{
          text: "GEO GO!",
          style: {
            color: "#fff",
            fontSize: 18,
            fontFamily: "Helvetica Neue",
            fontWeight: "bold",
          },
        }}
        rightComponent={
          <Icon
            name="ios-log-in"
            onPress={() => setModalVisible(true)}
            type="ionicon"
            color="#fff"
            size={35}
          />
        }
      />
      {errorMessage && (
        alert(errorMessage),
        setErrorMessage(null)
      )}
      <Login
        login={loginHandler}
        visible={modalVisible}
        setVisible={setModalVisible}
      />
      <View style={{ flex: 1 }}>
        {!region && (
          <ActivityIndicator
            style={styles.waiting}
            size="small"
            color="#0000ff"
          />
        )}

        {/* Add MapView */}
        {region && (
          <MapView
            ref={mapRef}
            style={{ flex: 14 }}
            mapType="mutedStandard"
            region={region}
          >
            {/* {serverIsUp && alert("Server is up!")} */}

            {/*App MapView.Marker to show users current position*/}
            <MapView.Marker
              title="me"
              pinColor="blue"
              coordinate={{
                longitude: Number(position.longitude),
                latitude: Number(position.latitude),
              }}
            />
            {showNearByPlayer &&
              nearByPlayers.map((p, i) => (
                <MapView.Marker
                  key={i}
                  title={p.name}
                  coordinate={{
                    longitude: p.lon,
                    latitude: p.lat,
                  }}
                />
              ))}
          </MapView>
        )}
        {/* <View style={{ flex: 1, padding: 5 }}>
        <Text style={styles.paragraph}>
          Your position (lat,long): {position.latitude}, {position.longitude}
          {"\n\n"}
          {info}
        </Text>
      </View> */}
        {/* <View style={{ flex: 3 }}>
        <Button
          style={{ padding: 5 }}
          onPress={sendRealPosToServer}
          title="Upload real Position"
        />
        <Button
          style={{ padding: 5 }}
          onPress={() => onCenterGameArea()}
          title="Show Game Area"
        />
      </View> */}
      </View>
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
    fontFamily: "Helvetica Neue",
    fontSize: 18,
    textAlign: "center",
  },
  waiting: {
    flex: 14,
    justifyContent: "center",
  },
});

function showStatusFromServer(setStatus, status) {
  setStatus(status.msg);
  setTimeout(() => setStatus("- - - - - - - - - - - - - - - - - - - -"), 3000);
}
