import { Header } from "../../../components/Header";
const user = {
  name : "Shema"
}
const Dashboard = () => {
  return (
    <main className='dashboard wrapper'>
      <Header title={`Welcome ${user?.name ? user.name : 'Guest'} 🤚`} description="Manage all subscription without any error" />
      dashboard details
    </main>
  )
}

export default Dashboard
