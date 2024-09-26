import { Category, Transaction } from '@/types'
import { useSQLiteContext } from 'expo-sqlite'
import * as React from 'react'
import { View, Text } from 'react-native'

const Home = () => {

    const [categories , setCategories] = React.useState<Category[]>([])
    const [transactions , setTransactions] = React.useState<Transaction[]>([])

    const db = useSQLiteContext() 
    
    React.useEffect(() => {
      db.withTransactionAsync(async () => {
        await getData()
      })
    } , [db])

    async function getData() {
      const result = await db.getAllAsync(`SELECT * FROM Transactions`)
      console.log(result)
    }

  return (
    <View>
      <Text>Home Screens</Text>
    </View>
  )
}

export default Home