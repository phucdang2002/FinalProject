import Playing from "./src/Playing";
import Playlist from "./src/Playlist";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import Detail from "./src/SongDetail";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Favorite from "./src/Favorite";
import { MenuProvider } from "react-native-popup-menu";
import TrackPlayer from "react-native-track-player";
import { Icon } from "react-native-paper";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Queue from "./src/Queue";
import Lyric from "./src/Lyric";

const setupPlayer =async () => {
    await TrackPlayer.setupPlayer();
}
const Stack = createStackNavigator();
const BottomTab = createBottomTabNavigator();
const TopTab = createMaterialTopTabNavigator();
const HomeScreen = () => {
    return(
        <Stack.Navigator initialRouteName="Playlist">
            <Stack.Screen name="Playlist" component={Playlist}/>
            <Stack.Screen name="PlayingScreen" component={PlayingScreen} options={{headerShown: false}}/>
            <Stack.Screen name="Detail" component={Detail} />
        </Stack.Navigator>
    )
}
const FavoriteScreen = () => {
    return(
        <Stack.Navigator initialRouteName="Favorite">
            <Stack.Screen name="Favorite" component={Favorite}/>
            <Stack.Screen name="PlayingScreen" component={PlayingScreen} options={{headerShown: false}}/>
            <Stack.Screen name="Detail" component={Detail}/>
        </Stack.Navigator>
    )
}
const PlayingScreen = () => {
    return(
        <TopTab.Navigator initialRouteName="Playing" screenOptions={{tabBarStyle: {display: "none"}}} sceneContainerStyle={{backgroundColor: '#242423'}}>
            <TopTab.Screen name="Queue" component={Queue}/>
            <TopTab.Screen name="Playing" component={Playing}/>
            <TopTab.Screen name="Lyric" component={Lyric}/>
        </TopTab.Navigator>
    )
}
const Screens = () => {
    return(
        <MenuProvider>
            <BottomTab.Navigator initialRouteName="HomeScreen" screenOptions={{headerShown: false, tabBarLabelStyle: { fontSize: 12 }}}>
                <BottomTab.Screen name="HomeScreen" component={HomeScreen} options={{title: "Playlist", tabBarIcon: ({ color, size })=><Icon source="music-box-multiple" color={color} size={size}/> }} />
                <BottomTab.Screen name="FavoriteScreen" component={FavoriteScreen} options={{title: "Favorite", tabBarIcon: ({ color, size })=><Icon source="heart" color={color} size={size}/>}}/>
            </BottomTab.Navigator>
        </MenuProvider>
    )
}

function App() {
    setupPlayer();
    return(
        <NavigationContainer>
            <Screens/>
        </NavigationContainer>
    )
}
export default App;
