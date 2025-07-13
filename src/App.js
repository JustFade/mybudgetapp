import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import { initializeApp } from 'firebase/app';
// eslint-disable-next-line no-unused-vars
import { getFirestore, collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, setDoc, query, writeBatch, getDoc, Timestamp } from 'firebase/firestore';
// ...
// eslint-disable-next-line no-unused-vars
const Trash2 = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>);

// --- Configuration & Constants ---
// Your Firebase project configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // <--- YOU WILL REPLACE THIS LATER
  authDomain: "budgeting-65f97.firebaseapp.com",
  projectId: "budgeting-65f97",
  storageBucket: "budgeting-65f97.appspot.com",
  messagingSenderId: "446678123087",
  appId: "YOUR_APP_ID", // <--- YOU WILL REPLACE THIS LATER
  measurementId: "YOUR_MEASUREMENT_ID" // <--- YOU WILL REPLACE THIS LATER IF YOU USE GOOGLE ANALYTICS
};
const appId = 'family-organizer-app-v12'; // Keeping this as a default from your code
const __initial_auth_token = null; // We'll handle authentication properly, so set this to null for now

// --- Icon Components ---
const PlusCircle = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>);
const Trash2 = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>);
const X = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);
const Copy = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>);
const PiggyBank = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 5c-1.5 0-2.8 1-3.5 2.5a4.3 4.3 0 0 0-6.9 0A3.5 3.5 0 0 0 5 5c-2 0-3.5 1.5-3.5 3.5 0 2.2 1.9 4 4.3 4.8"/><path d="M19.5 12.5c-2.4 0-4.4 1.5-5.2 3.5h-3.6c-.8-2-2.8-3.5-5.2-3.5C3.5 16 2 17.5 2 19.5S3.5 22 5.5 22h13c2 0 3.5-1.5 3.5-3.5s-1.5-3-3.5-3z"/><path d="M10 16.5c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5"/><path d="M16 5.5c-.3 0-.5.2-.5.5s.2.5.5.5.5-.2.5-.5-.2-.5-.5-.5z"/></svg>;
const Calendar = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
//const Users = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const Clock = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const ChevronLeft = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="15 18 9 12 15 6"></polyline></svg>;
const ChevronRight = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="9 18 15 12 9 6"></polyline></svg>;
const Settings = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-4.44a2 2 0 0 0-2 2v.78a2 2 0 0 1-1.11 1.79l-.55.34a2 2 0 0 0-1.11 1.79v4.44a2 2 0 0 0 1.11 1.79l.55.34a2 2 0 0 1 1.11 1.79v.78a2 2 0 0 0 2 2h4.44a2 2 0 0 0 2-2v-.78a2 2 0 0 1 1.11-1.79l.55-.34a2 2 0 0 0 1.11-1.79v-4.44a2 2 0 0 0-1.11-1.79l-.55-.34a2 2 0 0 1-1.11-1.79V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const Landmark = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="3" y1="22" x2="21" y2="22"></line><line x1="6" y1="18" x2="6" y2="11"></line><line x1="10" y1="18" x2="10" y2="11"></line><line x1="14" y1="18" x2="14" y2="11"></line><line x1="18" y1="18" x2="18" y2="11"></line><polygon points="12 2 20 7 4 7"></polygon></svg>;


// --- Theme Context & Provider ---
const ThemeContext = createContext();

const themes = {
  light: { name: 'Light' },
  dark: { name: 'Dark' },
  mountain: { name: 'Mountain Dawn' },
  ocean: { name: 'Oceanic Calm' },
};

const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(localStorage.getItem('appTheme') || 'light');

    useEffect(() => {
        const root = window.document.documentElement;
        Object.keys(themes).forEach(t => root.classList.remove(t));
        root.classList.add(theme);
        localStorage.setItem('appTheme', theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// --- Main App Component ---
function App() {
  // --- State Management ---
  const [db, setDb] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [budgetID, setBudgetID] = useState(localStorage.getItem('budgetID') || null);
  const [activeTab, setActiveTab] = useState('timeline');
  const [currentDate, setCurrentDate] = useState(new Date()); // Lifted state
  
  // Data states
  const [bills, setBills] = useState([]); // Recurring Bill Rules
  const [deposits, setDeposits] =useState([]); // Recurring Deposit Rules
  const [transactions, setTransactions] = useState([]); // Monthly Instances
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [loans, setLoans] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [contacts, setContacts] = useState([]);

  // UI states
  const [joinInput, setJoinInput] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  const [modal, setModal] = useState({ isOpen: false, type: null, data: null }); // Unified modal state

  const totalCurrentSavings = useMemo(() => savingsGoals.reduce((sum, goal) => sum + parseFloat(goal.current || 0), 0), [savingsGoals]);

  // --- Firebase Initialization & Auth ---
  useEffect(() => {
    if (Object.keys(firebaseConfig).length > 0) {
      const app = initializeApp(firebaseConfig);
      const authInstance = getAuth(app);
      setDb(getFirestore(app));
      onAuthStateChanged(authInstance, async (user) => {
        if (!user) {
          try {
            if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
              await signInWithCustomToken(authInstance, __initial_auth_token);
            } else { await signInAnonymously(authInstance); }
          } catch (error) { console.error("Error signing in:", error); }
        }
        setIsAuthReady(true);
      });
    } else { setIsAuthReady(true); }
  }, []);

  // --- Data Fetching (based on budgetID) ---
  useEffect(() => {
    if (isAuthReady && db && budgetID) {
      const basePath = `artifacts/${appId}/public/data/budgets/${budgetID}`;
      
      const createListener = (collectionName, setState) => {
          return onSnapshot(query(collection(db, basePath, collectionName)), snap => {
              const data = snap.docs.map(d => {
                  const docData = d.data();
                  // Convert Firestore Timestamps to JS Dates
                  Object.keys(docData).forEach(key => {
                      if (docData[key] && docData[key].toDate) {
                          docData[key] = docData[key].toDate();
                      }
                  });
                  return { id: d.id, ...docData };
              });
              setState(data);
          });
      };

      const unsubscribers = [
        createListener('bills', setBills), // Rules
        createListener('deposits', setDeposits), // Rules
        createListener('transactions', setTransactions), // Instances
        createListener('savingsGoals', setSavingsGoals),
        createListener('loans', setLoans),
        createListener('appointments', setAppointments),
        createListener('contacts', setContacts),
      ];
      return () => unsubscribers.forEach(unsub => unsub());
    }
  }, [isAuthReady, db, budgetID]);

  // --- Handlers ---
  const handleCreateBudget = () => {
    const newID = crypto.randomUUID();
    localStorage.setItem('budgetID', newID);
    setBudgetID(newID);
  };

  const handleJoinBudget = () => {
    if (joinInput.trim()) {
      localStorage.setItem('budgetID', joinInput.trim());
      setBudgetID(joinInput.trim());
    }
  };
  
  const copyToClipboard = () => {
    const textArea = document.createElement("textarea");
    textArea.value = budgetID;
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        setCopySuccess('Copied!');
        setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) { setCopySuccess('Failed to copy'); }
    document.body.removeChild(textArea);
  };

  const getBasePath = () => `artifacts/${appId}/public/data/budgets/${budgetID}`;

  const handleSaveItem = async (type, data) => {
    if (!db || !budgetID) return;
    const { id, ...itemData } = data;
    
    let collectionName = `${type}s`;
    if (['bill', 'deposit', 'expense'].includes(type)) {
        collectionName = 'transactions';
    }
    
    if (id) {
        await updateDoc(doc(db, getBasePath(), collectionName, id), itemData);
    } else {
        const docRef = await addDoc(collection(db, getBasePath(), collectionName), { ...itemData, type });
        if (type === 'appointment') {
            if (itemData.cost && parseFloat(itemData.cost) > 0) {
                await addDoc(collection(db, getBasePath(), 'transactions'), {
                    name: `Expense: ${itemData.name}`,
                    amount: parseFloat(itemData.cost),
                    date: itemData.date,
                    type: 'expense',
                    linkedAppointmentId: docRef.id
                });
            }
            if (itemData.contactName || itemData.contactPhone || itemData.address) {
                await addDoc(collection(db, getBasePath(), 'contacts'), {
                    name: itemData.contactName || itemData.name,
                    phone: itemData.contactPhone || '',
                    address: itemData.address || '',
                    notes: `From appointment: ${itemData.name}`,
                    linkedAppointmentId: docRef.id
                });
            }
        }
    }
    setModal({ isOpen: false, type: null, data: null });
  };

  const handleDeleteItem = async (type, id) => {
    if (!db || !budgetID) return;
    const collectionName = ['bill', 'deposit', 'expense'].includes(type) ? 'transactions' : `${type}s`;
    await deleteDoc(doc(db, getBasePath(), collectionName, id));
    setModal({ isOpen: false, type: null, data: null });
  };

  const handleLoadSampleData = async () => {
    if (!db || !budgetID) return;
    const batch = writeBatch(db);
    const basePath = getBasePath();
    
    const newSavingsGoalRef = doc(collection(db, basePath, 'savingsGoals'));
    batch.set(newSavingsGoalRef, { name: "Emergency Fund", goal: 1000, current: -46.64 });
    
    const newLoanRef = doc(collection(db, basePath, 'loans'));
    batch.set(newLoanRef, { name: "Car Loan", principal: 15000, interestRate: 5.5, minimumPayment: 350 });

    const depositsData = [
        { name: "Your Paycheck", amount: 750, recurrence: 'weekly', dayOfWeek: '3' }, // Wednesday
        { name: "Wife's Paycheck", amount: 936, recurrence: 'bi-weekly', dayOfWeek: '5', startDate: new Date('2024-07-12') }
    ];
    depositsData.forEach(item => {
        const newDocRef = doc(collection(db, basePath, 'deposits'));
        batch.set(newDocRef, item);
    });

    const billsData = [
        { name: 'Rent', amount: 1450, recurrence: 'monthly', dayOfMonth: '1', contactInfo: 'Landlord: 555-1234' },
        { name: 'Car Payments', amount: 900, recurrence: 'monthly', dayOfMonth: '30' },
        { name: 'Car Insurance (Proposed)', amount: 450, recurrence: 'monthly', dayOfMonth: '13' },
        { name: 'Phone & Internet', amount: 250, recurrence: 'monthly', dayOfMonth: '2' },
        { name: 'Childcare', amount: 340, recurrence: 'monthly', dayOfMonth: '5' },
        { name: 'Tool Truck Bill', amount: 50, recurrence: 'weekly', dayOfWeek: '3' },
        { name: 'Therapy', amount: 50, recurrence: 'weekly', dayOfWeek: '4' },
        { name: 'Subscriptions', amount: 43, recurrence: 'monthly', dayOfMonth: '18' },
    ];
    billsData.forEach(item => {
        const newDocRef = doc(collection(db, basePath, 'bills'));
        batch.set(newDocRef, item);
    });

    const newContactRef = doc(collection(db, basePath, 'contacts'));
    batch.set(newContactRef, { name: 'Eye Doctor', phone: '555-888-9999', email: '', notes: 'Annual checkups' });

    await batch.commit();
    alert("Sample data loaded! The timeline will now generate for the current month.");
  };

  // --- UI Components ---
  const WelcomeScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4 text-center">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">Family Organizer</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Create a new shared space or join one your partner already made.</p>
        <button onClick={handleCreateBudget} className="w-full mb-4 px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-md text-lg">Create a New Space</button>
        <div className="space-y-2">
            <input type="text" value={joinInput} onChange={(e) => setJoinInput(e.target.value)} placeholder="Enter Space ID to join" className="w-full p-3 bg-gray-200 dark:bg-gray-700 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"/>
            <button onClick={handleJoinBudget} disabled={!joinInput.trim()} className="w-full px-6 py-2 rounded-lg bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-400 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Join Existing Space</button>
        </div>
      </div>
    </div>
  );

  const MainLayout = ({ children }) => {
      const { theme } = useContext(ThemeContext);
      let backgroundClass = 'bg-gray-100 dark:bg-gray-900';
      if (theme === 'mountain') backgroundClass = 'bg-gradient-to-t from-gray-700 via-gray-900 to-black';
      if (theme === 'ocean') backgroundClass = 'bg-gradient-to-t from-blue-700 via-blue-900 to-slate-900';

      return (
        <div className={`${backgroundClass} min-h-screen font-sans text-gray-800 dark:text-gray-200 flex flex-col`}>
          <main className="flex-grow container mx-auto p-4 md:p-8 mb-20">
            {children}
          </main>
          <footer className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-t-strong z-40">
            <nav className="flex justify-around items-center h-16 max-w-screen-md mx-auto">
              <button onClick={() => setActiveTab('timeline')} className={`flex flex-col items-center justify-center w-full h-full transition-colors ${activeTab === 'timeline' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                <Clock className="w-6 h-6 mb-1"/>
                <span className="text-xs font-semibold">Timeline</span>
              </button>
              <button onClick={() => setActiveTab('savings')} className={`flex flex-col items-center justify-center w-full h-full transition-colors ${activeTab === 'savings' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                <PiggyBank className="w-6 h-6 mb-1"/>
                <span className="text-xs font-semibold">Savings</span>
              </button>
              <button onClick={() => setActiveTab('loans')} className={`flex flex-col items-center justify-center w-full h-full transition-colors ${activeTab === 'loans' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                <Landmark className="w-6 h-6 mb-1"/>
                <span className="text-xs font-semibold">Loans</span>
              </button>
               <button onClick={() => setActiveTab('schedule')} className={`flex flex-col items-center justify-center w-full h-full transition-colors ${activeTab === 'schedule' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                <Calendar className="w-6 h-6 mb-1"/>
                <span className="text-xs font-semibold">Schedule</span>
              </button>
              <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center justify-center w-full h-full transition-colors ${activeTab === 'settings' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                <Settings className="w-6 h-6 mb-1"/>
                <span className="text-xs font-semibold">Settings</span>
              </button>
            </nav>
          </footer>
          {modal.isOpen && <ItemForm modalConfig={modal} onSave={handleSaveItem} onDelete={handleDeleteItem} onClose={() => setModal({isOpen: false, type: null, data: null})} />}
        </div>
      );
  };
  
  // --- Page Components ---
  const TimelinePage = ({ currentDate, setCurrentDate, bills, deposits, transactions, totalCurrentSavings, db, getBasePath }) => {
    
    useEffect(() => {
        const generateMonthlyInstances = async (year, month) => {
            if (!db) return;
            const monthId = `${year}-${month}`;
            const generationRef = doc(db, getBasePath(), 'generatedMonths', monthId);
            const generationDoc = await getDoc(generationRef);

            if (generationDoc.exists()) return;

            const batch = writeBatch(db);
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const allRules = [...bills.map(b => ({...b, type: 'bill'})), ...deposits.map(d => ({...d, type: 'deposit'}))];

            allRules.forEach(rule => {
                const { id, ...ruleData } = rule;
                if (rule.recurrence === 'monthly' && rule.dayOfMonth) {
                    const day = Math.min(parseInt(rule.dayOfMonth), daysInMonth);
                    const date = new Date(year, month, day);
                    const newDocRef = doc(collection(db, getBasePath(), 'transactions'));
                    batch.set(newDocRef, { ...ruleData, date, ruleId: id });
                } else if (rule.recurrence === 'weekly' && rule.dayOfWeek) {
                     for (let day = 1; day <= daysInMonth; day++) {
                        const date = new Date(year, month, day);
                        if (date.getDay() === parseInt(rule.dayOfWeek)) {
                            const newDocRef = doc(collection(db, getBasePath(), 'transactions'));
                            batch.set(newDocRef, { ...ruleData, date, ruleId: id });
                        }
                    }
                } else if (rule.recurrence === 'bi-weekly' && rule.dayOfWeek && rule.startDate) {
                    const startDate = rule.startDate instanceof Date ? rule.startDate : new Date(rule.startDate);
                    for (let day = 1; day <= daysInMonth; day++) {
                        const date = new Date(year, month, day);
                        if (date.getDay() === parseInt(rule.dayOfWeek) && (Math.floor((date - startDate) / (1000 * 60 * 60 * 24)) % 14 === 0)) {
                             const newDocRef = doc(collection(db, getBasePath(), 'transactions'));
                             batch.set(newDocRef, { ...ruleData, date, ruleId: id });
                        }
                    }
                }
            });

            batch.set(generationRef, { generatedAt: Timestamp.now() });
            await batch.commit();
        };

        if ((bills.length > 0 || deposits.length > 0) && db) {
            generateMonthlyInstances(currentDate.getFullYear(), currentDate.getMonth());
        }
    }, [currentDate, bills, deposits, db, getBasePath]);

    const dailyBreakdown = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const monthTransactions = transactions.filter(t => {
            const tDate = t.date instanceof Date ? t.date : new Date(t.date);
            return tDate.getFullYear() === year && tDate.getMonth() === month;
        });

        const eventsByDate = {};
        monthTransactions.forEach(t => {
            const dateStr = (t.date instanceof Date ? t.date : new Date(t.date)).toDateString();
            if (!eventsByDate[dateStr]) eventsByDate[dateStr] = [];
            eventsByDate[dateStr].push(t);
        });

        let runningBalance = totalCurrentSavings; 
        const days = [];
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = date.toDateString();
            const dayEvents = (eventsByDate[dateStr] || []).sort((a,b) => a.name.localeCompare(b.name));

            // eslint-disable-next-line no-loop-func
            dayEvents.forEach(event => {
                const amount = parseFloat(event.amount || 0);
                if (event.type === 'deposit') runningBalance += amount;
                else runningBalance -= amount;
            });

            days.push({
                date,
                events: dayEvents,
                endOfDayBalance: runningBalance
            });
        }
        return days;

    }, [currentDate, transactions, totalCurrentSavings]);

    const changeMonth = (offset) => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };

    const isDataEmpty = bills.length === 0 && deposits.length === 0 && transactions.length === 0;

    return (
        <div>
            <header className="mb-6 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Cash Flow Timeline</h1>
                <div className="flex space-x-2">
                    <button onClick={() => setModal({isOpen: true, type: 'expense'})} className="px-3 py-2 text-sm rounded-lg bg-yellow-500 text-white font-semibold hover:bg-yellow-600 shadow">Add Expense</button>
                </div>
            </header>
            <div className="flex justify-between items-center mt-4 mb-4 bg-white dark:bg-gray-800 p-2 rounded-lg shadow">
                <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><ChevronLeft className="w-6 h-6"/></button>
                <h2 className="text-xl font-semibold">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><ChevronRight className="w-6 h-6"/></button>
            </div>
            <div className="space-y-2">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-600 dark:text-gray-400">Starting Balance for {currentDate.toLocaleString('default', { month: 'long' })}</span>
                        <span className="font-bold text-lg text-gray-800 dark:text-gray-200">${parseFloat(totalCurrentSavings || 0).toFixed(2)}</span>
                    </div>
                </div>
                {dailyBreakdown.map((day, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                        <div className="flex justify-between items-center border-b pb-2 mb-2 border-gray-200 dark:border-gray-700">
                             <h3 className="font-bold text-gray-700 dark:text-gray-300">{day.date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</h3>
                             <p className="font-bold text-lg">${day.endOfDayBalance.toFixed(2)}</p>
                        </div>
                        {day.events.length > 0 ? day.events.map((event, eventIndex) => (
                            <div key={event.id || eventIndex} className="flex items-center justify-between py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 -mx-4 px-4 rounded-lg" onClick={() => setModal({isOpen: true, type: event.type, data: event})}>
                                <p className="font-semibold">{event.name}</p>
                                <p className={`font-bold ${event.type === 'deposit' ? 'text-green-500' : 'text-red-500'}`}>
                                    {event.type === 'deposit' ? '+' : '-'}${parseFloat(event.amount || 0).toFixed(2)}
                                </p>
                            </div>
                        )) : <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">No transactions</p>}
                    </div>
                ))}
                 {isDataEmpty && <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow"><h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300">Your Timeline is Empty</h3><p className="text-gray-400 mt-2">Load the sample plan to get started.</p><button onClick={handleLoadSampleData} className="mt-6 px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow">Load Our Plan</button></div>}
            </div>
        </div>
    );
  };
  
  const SavingsPage = () => {
    return (
        <div>
            <header className="mb-6 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Savings Goals</h1>
                <button onClick={() => setModal({isOpen: true, type: 'savingsGoal'})} className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow"><PlusCircle className="w-5 h-5" /><span>Add Goal</span></button>
            </header>
            <div className="space-y-4">
                {savingsGoals.length > 0 ? savingsGoals.map(goal => {
                    const progress = goal.goal > 0 ? (goal.current / goal.goal) * 100 : 0;
                    return (
                        <div key={goal.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow cursor-pointer" onClick={() => setModal({isOpen: true, type: 'savingsGoal', data: goal})}>
                            <div className="flex justify-between items-center mb-2">
                                <p className="font-bold text-lg">{goal.name}</p>
                                <p className="font-semibold">${parseFloat(goal.current || 0).toFixed(2)} / ${parseFloat(goal.goal || 0).toFixed(2)}</p>
                            </div>
                             <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                                <div className="bg-blue-600 h-4 rounded-full" style={{ width: `${progress > 100 ? 100 : progress}%` }}></div>
                            </div>
                        </div>
                    )
                }) : <p className="text-center text-gray-500 dark:text-gray-400 py-8">No savings goals yet.</p>}
            </div>
        </div>
    );
  };

  const LoansPage = () => {
      return (
        <div>
            <header className="mb-6 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Loans</h1>
                <button onClick={() => setModal({isOpen: true, type: 'loan'})} className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow"><PlusCircle className="w-5 h-5" /><span>Add Loan</span></button>
            </header>
            <div className="space-y-4">
                {loans.length > 0 ? loans.map(loan => (
                    <div key={loan.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow cursor-pointer" onClick={() => setModal({isOpen: true, type: 'loan', data: loan})}>
                        <p className="font-bold text-lg">{loan.name}</p>
                        <p className="text-gray-600 dark:text-gray-400">Balance: ${parseFloat(loan.principal || 0).toFixed(2)}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Interest Rate: {loan.interestRate}% | Min. Payment: ${parseFloat(loan.minimumPayment || 0).toFixed(2)}</p>
                    </div>
                )) : <p className="text-center text-gray-500 dark:text-gray-400 py-8">No loans to track.</p>}
            </div>
        </div>
      );
  };
  
  const SchedulePage = () => {
    const sortedAppointments = [...appointments].sort((a,b) => new Date(a.date) - new Date(b.date));
    // eslint-disable-next-line react-hooks/exhaustive-deps
	const allContacts = useMemo(() => {
        const fromBills = bills.filter(b => b.contactInfo).map(b => ({name: `${b.name} (Bill)`, phone: b.contactInfo, isFromBill: true}));
        return [...fromBills, ...contacts].sort((a,b) => a.name.localeCompare(b.name));
    }, [bills, contacts]);

    return (
      <div>
        <div className="mb-8">
            <header className="mb-6 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Appointments</h1>
                <button onClick={() => setModal({isOpen: true, type: 'appointment'})} className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow"><PlusCircle className="w-5 h-5" /><span>Add</span></button>
            </header>
            <div className="space-y-4">
                {sortedAppointments.length > 0 ? sortedAppointments.map(item => (
                    <div key={item.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700" onClick={() => setModal({isOpen: true, type: 'appointment', data: item})}>
                        <p className="font-bold text-lg">{item.name}</p>
                        <p className="text-gray-600 dark:text-gray-400">{new Date(item.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {item.time}</p>
                        {item.address && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Location: {item.address}</p>}
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.notes}</p>
                    </div>
                )) : <p className="text-center text-gray-500 dark:text-gray-400 py-8">No appointments scheduled.</p>}
            </div>
        </div>
        <div className="mt-12">
            <header className="mb-6 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Contacts</h1>
                <button onClick={() => setModal({isOpen: true, type: 'contact'})} className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow"><PlusCircle className="w-5 h-5" /><span>Add</span></button>
            </header>
            <div className="space-y-4">
                {allContacts.map((item, index) => (
                    <div key={item.id || index} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700" onClick={() => !item.isFromBill && setModal({isOpen: true, type: 'contact', data: item})}>
                        <p className="font-bold text-lg">{item.name}</p>
                        <p className="text-gray-600 dark:text-gray-400">{item.phone}</p>
                        <p className="text-gray-600 dark:text-gray-400">{item.email}</p>
                        {item.address && <p className="text-gray-600 dark:text-gray-400">{item.address}</p>}
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.notes}</p>
                    </div>
                ))}
                {allContacts.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 py-8">No contacts found.</p>}
            </div>
        </div>
      </div>
    );
  };

  const SettingsPage = () => {
      const { theme, setTheme } = useContext(ThemeContext);
      return (
        <div>
            <header className="mb-6"><h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Settings</h1></header>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                <div className="flex justify-between items-center">
                    <span className="font-semibold text-lg">Theme</span>
                    <select value={theme} onChange={(e) => setTheme(e.target.value)} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600">
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="mountain">Mountain Dawn</option>
                        <option value="ocean">Oceanic Calm</option>
                    </select>
                </div>
                 <div className="mt-8">
                    <h2 className="text-xl font-bold mb-2">Budget ID</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Share this ID with your partner to sync your budgets.</p>
                     <div className="flex items-center justify-center space-x-2 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                        <span className="font-semibold text-gray-600 dark:text-gray-300 break-all">{budgetID}</span>
                        <button onClick={copyToClipboard} className="text-blue-500 hover:text-blue-700 flex-shrink-0"><Copy className="w-5 h-5"/></button>
                        {copySuccess && <span className="text-green-600 text-xs">{copySuccess}</span>}
                    </div>
                </div>
            </div>
        </div>
      );
  };

  const ItemForm = ({ modalConfig, onSave, onDelete, onClose }) => {
    const { type, data } = modalConfig;
    const [formData, setFormData] = useState(data || {});
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const dataToSave = {...formData};
        if(dataToSave.date) dataToSave.date = new Date(dataToSave.date);
        if(dataToSave.startDate) dataToSave.startDate = new Date(dataToSave.startDate);
        await onSave(type, dataToSave);
        setIsSaving(false);
    };

    const renderFields = () => {
        switch(type) {
            case 'bill':
            case 'deposit':
            case 'expense':
                 return (
                    <>
                        <input name="name" value={formData.name || ''} onChange={handleChange} placeholder="Name" className="w-full p-3 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-lg" required/>
                        <input type="number" name="amount" value={formData.amount || ''} onChange={handleChange} placeholder="Amount" className="w-full p-3 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-lg" required step="0.01"/>
                        <input type="date" name="date" value={formData.date ? (formData.date instanceof Date ? formData.date.toISOString().split('T')[0] : formData.date) : new Date().toISOString().split('T')[0]} onChange={handleChange} className="w-full p-3 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-lg" required/>
                         {type === 'bill' && <textarea name="contactInfo" value={formData.contactInfo || ''} onChange={handleChange} placeholder="Contact Info (Phone, etc.)" className="w-full p-3 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-lg h-24"/>}
                    </>
                );
            case 'savingsGoal':
                return (
                    <>
                        <input name="name" value={formData.name || ''} onChange={handleChange} placeholder="Goal Name (e.g., Emergency Fund)" className="w-full p-3 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-lg" required/>
                        <input type="number" name="goal" value={formData.goal || ''} onChange={handleChange} placeholder="Goal Amount" className="w-full p-3 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-lg" required step="0.01"/>
                        <input type="number" name="current" value={formData.current || ''} onChange={handleChange} placeholder="Current Amount" className="w-full p-3 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-lg" required step="0.01"/>
                    </>
                );
            case 'loan':
                return (
                    <>
                        <input name="name" value={formData.name || ''} onChange={handleChange} placeholder="Loan Name (e.g., Car Loan)" className="w-full p-3 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-lg" required/>
                        <input type="number" name="principal" value={formData.principal || ''} onChange={handleChange} placeholder="Current Principal Balance" className="w-full p-3 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-lg" required step="0.01"/>
                        <input type="number" name="interestRate" value={formData.interestRate || ''} onChange={handleChange} placeholder="Interest Rate (%)" className="w-full p-3 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-lg" required step="0.01"/>
                        <input type="number" name="minimumPayment" value={formData.minimumPayment || ''} onChange={handleChange} placeholder="Minimum Monthly Payment" className="w-full p-3 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-lg" required step="0.01"/>
                    </>
                );
            case 'appointment':
                return (
                    <>
                        <input name="name" value={formData.name || ''} onChange={handleChange} placeholder="Appointment Title" className="w-full p-3 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-lg" required/>
                        <input type="date" name="date" value={formData.date ? (formData.date instanceof Date ? formData.date.toISOString().split('T')[0] : formData.date) : ''} onChange={handleChange} className="w-full p-3 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-lg" required/>
                        <input type="time" name="time" value={formData.time || ''} onChange={handleChange} className="w-full p-3 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-lg"/>
                        <input type="number" name="cost" value={formData.cost || ''} onChange={handleChange} placeholder="Optional Cost" className="w-full p-3 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-lg" step="0.01"/>
                        <textarea name="address" value={formData.address || ''} onChange={handleChange} placeholder="Location / Address" className="w-full p-3 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-lg h-24"/>
                        <textarea name="notes" value={formData.notes || ''} onChange={handleChange} placeholder="Notes" className="w-full p-3 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-lg h-24"/>
                        <div className="pt-2">
                            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Contact Info (Optional)</h3>
                            <input name="contactName" value={formData.contactName || ''} onChange={handleChange} placeholder="Contact Name" className="w-full p-3 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-lg mb-2"/>
                            <input type="tel" name="contactPhone" value={formData.contactPhone || ''} onChange={handleChange} placeholder="Contact Phone" className="w-full p-3 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-lg"/>
                        </div>
                    </>
                );
            case 'contact':
                return (
                    <>
                        <input name="name" value={formData.name || ''} onChange={handleChange} placeholder="Contact Name" className="w-full p-3 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-lg" required/>
                        <input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} placeholder="Phone Number" className="w-full p-3 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-lg"/>
                        <input type="email" name="email" value={formData.email || ''} onChange={handleChange} placeholder="Email Address" className="w-full p-3 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-lg"/>
                        <textarea name="address" value={formData.address || ''} onChange={handleChange} placeholder="Address" className="w-full p-3 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-lg h-24"/>
                        <textarea name="notes" value={formData.notes || ''} onChange={handleChange} placeholder="Notes" className="w-full p-3 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-lg h-24"/>
                    </>
                );
            default: return null;
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-lg relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"><X className="w-6 h-6" /></button>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 capitalize">{data?.id ? 'Edit' : 'Add'} {type}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {renderFields()}
                    <div className="flex justify-between items-center pt-4">
                        {data?.id && <button type="button" onClick={() => onDelete(type, data.id)} className="px-6 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700">Delete</button>}
                        <div className="flex-grow"></div>
                        <div className="flex space-x-3">
                            <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                            <button type="submit" disabled={isSaving} className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50">
                                {isSaving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
  };


  // --- Main Render Logic ---
  if (!isAuthReady) return <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900"><div className="text-xl font-semibold text-gray-600 dark:text-gray-300">Initializing Secure Session...</div></div>;
  if (!budgetID) return <WelcomeScreen />;

  return (
    <MainLayout>
      {activeTab === 'timeline' && <TimelinePage currentDate={currentDate} setCurrentDate={setCurrentDate} bills={bills} deposits={deposits} transactions={transactions} totalCurrentSavings={totalCurrentSavings} db={db} getBasePath={getBasePath} />}
      {activeTab === 'savings' && <SavingsPage savingsGoals={savingsGoals} />}
      {activeTab === 'loans' && <LoansPage loans={loans} transactions={transactions} />}
      {activeTab === 'schedule' && <SchedulePage appointments={appointments} contacts={contacts} bills={bills} />}
      {activeTab === 'settings' && <SettingsPage />}
    </MainLayout>
  );
}

export default function ThemedApp() {
    return (
        <ThemeProvider>
            <App />
        </ThemeProvider>
    )
}
