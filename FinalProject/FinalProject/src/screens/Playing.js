import React from "react";
import { SafeAreaView, StyleSheet, View, Text , Image} from "react-native";



const Playing = () =>{
return (
    <SafeAreaView style={styles.container}>
        <View style={{ alignItems: "center"}}>
            <View style={{alignItems: "center", marginTop: 24 }}>
                <Text style={styles.textLight}>NOW PLAYING</Text>
                <Text style={styles.songTitle}>Head title of a Song</Text>
            </View>
        </View>

        <View style={styles.coverContainer}>
            <View style={styles.cover}></View>
        </View>

        
    </SafeAreaView>
)
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#121212"
    },
    textLight:{
        color: "#fff",
        fontSize: 12
    },
    songTitle: {
        color: "#fff",
        fontSize: 20
    },
    coverContainer:{
        marginTop: 32,
        width: 250,
        height: 250
    }
    ,cover: {
        width: 250,
        height: 250,
        borderRadius: 125,
        backgroundColor: "#fff"
    }
})
export default Playing;