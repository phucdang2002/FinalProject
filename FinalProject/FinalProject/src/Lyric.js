import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import TrackPlayer, { usePlaybackState } from "react-native-track-player";
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

const Lyric = () => {
    const navigation = useNavigation();
    const playbackState = usePlaybackState();
    const [track, setTrack] = useState({
        title: "",
        lyric: "",
    });
    useFocusEffect(
        useCallback(() => {
            const hideTabBar = () => {
                navigation.getParent()?.getParent()?.setOptions({ tabBarStyle: {display: "none"} });
            };
            const showTabBar = () => {
                navigation.getParent()?.getParent()?.setOptions({ tabBarStyle: {display: "flex"} });
            };
            
            hideTabBar();
            return () => {
                showTabBar();
            };
        }, [navigation])
    );
    useEffect(() => {
        const getLyric = async () => {
            const song =await TrackPlayer.getActiveTrack();
            if (song) {
                setTrack({
                    title: song.title,
                    lyric: song.lyric,
                });
            }
        }
        getLyric();
    }, [playbackState])
    return (
        <SafeAreaView style = {{flex: 1}}>
            <TouchableOpacity style={styles.goBack} onPress={() => navigation.navigate("Playlist")}>
                <MaterialCommunityIcon name="chevron-down" size={32} color="#fff"/>
            </TouchableOpacity>
            <ScrollView>
                <Text style={styles.title}>{track.title}</Text>
                <Text style={styles.lyric}>{track.lyric}</Text>
            </ScrollView>
            
        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    goBack: {
        marginTop: 10,
        marginLeft: 16,
        width: 30
    },
    title: {
        fontSize: 30,
        color: "#FFF",
        textAlign: "center"
    },
    lyric: {
        fontSize: 20,
        color: "#FFF",
        textAlign: "center"
    }
})
export default Lyric;