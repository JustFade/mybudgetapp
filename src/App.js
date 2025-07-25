// src/App.js

import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, query, writeBatch, getDoc, Timestamp } from 'firebase/firestore';
import ItemForm from './ItemForm';

// --- Configuration & Constants ---
    const firebaseConfig = {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_APP_ID,
};
const appId = 'family-organizer-app-v12';

// --- Icon Components ---
const PiggyBank = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 5c-1.5 0-2.8 1-3.5 2.5a4.3 4.3 0 0 0-6.9 0A3.5 3.5 0 0 0 5 5c-2 0-3.5 1.5-3.5 3.5 0 2.2 1.9 4 4.3 4.8"/><path d="M19.5 12.5c-2.4 0-4.4 1.5-5.2 3.5h-3.6c-.8-2-2.8-3.5-5.2-3.5C3.5 16 2 17.5 2 19.5S3.5 22 5.5 22h13c2 0 3.5-1.5 3.5-3.5s-1.5-3-3.5-3z"/><path d="M10 16.5c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5"/><path d="M16 5.5c-.3 0-.5.2-.5.5s.2.5.5.5.5-.2.5-.5-.2-.5-.5-.5z"/></svg>;
const Calendar = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
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
    const [db, setDb] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [budgetID, setBudgetID] = useState(localStorage.getItem('budgetID') || null);
    const [activeTab, setActiveTab] = useState('timeline');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [bills, setBills] = useState([]);
    const [deposits, setDeposits] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [savingsGoals, setSavingsGoals] = useState([]);
    const [joinInput, setJoinInput] = useState('');
    const [modal, setModal] = useState({ isOpen: false, type: null, data: null });
    const totalCurrentSavings = useMemo(() => savingsGoals.reduce((sum, goal) => sum + parseFloat(goal.current || 0), 0), [savingsGoals]);

    useEffect(() => {
        if (Object.keys(firebaseConfig).length > 0 && firebaseConfig.apiKey !== "YOUR_ACTUAL_API_KEY_HERE") { // Updated condition
            const app = initializeApp(firebaseConfig);
            const authInstance = getAuth(app);
            setDb(getFirestore(app));
            onAuthStateChanged(authInstance, async (user) => {
                if (!user) {
                    try {
                        await signInAnonymously(authInstance);
                    } catch (error) { console.error("Error signing in:", error); }
                }
                setIsAuthReady(true);
            });
        } else {
            console.warn("Firebase config is missing or incomplete. Some app features may not work.");
            setIsAuthReady(true);
        }
    }, []);

    // NEW HELPER FUNCTION: This will correctly point to your specific budget's data
    const getBudgetDocRef = (dbInstance, budgetId) => {
        // This builds the path segment by segment:
        // collection('artifacts') -> document(appId) -> collection('public') -> document('data') -> collection('budgets') -> document(budgetId)
        return doc(dbInstance, 'artifacts', appId, 'public', 'data', 'budgets', budgetId);
    };

    useEffect(() => {
        if (isAuthReady && db && budgetID) {
            // NO LONGER NEED `basePath` STRING HERE!
            const createListener = (collectionName, setState) => {
                // Correctly gets the subcollection reference using getBudgetDocRef
                const collectionRef = collection(getBudgetDocRef(db, budgetID), collectionName);
                return onSnapshot(query(collectionRef), snap => {
                    const data = snap.docs.map(d => {
                        const docData = d.data();
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
                createListener('bills', setBills),
                createListener('deposits', setDeposits),
                createListener('transactions', setTransactions),
                createListener('savingsGoals', setSavingsGoals),
            ];
            return () => unsubscribers.forEach(unsub => unsub());
        }
    }, [isAuthReady, db, budgetID]);

    const handleCreateBudget = () => {
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

    // Removed the old `getBasePath` function, it's replaced by `getBudgetDocRef`

    const handleSaveItem = async (type, data) => {
        if (!db || !budgetID) return;
        const budgetDocRef = getBudgetDocRef(db, budgetID); // Use the new helper
        const { id, ...itemData } = data;
        let collectionName = `${type}s`;
        if (['bill', 'deposit', 'expense'].includes(type)) {
            collectionName = 'transactions';
        }
        const targetCollectionRef = collection(budgetDocRef, collectionName); // Correct Firestore pathing
        if (id) {
            await updateDoc(doc(targetCollectionRef, id), itemData); // Correct Firestore pathing
        } else {
            await addDoc(targetCollectionRef, { ...itemData, type }); // Correct Firestore pathing
        }
        setModal({ isOpen: false, type: null, data: null });
    };

    const handleDeleteItem = async (type, id) => {
        if (!db || !budgetID) return;
        const budgetDocRef = getBudgetDocRef(db, budgetID); // Use the new helper
        const collectionName = ['bill', 'deposit', 'expense'].includes(type) ? 'transactions' : `${type}s`;
        const targetCollectionRef = collection(budgetDocRef, collectionName); // Correct Firestore pathing
        await deleteDoc(doc(targetCollectionRef, id)); // Correct Firestore pathing
        setModal({ isOpen: false, type: null, data: null });
    };

    const handleLoadSampleData = async () => {
        if (!db || !budgetID) return;
        const batch = writeBatch(db);
        const budgetDocRef = getBudgetDocRef(db, budgetID); // Use the new helper
        // Removed `const basePath = getBasePath();`

        const newSavingsGoalRef = doc(collection(budgetDocRef, 'savingsGoals')); // Correct Firestore pathing
        batch.set(newSavingsGoalRef, { name: "Emergency Fund", goal: 1000, current: -46.64 });
        const newLoanRef = doc(collection(budgetDocRef, 'loans')); // Correct Firestore pathing
        batch.set(newLoanRef, { name: "Car Loan", principal: 15000, interestRate: 5.5, minimumPayment: 350 });
        const depositsData = [
            { name: "Your Paycheck", amount: 750, recurrence: 'weekly', dayOfWeek: '3' },
            { name: "Wife's Paycheck", amount: 936, recurrence: 'bi-weekly', dayOfWeek: '5', startDate: new Date('2024-07-12') }
        ];
        depositsData.forEach(item => {
            const newDocRef = doc(collection(budgetDocRef, 'deposits')); // Correct Firestore pathing
            batch.set(newDocRef, item);
        });
        const billsData = [
            { name: 'Rent', amount: 1450, recurrence: 'monthly', dayOfMonth: '1' },
            { name: 'Car Payments', amount: 900, recurrence: 'monthly', dayOfMonth: '30' },
        ];
        billsData.forEach(item => {
            const newDocRef = doc(collection(budgetDocRef, 'bills')); // Correct Firestore pathing
            batch.set(newDocRef, item);
        });
        await batch.commit();
        alert("Sample data loaded!");
    };

    const WelcomeScreen = () => (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4 text-center">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">Family Organizer</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8">Create a new shared space or join one.</p>
                <button onClick={handleCreateBudget} className="w-full mb-4 px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700">Create New Space</button>
                <div className="space-y-2">
                    <input type="text" value={joinInput} onChange={(e) => setJoinInput(e.target.value)} placeholder="Enter Space ID" className="w-full p-3 bg-gray-200 dark:bg-gray-700 dark:text-white rounded-lg" />
                    <button onClick={handleJoinBudget} disabled={!joinInput.trim()} className="w-full px-6 py-2 rounded-lg bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200">Join Existing</button>
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
                            <Clock className="w-6 h-6 mb-1" />
                            <span className="text-xs font-semibold">Timeline</span>
                        </button>
                        <button onClick={() => setActiveTab('savings')} className={`flex flex-col items-center justify-center w-full h-full transition-colors ${activeTab === 'savings' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                            <PiggyBank className="w-6 h-6 mb-1" />
                            <span className="text-xs font-semibold">Savings</span>
                        </button>
                        <button onClick={() => setActiveTab('loans')} className={`flex flex-col items-center justify-center w-full h-full transition-colors ${activeTab === 'loans' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                            <Landmark className="w-6 h-6 mb-1" />
                            <span className="text-xs font-semibold">Loans</span>
                        </button>
                        <button onClick={() => setActiveTab('schedule')} className={`flex flex-col items-center justify-center w-full h-full transition-colors ${activeTab === 'schedule' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                            <Calendar className="w-6 h-6 mb-1" />
                            <span className="text-xs font-semibold">Schedule</span>
                        </button>
                        <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center justify-center w-full h-full transition-colors ${activeTab === 'settings' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                            <Settings className="w-6 h-6 mb-1" />
                            <span className="text-xs font-semibold">Settings</span>
                        </button>
                    </nav>
                </footer>
                 {modal.isOpen && <ItemForm modalConfig={modal} onSave={handleSaveItem} onDelete={handleDeleteItem} onClose={() => setModal({isOpen: false, type: null, data: null})} />}
            </div>
        );
    };
            const TimelinePage = ({ currentDate, setCurrentDate, bills, deposits, transactions, totalCurrentSavings }) => {
    useEffect(() => {
        const generateMonthlyInstances = async (year, month) => {
            if (!db) return; // db is accessed from App's outer scope
            const budgetDocRef = getBudgetDocRef(db, budgetID); // db and budgetID are accessed from App's outer scope
            const monthId = `${year}-${month}`;
            const generationRef = doc(collection(budgetDocRef, 'generatedMonths'), monthId);
            const generationDoc = await getDoc(generationRef);
            if (generationDoc.exists()) return;
            const batch = writeBatch(db);
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const allRules = [...bills.map(b => ({ ...b, type: 'bill' })), ...deposits.map(d => ({ ...d, type: 'deposit' }))];
            allRules.forEach(rule => {
                const { id, ...ruleData } = rule;
                if (rule.recurrence === 'monthly' && rule.dayOfMonth) {
                    const day = Math.min(parseInt(rule.dayOfMonth), daysInMonth);
                    const date = new Date(year, month, day);
                    const newDocRef = doc(collection(budgetDocRef, 'transactions'));
                    batch.set(newDocRef, { ...ruleData, date, ruleId: id });
                }
            });
            batch.set(generationRef, { generatedAt: Timestamp.now() });
            await batch.commit();
        };
        // Added budgetID to dependencies here since getBudgetDocRef depends on it.
        // Also ensuring db and budgetID are available before attempting to generate.
        if ((bills.length > 0 || deposits.length > 0) && db && budgetID) {
            generateMonthlyInstances(currentDate.getFullYear(), currentDate.getMonth());
        }
    // THIS IS THE LINE! It should be immediately above the closing curly brace and opening square bracket.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentDate, bills, deposits, db, budgetID]); // Added db, budgetID to dependencies

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
                const dayEvents = (eventsByDate[dateStr] || []).sort((a, b) => a.name.localeCompare(b.name));
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
                        <button onClick={() => setModal({ isOpen: true, type: 'expense', data: null })} className="px-3 py-2 text-sm rounded-lg bg-yellow-500 text-white font-semibold hover:bg-yellow-600 shadow">Add Expense</button>
                    </div>
                </header>
                <div className="flex justify-between items-center mt-4 mb-4 bg-white dark:bg-gray-800 p-2 rounded-lg shadow">
                    <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><ChevronLeft className="w-6 h-6" /></button>
                    <h2 className="text-xl font-semibold">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                    <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><ChevronRight className="w-6 h-6" /></button>
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
                                <div key={event.id || eventIndex} className="flex items-center justify-between py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 -mx-4 px-4 rounded-lg" onClick={() => setModal({ isOpen: true, type: event.type, data: event })}>
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

    // --- Placeholder Pages ---
    const SavingsPage = () => <div><h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Savings</h1></div>;
    const LoansPage = () => <div><h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Loans</h1></div>;
    const SchedulePage = () => <div><h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Schedule</h1></div>;
    
    // --- NEW: A functional Settings Page ---
    const SettingsPage = () => {
        const { theme, setTheme } = useContext(ThemeContext);

        const handleLeaveBudget = () => {
            if (window.confirm("Are you sure you want to leave this space? This will clear your local data and you will need to rejoin.")) {
                localStorage.removeItem('budgetID');
                window.location.reload();
            }
        };

        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Settings</h1>
                
                {/* Theme Selector Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-300">Theme</h2>
                    <select 
                        value={theme} 
                        onChange={(e) => setTheme(e.target.value)}
                        className="w-full p-2 rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                    >
                        {Object.entries(themes).map(([key, value]) => (
                            <option key={key} value={key}>{value.name}</option>
                        ))}
                    </select>
                </div>

                {/* Data Management Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-300">Data Management</h2>
                    <button 
                        onClick={handleLoadSampleData}
                        className="w-full mb-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Load Sample Data
                    </button>
                    <button 
                        onClick={handleLeaveBudget}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                        Leave Shared Space
                    </button>
                </div>
            </div>
        );
    };

    if (!isAuthReady) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }
    if (!budgetID) {
        return <WelcomeScreen />;
    }

    const renderActivePage = () => {
        switch (activeTab) {
            case 'timeline':
                return <TimelinePage currentDate={currentDate} setCurrentDate={setCurrentDate} bills={bills} deposits={deposits} transactions={transactions} totalCurrentSavings={totalCurrentSavings} />;
            case 'savings':
                return <SavingsPage />;
            case 'loans':
                return <LoansPage />;
            case 'schedule':
                return <SchedulePage />;
            case 'settings':
                return <SettingsPage />;
            default:
                return <TimelinePage currentDate={currentDate} setCurrentDate={setCurrentDate} bills={bills} deposits={deposits} transactions={transactions} totalCurrentSavings={totalCurrentSavings} />;
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
