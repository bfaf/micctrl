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

function App(): JSX.Element {
  useKeepAwake();
  const [searchingForServer, setSearchingForServer] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<IsMuted>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchState = async () => {
    setSearchingForServer(true);
    setErrorMsg(null);

    const found = await findServer();
    setSearchingForServer(false);
    
    if (found) {
      setIsMuted(await getMicState());
    } 
    else
    {
      setErrorMsg('Could not find server');
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      (async () => {
        if (!searchingForServer && !await isServerRunning())
        {
          setErrorMsg('Server is not running. Please start it on your computer');
        }
      })();
    }, 1000);

    return () => clearInterval(intervalId);
  }, [searchingForServer]);

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
      {!errorMsg && searchingForServer && <Text style={styles.errorMsg} >Searching for server...</Text>}
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
