import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { getTransactions, addTransaction, deleteTransaction } from "./api/transaction";

const incomeCategories = ["Salary", "Bonus", "Freelance", "Investments", "Others"];
const expenseCategories = ["Food", "Transport", "Bills", "Entertainment", "Shopping", "Health", "Others"];

function App({ user, setUser }) {
  const [transactions, setTransactions] = useState([]);
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setUser(null);
    }
  }, [token, setUser]);

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      const data = await getTransactions(token);
      setTransactions(data);
    };
    fetchData();
  }, [token]);

  const income = transactions.filter(t => t.type === "income").reduce((acc, t) => acc + t.amount, 0);
  const expense = transactions.filter(t => t.type === "expense").reduce((acc, t) => acc + t.amount, 0);
  const balance = income - expense;

  const categoryData = Object.values(
    transactions.reduce((acc, t) => {
      if (!acc[t.category]) acc[t.category] = { category: t.category, income: 0, expense: 0 };
      if (t.type === "income") acc[t.category].income += t.amount;
      else acc[t.category].expense += t.amount;
      return acc;
    }, {})
  );

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!amount || !category) return;

    const newTransaction = { type, amount: parseFloat(amount), category, note };
    const saved = await addTransaction(newTransaction, token);
    setTransactions([saved, ...transactions]);
    setAmount("");
    setCategory("");
    setNote("");
  };

  const handleDelete = async (id) => {
    await deleteTransaction(id, token);
    setTransactions(transactions.filter(t => t._id !== id));
  };

 const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null); 
  };

  if (!user) {
    return <p className="p-6 text-center text-gray-700">You are logged out. Please log in.</p>;
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col lg:flex-row text-gray-800">
      <div className="lg:w-1/3 p-6 flex flex-col gap-6 bg-blue-50">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-gray-900">💰 Expense Tracker</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
        <p className="text-gray-600">Logged in as: {user.email}</p>

        {/* Totals */}
        <div className="flex flex-col gap-4">
          {[{ title: "Income", value: income, color: "green" }, { title: "Expenses", value: expense, color: "red" }, { title: "Balance", value: balance, color: "gray" }].map((item) => (
            <div key={item.title} className="bg-white p-6 rounded-xl shadow-md text-center">
              <h2 className="font-semibold text-gray-600">{item.title}</h2>
              <p className={`text-2xl font-bold ${item.color === "green" ? "text-green-600" : item.color === "red" ? "text-red-600" : "text-gray-900"}`}>
                ${item.value.toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddTransaction} className="bg-white p-6 rounded-xl shadow-md flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-gray-700">Add Transaction</h2>
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setCategory("");
            }}
            className="border p-3 rounded w-full"
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="border p-3 rounded w-full" />
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="border p-3 rounded w-full">
            <option value="">Select Category</option>
            {(type === "income" ? incomeCategories : expenseCategories).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input type="text" placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} className="border p-3 rounded w-full" />
          <button type="submit" className="bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition">Add Transaction</button>
        </form>
      </div>

      {/* Main content / Right panel */}
      <div className="lg:flex-1 p-6 overflow-auto">
        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Category Summary</h2>
          {transactions.length === 0 ? (
            <p className="text-gray-500">Add some transactions to see the chart.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="category" stroke="#374151" />
                <YAxis stroke="#374151" />
                <Tooltip />
                <Legend />
                <Bar dataKey="income" fill="#16a34a" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" fill="#dc2626" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Transaction List */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Transactions</h2>
          {transactions.length === 0 ? (
            <p className="text-gray-500">No transactions yet.</p>
          ) : (
            <ul className="space-y-2">
              {transactions.map((t) => (
                <li key={t._id} className={`flex justify-between items-center p-4 rounded-xl shadow-sm ${t.type === "income" ? "bg-green-50 border-l-4 border-green-500" : "bg-red-50 border-l-4 border-red-500"}`}>
                  <div>
                    <p className="font-semibold text-gray-800">{t.category}</p>
                    {t.note && <p className="text-sm text-gray-500">{t.note}</p>}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`font-bold ${t.type === "income" ? "text-green-600" : "text-red-600"}`}>
                      {t.type === "income" ? "+" : "-"}${t.amount.toFixed(2)}
                    </span>
                    <button onClick={() => handleDelete(t._id)} className="text-gray-400 hover:text-red-600 transition">🗑</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
