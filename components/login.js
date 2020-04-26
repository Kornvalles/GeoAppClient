import React, { useState } from "react";
import { StyleSheet, Modal, TextInput, View } from "react-native";
import { Button } from "react-native-elements";

export default Login = (props) => {

  //HOOKS
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  return (
    <Modal
      presentationStyle="fullScreen"
      animationType="slide"
      visible={props.visible}
    >
      <View style={styles.container}>
        <TextInput
          keyboardType="ascii-capable"
          placeholder="Input username"
          textContentType="username"
          autoFocus={true}
          style={styles.input}
          onChangeText={(text) => setCredentials({...credentials, username: text})}
          value={credentials.username}
        />
        <TextInput
          keyboardType="ascii-capable"
          placeholder="Input password"
          secureTextEntry={true}
          textContentType="password"
          style={styles.input}
          onChangeText={(text) => setCredentials({...credentials, password: text})}
          value={credentials.password}
        />
        <Button
          title="Login"
          onPress={props.login.bind(this, credentials)}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 50
  },
  input: {
    width: "80%",
    borderColor: "black",
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
  },
});
