import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';
import {useCallback, useState} from 'react';
import {FlatList, View, TouchableHighlight, StyleSheet, Image, Text, SafeAreaView, TouchableOpacity} from 'react-native';
import {Menu, MenuOption, MenuOptions, MenuTrigger} from 'react-native-popup-menu';
import TrackPlayer, { usePlaybackState, State } from 'react-native-track-player';
import Icon from 'react-native-vector-icons/Entypo';
const Favorite = ({navigation}) => {
  const [current, setCurrent] = useState({
    title: "",
    artist: "",
    artwork: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNMlth9cR3hq8NLWr6FX0ZntkPpL1cXxBz_Q&usqp=CAU",
  });
  const [display, setDisplay] = useState('none');
  const [songs, setSongs] = useState([]);
  const playbackState = usePlaybackState();
  let favorites = songs.filter(song => song.favorite === true);
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          const value = await AsyncStorage.getItem('songs');
          if (value !== null) {
            const parsedValue = JSON.parse(value);
            setSongs(parsedValue);
            favorites = songs.filter(song => song.favorite === true);
          }
        } catch (error) {
          console.log(error);
        }
      };
      fetchData();
    }, [favorites]),
  );
  const isQueueEmpty = async () => {
    const queue = await TrackPlayer.getQueue();
    return queue.length === 0;
  }
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
    if (option === 'Detail') {
      navigation.navigate('Detail', {song: item});
    } else if (option === 'Favorite') {
      changeFavorite(item.id);
    } else {
      const tracks = await TrackPlayer.getQueue();
        const index = tracks.findIndex(track=>track.id===item.id);
        if (index===-1)
          await TrackPlayer.add(item);
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
  const changeFavorite = async (Id) => {
    const songs = await getPlaylist();
    const songId = songs.findIndex(song => song.id === Id);
    if (songId !== -1) {
      songs[songId].favorite = !songs[songId].favorite;
      await AsyncStorage.setItem('songs', JSON.stringify(songs));
    } else {
      console.log('Song not found in the playlist.');
    }
  };
  const close = async () => {
    await TrackPlayer.reset();
    setDisplay('none');
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
  async function handleSelect(navigation, songs, item) {
    await TrackPlayer.reset();
    await TrackPlayer.add(songs);
    const index = songs.findIndex(i => i.id === item.id);
    await TrackPlayer.skip(index);
    await TrackPlayer.play();
    navigation.navigate("PlayingScreen", {screen: "Playing", params: { song: item }})
  }
  return (
    <SafeAreaView style={{flex: 1}}>
      <FlatList
        data={favorites}
        renderItem={({item}) => (
          <TouchableHighlight
            onPress={() => handleSelect(navigation, favorites, item)}>
            <View style={styles.song}>
              <View style={{flexDirection: 'row'}}>
                <Image
                  style={{width: 50, height: 50}}
                  source={{uri: item.artwork}}
                />
                <View style={styles.info}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text>{item.artist}</Text>
                </View>
              </View>
              <Menu
                onSelect={value => handleMenuSelect(navigation, value, item)}>
                <MenuTrigger>
                  <Text style={{marginTop: 16, marginRight: 10}}>
                    <Icon name="dots-three-vertical" size={25} color="#000" />
                  </Text>
                </MenuTrigger>

                <MenuOptions optionsContainerStyle={{width: 100}}>
                  <MenuOption value="Detail" text="Detail" />
                  <MenuOption value="Favorite" text="Delete from favorite" />
                  <MenuOption value="AddToQueue" text="Add to queue" />
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
    justifyContent: 'space-between',
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
export default Favorite;
