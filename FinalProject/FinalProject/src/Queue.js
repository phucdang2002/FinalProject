import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View } from "react-native";
import { Icon } from "react-native-paper";
import TrackPlayer, { usePlaybackState } from "react-native-track-player";
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

const Queue = ({navigation}) => {
    const [tracks, setTracks] = useState([]);
    const [currentlyPlaying, setCurrentlyPlaying] = useState(0);
    const playbackState = usePlaybackState();
    const getQueue = async() => {
        const queue = await TrackPlayer.getQueue()
        setTracks(queue || []);
    }
    useEffect(() => {
        getQueue();
    },[]);
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
        const updateCurrentlyPlaying = async () => {
        const currentTrack = await TrackPlayer.getActiveTrack();
        if (currentTrack) {
            setCurrentlyPlaying(currentTrack.id);
        }
        };
        updateCurrentlyPlaying();
      }, [playbackState]);
    const selected = (track) => {
        const playTrack = async () => {
            const current = tracks.findIndex(item=>item.id===track.id);
            await TrackPlayer.skip(current);
            await TrackPlayer.play();
        }
        playTrack(); 
    }
    const deleteQueue = (track) => {
        const deleteFromTrack = async () => {
            const songs = await TrackPlayer.getQueue();
            const id = songs.findIndex(item=>item.id===track.id);
            await TrackPlayer.remove(id);
            setTracks(await TrackPlayer.getQueue() || []);
            if (tracks.length<=1){
                navigation.goBack();
            }
        }
        deleteFromTrack();
    }
    return (
        <SafeAreaView style={{flex: 1}}>
            <TouchableOpacity style={styles.goBack} onPress={() => navigation.goBack()}>
                <MaterialCommunityIcon name="chevron-down" size={32} color="#fff"/>
            </TouchableOpacity>
            <FlatList
                data={tracks}
                renderItem={({item})=> (
                    <TouchableHighlight onPress={()=>selected(item)}>
                        <View style={[styles.box, { backgroundColor: currentlyPlaying === item.id ? '#00c965' : '#616161' }]}>
                            <View>
                                <Text style={styles.title}>{item.title}</Text>
                                <Text style={styles.artist}>{item.artist}</Text>
                            </View>
                            <TouchableOpacity onPress={()=>deleteQueue(item)}><Icon source="close" size={20} color="#fff"/></TouchableOpacity>
                        </View>
                    </TouchableHighlight>
                )}
            />
        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    goBack: {
        marginTop: 10,
        marginLeft: 16,
        width: 30
    },
    box: {
        margin: 10,
        padding: 10,
        borderRadius: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    title: {
        color: "#fff",
        fontSize: 20
    },
    artist: {
        color: "#fff",
        fontSize: 16,
    }
})
export default Queue;