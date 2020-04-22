import React, { useState } from "react";
import {
    Text,
    StyleSheet,
    TouchableHighlight,
    SafeAreaView,
    Modal,
    TextInput,
    View
} from "react-native";

const MyButton = ({ txt, onPressButton }) => {
    return (
        <TouchableHighlight style={styles.touchable} onPress={onPressButton}>
            <Text style={styles.touchableTxt}>{txt}</Text>
        </TouchableHighlight>
    );
};

export default Login = props => {
    //HOOKS
    const [username, setUsername] = useState("Input username");
    const [password, setPassword] = useState("Input password");

    return (

        <Modal
            presentationStyle="overFullScreen"
            animationType="slide"
            visible={props.visible}
        >
            <SafeAreaView style={styles.container}>

                <TextInput
                    textContentType="username"
                    style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
                    onChangeText={text => setUsername(text)}
                    value={username}
                />
                <TextInput
                    secureTextEntry={true}
                    textContentType="password"
                    style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
                    onChangeText={text => setPassword(text)}
                    value={password}
                />
                <MyButton
                    txt="Login"
                    onPressButton={()}
                />
                <MyButton
                    txt="Back"
                    onPressButton={() => props.setVisible(!props.visible)}
                />


            </SafeAreaView>


        </Modal >


    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    touchable: { backgroundColor: "#4682B4", margin: 3 },
    touchableTxt: { fontSize: 22, textAlign: "center", padding: 5 }
});