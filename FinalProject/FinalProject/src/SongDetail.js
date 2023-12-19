import moment from "moment";
import {useState} from 'react';
import { Image, StyleSheet, Text, View } from "react-native";
import { IconButton } from "react-native-paper";
import AsyncStorage from '@react-native-async-storage/async-storage';

const Detail = ({route}) => {
    const [toggle, setToggle] = useState(false);
    const {song} = route.params;
    const {id, title, artist, duration, artwork} = song;
    const getFavorite = async (Id) => {
        const songs = await getPlaylist();
        const songId = songs.findIndex((song)=>song.id===Id);
        setToggle(songs[songId].favorite)
    }
    getFavorite(id);
    
    async function getPlaylist() {
        try {
            const value = await AsyncStorage.getItem('songs');
            if (value !== null) {
                return JSON.parse(value);
            }
        } catch (error) {
            console.log(error);
        }
    }
    const changeFavorite = async (Id) => {
        const songs = await getPlaylist();
        const songId = songs.findIndex((song)=>song.id===Id);
        if (songId !== -1) {
            songs[songId].favorite = !songs[songId].favorite;
            await AsyncStorage.setItem('songs', JSON.stringify(songs));
            setToggle(!toggle)
          } else {
            console.log('Song not found in the playlist.');
          }
    }
    
    return (
        <View style={styles.detail}>
            <View style={styles.box}>
                <Image style={styles.img} source={{uri: artwork}}/>
            </View>
            <View style={styles.info}>
                <View style={styles.content}>
                    <Text style={styles.title}>Title: </Text>
                    <Text style={styles.txt}>{title}</Text>
                </View>
                <View style={styles.content}>
                    <Text style={styles.title}>Singer: </Text>
                    <Text style={styles.txt}>{artist}</Text>
                </View>
                <View style={styles.content}>
                    <Text style={styles.title}>Length: </Text>
                    <Text style={styles.txt}>{moment.utc(duration * 1000).format("m:ss")}</Text>
                </View>
            </View>
            <View style={{flex: 2, alignItems: "center", justifyContent: "center"}}>
                <IconButton
                    icon={toggle?'heart':'heart-outline'}
                    iconColor="#663399"
                    size={40}
                    onPress={()=>{changeFavorite(id)}}
                />
          </View>
        </View>
    )
}
const styles = StyleSheet.create({
    detail: {
        flex: 1,
    },
    info: {
        flex: 3,
        margin: 30
    },
    content: {
        flexDirection: "row",
        alignItems: "center"
    },
    title: {
        fontSize: 25,
        fontWeight: "bold"
    },
    txt: {
        fontSize: 22
    },
    box: {
        flex: 5,
        alignItems: "center",
        justifyContent: "center"
    },
    img: {
        width: 300,
        height: 300,
    }
})
export default Detail;