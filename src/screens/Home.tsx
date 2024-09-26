import { Category, Transaction } from '@/types'
import { useSQLiteContext } from 'expo-sqlite'
import * as React from 'react'
import { View, Text, ScrollView } from 'react-native'
import TransactionsList from '../components/TransactionsList'

const Home = () => {

    const [categories , setCategories] = React.useState<Category[]>([])
    const [transactions , setTransactions] = React.useState<Transaction[]>([])

    const db = useSQLiteContext() 
    
    React.useEffect(() => {
      db.withTransactionAsync(async () => {
        await getTransactionData()
      })
    } , [db])

    async function getTransactionData() {
      const result = await db.getAllAsync<Transaction>(
        `SELECT * FROM Transactions ORDER BY date DESC;`
      )
      setTransactions(result)
    }



  return (
    <ScrollView contentContainerStyle={{padding:15, paddingVertical:170}}>
      <TransactionsList 
        categories={categories}
        transactions={transactions}
        deleteTransaction={deleteTransaction}
      />
    </ScrollView>
  )
}

export default Home