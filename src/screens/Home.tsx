import { Category, Transaction, TransactionsByMonth } from '@/types'
import { useSQLiteContext } from 'expo-sqlite'
import * as React from 'react'
import { ScrollView, Text } from 'react-native'
import TransactionsList from '../components/TransactionsList'
import Card from '../components/ui/Card'

const Home = () => {

    const [categories , setCategories] = React.useState<Category[]>([])
    const [transactions , setTransactions] = React.useState<Transaction[]>([])
    
    const [transactionsByMonth, setTransactionsByMonth] = React.useState<TransactionsByMonth>({
      totalExpenses:0,
      totalIncome:0
    })

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
    <ScrollView contentContainerStyle={{padding:15, paddingVertical:130}}>
      <TransactionSummary totalExpenses={transactionsByMonth.totalExpenses} totalIncome={transactionsByMonth.totalIncome} />
      <TransactionsList 
        categories={categories}
        transactions={transactions}
        deleteTransaction={deleteTransaction}
      />
    </ScrollView>
  )
}


function TransactionSummary({totalExpenses,totalIncome} : TransactionsByMonth) {
  const saving = totalIncome  - totalExpenses
  const readablePeriod = new Date().toLocaleDateString("default", {
    month:"long",
    year:"numeric"
  })

  return (
    <Card style={{marginBottom:20}}>
      <Text>Summary for {readablePeriod}</Text>
    </Card>
  )
}


export default Home


