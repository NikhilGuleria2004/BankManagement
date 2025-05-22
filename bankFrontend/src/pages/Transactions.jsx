import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../config/axios';

const Transactions = () => {
  const { user, token, isAuthenticated } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    type: 'deposit',
    amount: '',
    description: '',
    sourceAccountNumber: '',
    destinationAccountNumber: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [transactionsRes, accountsRes] = await Promise.all([
        api.get('/transactions/latest').catch(err => {
          console.error('Error fetching transactions:', err.response?.data || err.message);
          return { data: { transactions: [] } };
        }),
        api.get('/accounts').catch(err => {
          console.error('Error fetching accounts:', err.response?.data || err.message);
          return { data: { accounts: [] } };
        })
      ]);

      setTransactions(transactionsRes.data.transactions || []);
      setAccounts(accountsRes.data.accounts || []);
    } catch (err) {
      console.error('Error in fetchData:', err);
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransaction = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    setError('');
    
    try {
      const response = await api.post('/transactions', {
        ...newTransaction,
        accountNumber: newTransaction.sourceAccountNumber
      });
      
      if (response.data && response.data.transaction) {
        setTransactions(prevTransactions => [response.data.transaction, ...prevTransactions]);
        setShowCreateModal(false);
        setNewTransaction({
          type: 'deposit',
          amount: '',
          description: '',
          sourceAccountNumber: '',
          destinationAccountNumber: '',
        });
      } else {
        setError('Failed to create transaction: Invalid response from server');
      }
    } catch (err) {
      console.error('Create transaction error:', err);
      setError(err.response?.data?.message || 'Failed to create transaction');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Please log in to view transactions</h2>
          <p className="mt-2 text-gray-600">You need to be logged in to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Create New Transaction
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <ul className="divide-y divide-gray-200">
              {transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <li key={transaction.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {transaction.type === 'deposit' ? (
                            <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : transaction.type === 'withdrawal' ? (
                            <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {transaction.description || 'No description'}
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <div className={`text-sm font-medium ${
                          transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'deposit' ? '+' : '-'}₹{Math.abs(transaction.amount).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="px-4 py-4 sm:px-6">
                  <div className="text-center text-gray-500">No transactions found</div>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Create Transaction Modal */}
      {showCreateModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleCreateTransaction}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Create New Transaction
                      </h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                            Transaction Type
                          </label>
                          <select
                            id="type"
                            name="type"
                            value={newTransaction.type}
                            onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value })}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                          >
                            <option value="deposit">Deposit</option>
                            <option value="withdrawal">Withdrawal</option>
                            <option value="transfer">Transfer</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="sourceAccountNumber" className="block text-sm font-medium text-gray-700">
                            Source Account
                          </label>
                          <select
                            id="sourceAccountNumber"
                            name="sourceAccountNumber"
                            value={newTransaction.sourceAccountNumber}
                            onChange={(e) => setNewTransaction({ ...newTransaction, sourceAccountNumber: e.target.value })}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                            required
                          >
                            <option value="">Select an account</option>
                            {accounts && accounts.length > 0 ? (
                              accounts.map((account) => (
                                <option key={account.id} value={account.accountNumber}>
                                  {account.type.charAt(0).toUpperCase() + account.type.slice(1)} - {account.accountNumber}
                                </option>
                              ))
                            ) : (
                              <option disabled>No accounts available</option>
                            )}
                          </select>
                        </div>

                        {newTransaction.type === 'transfer' && (
                          <div>
                            <label htmlFor="destinationAccountNumber" className="block text-sm font-medium text-gray-700">
                              Destination Account
                            </label>
                            <input
                              type="text"
                              id="destinationAccountNumber"
                              name="destinationAccountNumber"
                              value={newTransaction.destinationAccountNumber}
                              onChange={(e) => setNewTransaction({ ...newTransaction, destinationAccountNumber: e.target.value })}
                              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                              placeholder="Enter destination account number"
                              required
                            />
                          </div>
                        )}

                        <div>
                          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                            Amount
                          </label>
                          <input
                            type="number"
                            id="amount"
                            name="amount"
                            value={newTransaction.amount}
                            onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                            placeholder="0.00"
                            min="0.01"
                            step="0.01"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Description
                          </label>
                          <input
                            type="text"
                            id="description"
                            name="description"
                            value={newTransaction.description}
                            onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                            placeholder="Enter description (optional)"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {isCreating ? 'Creating...' : 'Create Transaction'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions; 