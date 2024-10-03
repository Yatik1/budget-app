import { Category, Transaction } from '@/types'
import { useSQLiteContext } from 'expo-sqlite'
import * as React from 'react'
import { ScrollView } from 'react-native'
import TransactionsList from '../components/TransactionsList'

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

      const transactionResult = await db.getAllAsync<Transaction>(
        `SELECT * FROM Transactions ORDER BY date DESC;`
      )
      setTransactions(transactionResult)

      const categoriesResult = await db.getAllAsync<Category>(
        `SELECT * FROM CATEGORIES;`
      )
      setCategories(categoriesResult)

    }

    async function deleteTransaction(id:number) {
      db.withTransactionAsync(async () => {
        await db.runAsync(`DELETE FROM Transactions WHERE id = ?;` , [id])
        await getData()
      })
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