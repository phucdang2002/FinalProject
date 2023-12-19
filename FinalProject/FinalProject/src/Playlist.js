import axios from 'axios';
import {useEffect, useState, useCallback} from 'react';
import Icon from 'react-native-vector-icons/Entypo';
import {FlatList,Image,SafeAreaView,View,Text,StyleSheet,TouchableHighlight, TouchableOpacity} from 'react-native';
import {Menu,MenuOption,MenuOptions,MenuTrigger} from 'react-native-popup-menu';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import TrackPlayer, { State, usePlaybackState } from 'react-native-track-player';


const fetchSongs = async () => {
  const songs = await axios.get('http://34.136.63.21/musicdata.json');
  const SongData = await songs.data;
  return SongData.map(mapSongs);
};
const mapSongs = (song) => {
  const {id, title, artist, url, lyric, duration, artwork} = song;
  return {
    id,
    title,
    artist,
    url,
    lyric,
    duration,
    artwork,
    favorite: false,
  }
}
const savePlaylist = async (data) => {
  try {
    await AsyncStorage.setItem("songs", JSON.stringify(data));
  } catch (error) {
    console.error(error);
  }
}

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
const togglePlayback = async(playbackState) => {  
  const currentTrack = await TrackPlayer.getActiveTrack();
  if (currentTrack !== null) {
    if (playbackState.state === State.Paused){
      await TrackPlayer.play();
    } else {
      await TrackPlayer.pause();
    }
  }
}
const toggleNext = async () => {
  await TrackPlayer.skipToNext();
}
const togglePrevious = async () => {
  await TrackPlayer.skipToPrevious();
}
const Playlist = ({navigation}) => {
  const [current, setCurrent] = useState({
    title: "",
    artist: "",
    artwork: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNMlth9cR3hq8NLWr6FX0ZntkPpL1cXxBz_Q&usqp=CAU",
  });
  const [data, setData] = useState([]);
  const [display, setDisplay] = useState('none');
  const playbackState = usePlaybackState();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const playlistData = await getPlaylist();
        if (playlistData && playlistData.length > 0) {
          setData(playlistData);
        } else {
          const songs = await fetchSongs();
          if (songs.length > 0) {
            setData(songs);
            savePlaylist(songs);
          }
        }
      } catch (error) {
        console.error('Error fetching playlist:', error);
      }
    };
    fetchData();
  }, []);
  const refreshPlaylist = async () => {
    try {
      const updatedPlaylist = await getPlaylist();
      if (updatedPlaylist && updatedPlaylist.length > 0) {
        setData(updatedPlaylist);
      }
    } catch (error) {
      console.error('Error refreshing playlist:', error);
    }
  };
  const isQueueEmpty = async () => {
    const queue = await TrackPlayer.getQueue();
    return queue.length === 0;
  }
  useFocusEffect(
    useCallback(() => {
      const unsubscribe = navigation.addListener('focus',async () => {
        await refreshPlaylist();
      });
      
      return unsubscribe;
    }, [navigation])
  );
  useFocusEffect(
    useCallback(() => {
      const checkQueue = async () => {
        const isEmpty = await isQueueEmpty();
        if (isEmpty) {
          setDisplay('none');
        } else {
          setDisplay('flex');
        }
      }
      const fetchTrackInfo = async () => {
        const track = await TrackPlayer.getActiveTrack();
        if (track) {
          setCurrent({
            title: track.title,
            artist: track.artist,
            artwork: track.artwork, 
          });
        }
      };
      checkQueue();
      fetchTrackInfo();
    },[playbackState])
  )
  async function handleMenuSelect(navigation, option, item) {
    if (option==="Detail") {
        navigation.navigate("Detail", {song: item})
    } else if (option==="Favorite") {
        changeFavorite(item.id);
        await refreshPlaylist();
    } else {
      const isEmpty = await isQueueEmpty();      
      if (isEmpty) {
        await TrackPlayer.add(item);
        await TrackPlayer.play();
      } else {
        const tracks = await TrackPlayer.getQueue();
        const index = tracks.findIndex(track=>track.id===item.id);
        if (index===-1)
          await TrackPlayer.add(item);
      }
    }
  }
  async function handleSelect(navigation, songs, item) {
    await TrackPlayer.reset();
    await TrackPlayer.add(songs);
    const index = songs.findIndex(i => i.id===item.id);
    await TrackPlayer.skip(index);
    await TrackPlayer.play();
    navigation.navigate("PlayingScreen", {screen: "Playing", params: { song: item }})
  }
  const close = async () => {
    await TrackPlayer.reset();
    setDisplay('none');
  }
  const changeFavorite = async (Id) => {
    const songs = await getPlaylist();
    const songId = songs.findIndex((song)=>song.id===Id);
    if (songId !== -1) {
        songs[songId].favorite = !songs[songId].favorite;
        await AsyncStorage.setItem('songs', JSON.stringify(songs));
      } else {
        console.log('Song not found in the playlist.');
      }
  }
  return (
    <SafeAreaView style={{flex: 1}}>
        <FlatList
            data={data}
            renderItem={({item}) => (       
                <TouchableHighlight onPress={()=> handleSelect(navigation, data, item)}>
                    <View style={styles.song}>
                        <View style={{flexDirection: 'row'}}>
                            <Image style={{width: 50, height: 50}} source={{uri: item.artwork}} />
                            <View style={styles.info}>
                                <Text style={styles.title}>{item.title}</Text>
                                <Text>{item.artist}</Text>
                            </View>
                        </View>
                        <Menu onSelect={value => handleMenuSelect(navigation, value, item)}>
                            <MenuTrigger>
                                <Text style={{marginTop: 16, marginRight: 10}}>
                                    <Icon name="dots-three-vertical" size={25} color="#000" />
                                </Text>
                            </MenuTrigger>
                            <MenuOptions optionsContainerStyle={{width: 120}}>
                                <MenuOption style={{color:"#000"}} value="Detail" text="Detail" />
                                <MenuOption style={{color:"#000"}} value="Favorite" text={item.favorite?"Delete from Favorite":"Add to Favorite"} />
                                <MenuOption style={{color:"#000"}} value="AddToQueue" text="Add to Queue" />
                            </MenuOptions>
                        </Menu>
                    </View>
                </TouchableHighlight>
            )}
        />
        <View style={[styles.playing, {display: display}]}>
          <Image style={{width: 50, height: 50}} source={{uri: current.artwork}} />
          <TouchableHighlight onPress={() => {navigation.navigate("PlayingScreen", {screen: "Playing", params: { song: current }})}}>
            <View style={{width: 180}}>
              <Text style={{color:"#fff", fontWeight: 'bold'}}>{current.title}</Text>
              <Text style={{color:"#fff"}}>{current.artist}</Text>
            </View>
          </TouchableHighlight>
          <TouchableOpacity onPress={()=> togglePrevious()}>
              <Icon name="controller-jump-to-start" size={32} color="#fff"/>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=> togglePlayback(playbackState)}>
              <Icon name={playbackState.state===State.Playing?"controller-paus":"controller-play"} size={32} color="#fff"/>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=> toggleNext()}>
              <Icon name="controller-next" size={32} color="#fff"/>
            </TouchableOpacity>
            <TouchableOpacity onPress={async ()=> close()}>
              <Icon name="cross" size={32} color="#fff"/>
            </TouchableOpacity>
        </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  song: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#adadad',
    justifyContent: 'space-between'
  },
  info: {
    marginLeft: 20,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  playing: {
    position: 'absolute',
    flexDirection:'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    bottom: 0,
    width: 410,
    height: 50,
    backgroundColor: "#525453",
  }
});
export default Playlist;
