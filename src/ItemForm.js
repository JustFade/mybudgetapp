// src/ItemForm.js

import React, { useState, useEffect } from 'react';

// A helper for formatting dates for input fields
const formatDateForInput = (date) => {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d)) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const ItemForm = ({ modalConfig, onSave, onDelete, onClose }) => {
    const { type, data } = modalConfig;
    const [formData, setFormData] = useState({});

    // When the form opens, populate it with existing data or defaults
    useEffect(() => {
        const defaults = {
            name: '',
            amount: '',
            date: formatDateForInput(new Date()),
            recurrence: 'monthly',
            dayOfMonth: '1',
            dayOfWeek: '0',
        };
        setFormData(data ? { ...data, date: formatDateForInput(data.date) } : { ...defaults, type });
    }, [data, type]);


    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        const dataToSave = { ...formData };
        // Convert date back to a Date object before saving
        if (dataToSave.date) {
            dataToSave.date = new Date(dataToSave.date + 'T12:00:00'); // Use noon to avoid timezone issues
        }
        onSave(modalConfig.type, dataToSave);
    };

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
            onDelete(modalConfig.type, data.id);
        }
    };

    // Determine form title based on type
    const title = `${data ? 'Edit' : 'Add'} ${type.charAt(0).toUpperCase() + type.slice(1)}`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">{title}</h2>
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                        <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 shadow-sm" required />
                    </div>

                    {['bill', 'deposit', 'expense', 'loan'].includes(type) && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                            <input type="number" name="amount" value={formData.amount || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 shadow-sm" required />
                        </div>
                    )}

                    {['bill', 'deposit', 'expense'].includes(type) && (
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                            <input type="date" name="date" value={formData.date || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 shadow-sm" required />
                        </div>
                    )}
                    
                    <div className="flex justify-between items-center pt-4">
                        <div>
                            {data && (
                                <button type="button" onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                                    Delete
                                </button>
                            )}
                        </div>
                        <div className="space-x-2">
                             <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400">
                                Cancel
                            </button>
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                Save
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ItemForm;