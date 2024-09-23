import * as React from 'react'
import { View, Text, ActivityIndicator } from 'react-native'
import * as FileSystem from "expo-file-system"
import {Asset} from "expo-asset"
import {SQLiteProvider} from "expo-sqlite/next"
import {createNativeStackNavigator} from "@react-navigation/native-stack"
import { NavigationContainer } from '@react-navigation/native'
import Home from '@/src/screens/Home'


const Stack = createNativeStackNavigator()

const loadDatabase = async () => {
    const dbName = "mySQLiteDB.db"
    const dbAsset = require("../../../mySQLiteDB.db")
    const dbUri = Asset.fromModule(dbAsset).uri
    const dbFilePath = `${FileSystem.documentDirectory}SQLite/${dbName}`

    const fileInfo = await FileSystem.getInfoAsync(dbFilePath)
    if (!fileInfo.exists) {
        await FileSystem.makeDirectoryAsync(
            `${FileSystem.documentDirectory}SQLite`,
            {intermediates:true}
        )
        await FileSystem.downloadAsync(dbUri,dbFilePath)
    } 
}

const App = () => {

  const [dbLoaded , setDBLoaded] = React.useState<boolean>(false)

  React.useEffect(() => {
    loadDatabase()
    .then(() => {
        setDBLoaded(true)
    })
    .catch((err) => console.log(err))
  } , [])

  if(!dbLoaded) return (
    <View style={{flex:1}}>
        <ActivityIndicator size={'large'} />
        <Text>Loading Database....</Text>
    </View>
  )

  return (
    <NavigationContainer independent={true}>
        <React.Suspense
          fallback={
            <View style={{flex:1}}>
              <ActivityIndicator size={'large'} />
              <Text>Loading Database....</Text>
            </View>
          }
        >
        <SQLiteProvider
            databaseName='mySQLiteDB.db'
            useSuspense={true} // useSuspense
        >
            <Stack.Navigator>
                <Stack.Screen  
                  name='Home' 
                  component={Home} 
                  options={{
                    headerTitle:"Budget Buddy",
                    headerLargeTitle:true,
                  }}
                />
            </Stack.Navigator>
        </SQLiteProvider>
    </React.Suspense>
    </NavigationContainer>
  )
}

export default App