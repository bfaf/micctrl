/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState, useEffect } from 'react';
import { useKeepAwake } from '@sayem314/react-native-keep-awake';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity
} from 'react-native';
import { IsMuted, findServer, getMicState, switchMicState, isServerRunning } from './src/utils'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'ip';

const storeData = async (value: string) => {
  try {
    await AsyncStorage.setItem(KEY, value);
  } catch (e) {
    // saving error
  }
};

const getData = async () => {
  try {
    const value = await AsyncStorage.getItem(KEY);
    if (value !== null) {
      return value;
    }
  } catch (e) {
    // error reading value
  }
  return null;
};



function App(): JSX.Element {
  useKeepAwake();
  const [searchingForServer, setSearchingForServer] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<IsMuted>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentIp, setCurrentIp] = useState<number>(1);

  const searchForServer = async () => {
    setSearchingForServer(true);
    setErrorMsg(null);

    const found = await findServer(setCurrentIp);
    setSearchingForServer(false);
    
    if (found) {
      await storeData(found);
      setIsMuted(await getMicState());
    } 
    else
    {
      setErrorMsg('Could not find server');
    }
  };

  const fetchState = async () => {
    setSearchingForServer(false);
    setErrorMsg(null);
    const ip = await getData();
    if (ip && ip.length > 0)
    {
      if (!await isServerRunning(ip))
      {
        await searchForServer();
      }
    }
    else
    {
      await searchForServer();
    }
  };

  useEffect(() => {
    try
    {
      fetchState()
    } 
    catch (err)
    {
      console.error(err);
    };
  }, []);

  const switchMic = async () => {
    try
    {
      await switchMicState();
      setIsMuted(isMuted === 1 ? 0 : 1);
      setErrorMsg(null);
    }
    catch (e) {
      setErrorMsg('Cannot change microphone state');
    }
  };

  const buttonText = isMuted ? 'unmute' : 'mute';
  const buttonStyles = isMuted ? styles.appButtonContainerUnmute : styles.appButtonContainerMute;

  return (

    <View style={styles.container}>
      {!errorMsg && searchingForServer && <Text style={styles.errorMsg} >Searching for server ({currentIp})...</Text>}
      {errorMsg && <Text style={styles.errorMsg} >{errorMsg}</Text>}
      {!searchingForServer && !errorMsg && <TouchableOpacity onPress={switchMic} style={buttonStyles}>
        <Text style={styles.appButtonText} >{buttonText}</Text>
      </TouchableOpacity>}
      {!searchingForServer && errorMsg && <TouchableOpacity onPress={fetchState} style={styles.appButtonContainerUnmute}>
        <Text style={styles.appButtonText} >Retry</Text>
      </TouchableOpacity>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 90
  },
  appButtonContainerUnmute: {
    elevation: 8,
    backgroundColor: "green",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: 200,
    height: 200,
  },
  appButtonContainerMute: {
    elevation: 8,
    backgroundColor: "red",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: 200,
    height: 200,
  },
  appButtonText: {
    paddingTop: 70,
    fontSize: 30,
    color: "#fff",
    fontWeight: "bold",
    alignSelf: "center",
    textTransform: "uppercase",
    textAlign: 'center',
    alignContent: 'center',
  },
  errorMsg: {
    fontSize: 30,
    fontWeight: "bold",
    color: 'red',
  }
});

export default App;
