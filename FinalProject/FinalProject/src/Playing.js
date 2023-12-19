import { useCallback, useEffect, useState } from 'react';
import {SafeAreaView, StyleSheet, View, Text, Image, TouchableOpacity} from 'react-native';
import Slider from '@react-native-community/slider';
import moment from 'moment';
import TrackPlayer,{RepeatMode, State, usePlaybackState, useProgress} from 'react-native-track-player';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const Playing = ({route}) => { 
  const navigation = useNavigation();
  const {song} = route.params;
  const {title, artist, artwork, favorite} = song;

  const [like, setLike] = useState(favorite);
  const [repeatMode, setRepeatMode] = useState(0);
  useFocusEffect(
    useCallback(() => {
      const hideTabBar = () => {
        navigation.getParent()?.getParent()?.setOptions({ tabBarStyle: {display: "none"} });
      };
      const getMode = async () => {
        setRepeatMode(await TrackPlayer.getRepeatMode());
      };
      const getFavorite = async () => {
        const track = await TrackPlayer.getActiveTrack();
        const value = await AsyncStorage.getItem('songs');
        const songs = JSON.parse(value);
        const index = songs.findIndex(item=>item.id === track.id);
        setLike(songs[index].favorite);
      };
      const showTabBar = () => {
        navigation.getParent()?.getParent()?.setOptions({ tabBarStyle: {display: "flex"} });
      };
      getFavorite();
      getMode();
      hideTabBar();
      return () => {
        showTabBar();
      };
    }, [navigation])
  );
  const [track, setTrack] = useState({
    title: title,
    artist: artist,
    artwork: artwork,
  });
  const repeatIcon = () => {
    if (repeatMode===0){
      return 'repeat-off';
    }
    if (repeatMode===1){
      return 'repeat-once';
    }
    if (repeatMode===2){
      return 'repeat';
    }
  }
  const changeLike = async () => {
    const value = await AsyncStorage.getItem('songs');
    const song = await TrackPlayer.getActiveTrack();
    let songs = [];
      if (value !== null) {
          songs = JSON.parse(value);
      }
      const songId = songs.findIndex((item)=>item.id===song.id);
      if (songId !== -1) {
        songs[songId].favorite = !songs[songId].favorite;
        await AsyncStorage.setItem('songs', JSON.stringify(songs));
        setLike(!like)
      } else {
        console.log('Song not found in the playlist.');
      }
        
  }
  const changeRepeatMode = () => {
    if (repeatMode===0) {
      TrackPlayer.setRepeatMode(RepeatMode.Queue);
      setRepeatMode(2);
    }
    if (repeatMode===2) {
      TrackPlayer.setRepeatMode(RepeatMode.Track);
      setRepeatMode(1);
    }
    if (repeatMode===1) {
      TrackPlayer.setRepeatMode(RepeatMode.Off);
      setRepeatMode(0);
    }
  }
    const playbackState = usePlaybackState();
    const progress = useProgress();
    useEffect(() => {
      const fetchTrackInfo = async () => {
        const track = await TrackPlayer.getActiveTrack();
        if (track) {
          setTrack({
            title: track.title,
            artist: track.artist,
            artwork: track.artwork, 
          });
        }
      };
      fetchTrackInfo();
    }, [playbackState]);
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.goBack} onPress={() => navigation.getParent()?.goBack()}>
        <MaterialCommunityIcon name="chevron-down" size={32} color="#fff"/>
      </TouchableOpacity>
      <View style={styles.info}>
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <Text style={styles.textLight}>NOW PLAYING</Text>
          <Text style={styles.songTitle}>{track.title}</Text>
        </View>
        <View style={styles.coverContainer}>
          <Image source={{uri: track.artwork}} style={styles.cover}/>
        </View>
        <View style={{flex: 2, alignItems: 'center', justifyContent: 'center'}}>
          <Text style={styles.textDark}>{track.title}</Text>
          <Text style={styles.text}>{track.artist}</Text>
        </View>
      </View>
      <View style={styles.progress}>
        <Slider
            style={styles.track}
            value={progress.position}
            minimumValue={0}
            maximumValue={progress.duration}
            thumbTintColor="#93A8B3"
            minimumTrackTintColor="#93A8B3"
            maximumTrackTintColor="#FFF"
            onSlidingComplete={async (value) => {await TrackPlayer.seekTo(value)}}
        />
        <View style={styles.progressLabel}>
          <Text style={[styles.textLight, styles.timeStamp]}>{moment.utc(progress.position * 1000).format("m:ss")}</Text>
          <Text style={[styles.textLight, styles.timeStamp]}>{moment.utc(progress.duration * 1000).format("m:ss")}</Text>
        </View>
      </View>
      <View style={styles.buttonGroup}>
            <TouchableOpacity onPress={()=>changeLike()}>
              <MaterialCommunityIcon name="heart" size={30} color={like?"#54963c":"#fff"}/>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=> togglePrevious()}>
              <MaterialCommunityIcon name="skip-backward" size={32} color="#fff"/>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btn} onPress={()=> togglePlayback(playbackState)}>
              <MaterialCommunityIcon name={playbackState.state===State.Playing?"pause":"play"} size={32} color="#000"/>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=> toggleNext()}>
              <MaterialCommunityIcon name="skip-forward" size={32} color="#fff"/>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>changeRepeatMode()}>
              <MaterialCommunityIcon name={`${repeatIcon()}`} size={32} color={repeatMode===0?"#fff":"#54963c"}/>
            </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center'
  },
  info: {
    flex: 7,
  },
  textLight: {
    color: '#c4c4c4',
    fontSize: 12,
  },
  textDark: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '500',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    marginTop: 8,
  },
  songTitle: {
    color: '#fff',
    fontSize: 20,
  },
  coverContainer: {
    flex: 5,
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cover: {
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#fff',
  },
  track: {
    width: 400,
    height: 40,
    marginTop: 25,
  },
  progress:  {
    flex: 1,
    width: 400,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  progressLabel:  {
    width: 375,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  timeStamp: {
    fontWeight: "900"
  },
  buttonGroup: {
    flex: 2,
    width: 320,
    flexDirection: 'row',
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: 16
  },
  btn: {
    backgroundColor: "#fff",
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 64
  },
  goBack: {
    position: 'absolute',
    top: 10,
    left: 10,
  }
});
export default Playing;