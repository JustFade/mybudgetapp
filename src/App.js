import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
// eslint-disable-next-line no-unused-vars
import { getFirestore, collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, setDoc, query, writeBatch, getDoc, Timestamp } from 'firebase/firestore';

// --- Configuration & Constants ---
// Your Firebase project configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // <--- YOU WILL REPLACE THIS LATER (from Firebase Console -> Project settings -> General -> Web app)
  authDomain: "budgeting-65f97.firebaseapp.com",
  projectId: "budgeting-65f97",
  storageBucket: "budgeting-65f97.appspot.com",
  messagingSenderId: "446678123087",
  appId: "YOUR_APP_ID", // <--- YOU WILL REPLACE THIS LATER (from Firebase Console -> Project settings -> General -> Web app)
  // measurementId: "YOUR_MEASUREMENT_ID" // <--- OPTIONAL: UNCOMMENT & REPLACE IF USING GOOGLE ANALYTICS (from Firebase Console -> Project settings -> Integrations -> Google Analytics)
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
// eslint-disable-next-line no-unused-vars
// Removed the unused 'Users' icon entirely as it wasn't used anywhere in the code.
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
    // Only initialize Firebase if firebaseConfig is not empty
    if (Object.keys(firebaseConfig).length > 0 && firebaseConfig.apiKey !== "YOUR_API_KEY") {
      const app = initializeApp(firebaseConfig);
      const authInstance = getAuth(app);
      setDb(getFirestore(app));
      onAuthStateChanged(authInstance, async (user) => {
        if (!user) {
          try {
            // __initial_auth_token is always null based on our definition
            // So this path will always lead to signInAnonymously
            await signInAnonymously(authInstance);
          } catch (error) { console.error("Error signing in:", error); }
        }
        setIsAuthReady(true);
      });
    } else {
        // If config is missing or placeholder, indicate auth is ready but app won't function fully
        console.warn("Firebase config is missing or incomplete. Some app features may not work.");
        setIsAuthReady(true);
    }
  }, []); // Empty dependency array means this runs once on mount

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
    // Check for crypto.randomUUID support or fall back to a simpler ID
    const newID = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
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
        // Use modern clipboard API if available, fallback to execCommand
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(budgetID).then(() => {
                setCopySuccess('Copied!');
                setTimeout(() => setCopySuccess(''), 2000);
            }).catch(err => {
                console.error("Failed to copy using clipboard API:", err);
                setCopySuccess('Failed to copy');
            });
        } else {
            document.execCommand('copy');
            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        }
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
_**// ... [rest of the TimelinePage component remains the same] ...**_

  const SavingsPage = () => { 
    return (
      <div className="text-white">
        <h1 className="text-3xl font-bold">Savings Goals</h1>
        {/* You can add savings-related content here */}
        <p className="mt-4">This page is under construction.</p>
      </div>
    );
  };
 
 // A placeholder for the LoansPage
 const LoansPage = () => (
    <div className="text-white">
      <h1 className="text-3xl font-bold">Loans</h1>
      <p className="mt-4">This page is under construction.</p>
    </div>
 );

 // A placeholder for the SchedulePage
 const SchedulePage = () => (
    <div className="text-white">
      <h1 className="text-3xl font-bold">Schedule</h1>
      <p className="mt-4">This page is under construction.</p>
    </div>
 );

 // A placeholder for the SettingsPage
 const SettingsPage = () => (
    <div className="text-white">
      <h1 className="text-3xl font-bold">Settings</h1>
      <p className="mt-4">This page is under construction.</p>
    </div>
 );


 if (!isAuthReady) {
    return <div>Loading...</div>; // Or a proper loading spinner
 }
 
 if (!budgetID) {
    return <WelcomeScreen />;
 }

 const renderActivePage = () => {
    switch (activeTab) {
        case 'timeline':
            return <TimelinePage 
                        currentDate={currentDate} 
                        setCurrentDate={setCurrentDate}
                        bills={bills}
                        deposits={deposits}
                        transactions={transactions}
                        totalCurrentSavings={totalCurrentSavings}
                        db={db}
                        getBasePath={getBasePath}
                    />;
        case 'savings':
            return <SavingsPage />;
        case 'loans':
            return <LoansPage />;
        case 'schedule':
            return <SchedulePage />;
        case 'settings':
            return <SettingsPage />;
        default:
            return <TimelinePage 
                        currentDate={currentDate} 
                        setCurrentDate={setCurrentDate}
                        bills={bills}
                        deposits={deposits}
                        transactions={transactions}
                        totalCurrentSavings={totalCurrentSavings}
                        db={db}
                        getBasePath={getBasePath}
                    />;
    }
 };

 return (
    <ThemeProvider>
        <MainLayout>
            {renderActivePage()}
        </MainLayout>
    </ThemeProvider>
 );
}

export default App;