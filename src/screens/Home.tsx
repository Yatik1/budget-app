import { Category, Transaction, TransactionsByMonth } from '@/types'
import { useSQLiteContext } from 'expo-sqlite'
import * as React from 'react'
import { ScrollView, StyleSheet, Text, TextStyle } from 'react-native'
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


      const now = new Date()

      const startOfMonth = new Date(now.getFullYear(), now.getMonth(),1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth()+1, 1)
      endOfMonth.setMilliseconds(endOfMonth.getMilliseconds()-1)

      const startOfMonthTimeStamp = Math.floor(startOfMonth.getTime() / 1000)
      const endOfMonthTimeStamp = Math.floor(endOfMonth.getTime() / 1000)

      const transactionsByMonth = await db.getAllAsync<TransactionsByMonth>(
        `
          SELECT 
          COALESCE(SUM(CASE WHEN type = 'Expense' THEN amount ELSE 0 END),0) AS totalExpenses,
          COALESCE(SUM(CASE WHEN type = 'Income' THEN amount ELSE 0 END),0) AS totalIncome ,
          FROM Transactions
          WHERE date >= ? AND date <= ?;
        `,[startOfMonthTimeStamp , endOfMonthTimeStamp]
      );
      setTransactionsByMonth(transactionsByMonth[0])
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

  const getMoneyTextStyle = (value:number) : TextStyle => ({
    fontWeight:"bold",
    color:value<0 ? "#ff4500" : "#2e8b57"
  })

  const formatMoney = (value:number) => {
    const absValue = Math.abs(value).toFixed(2)
    return `${value < 0 ? "-" : ""}$${absValue}`
  }

  return (
    <Card style={styles.container}>
      <Text style={styles.periodTitle}>Summary for {readablePeriod}</Text>
      <Text style={styles.summaryText}>
          Income:{" "}
          <Text style={getMoneyTextStyle(totalIncome)}>
            {formatMoney(totalIncome)}
          </Text>
      </Text>
      <Text style={styles.summaryText}>
          Total Expenses:{" "}
          <Text style={getMoneyTextStyle(totalExpenses)}>
            {formatMoney(totalExpenses)}
          </Text>
      </Text>
      <Text style={styles.summaryText}>
        Savings: {" "}
        <Text style={getMoneyTextStyle(saving)}>
          {formatMoney(saving)}
        </Text>
      </Text>
    </Card>
  )
}

const styles = StyleSheet.create({
  container:{
    marginBottom:15,
    paddingBottom:7
  },
  periodTitle:{
    fontSize:20,
    fontWeight:"bold",
    color:"#333",
    marginBottom:15
  },
  summaryText:{
    fontSize:18,
    color:"#333",
    marginBottom:10
  }
})

export default Home


