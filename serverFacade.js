
import { SERVER_URL } from "./settings";

ServerFacade = () => {

  async function fetchNearByPlayers(userName, password, lat, lon, distance) {
    const newPosition = {
      userName,
      password,
      lon,
      lat,
      distance
    };
    const config = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newPosition)
    };
    const res = await fetch(`${SERVER_URL}/api/game/nearbyplayers`, config).then(res => res.json());
    return res;
  }

  async function fetchGameArea() {
    const res = await fetch(`${SERVER_URL}/api/game/gamearea`).then(res => res.json());
    return res.coordinates;
  }

  async function isUserInArea(lon, lat) {
    const status = await fetch(`${SERVER_URL}/api/game/isuserinarea/${lon}/${lat}`).
      then(res => res.json())
    return status;
  }

  return {
    fetchGameArea,
    isUserInArea,
    fetchNearByPlayers
  }
}

export default ServerFacade();