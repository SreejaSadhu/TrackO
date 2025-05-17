// ... existing code ...
import TransactionCalendar from '../../components/Calendar/TransactionCalendar';

const Dashboard = () => {
  // ... existing code ...

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      // ... existing code ...
      <TransactionCalendar transactions={transactions} />
      // ... existing code ...
    </div>
  );
};

export default Dashboard;