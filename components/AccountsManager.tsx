
import React, { useState } from 'react';
import { LandmarkIcon, CreditCardIcon, PlusIcon, WalletIcon, TrashIcon } from './Icons';

interface Account {
    id: string;
    name: string;
    type: 'checking' | 'savings' | 'credit' | 'cash';
    balance: number;
    institution?: string;
    lastDigits?: string;
}

const MOCK_ACCOUNTS: Account[] = [
    { id: '1', name: 'Itaú PJ', type: 'checking', balance: 15450.00, institution: 'Itaú' },
    { id: '2', name: 'Caixinha Clínica', type: 'cash', balance: 350.00 },
    { id: '3', name: 'Nubank PJ', type: 'credit', balance: -1200.00, institution: 'Nubank', lastDigits: '4589' },
];

const AccountsManager = () => {
    const [accounts, setAccounts] = useState<Account[]>(MOCK_ACCOUNTS);
    const [isAdding, setIsAdding] = useState(false);
    const [newAccount, setNewAccount] = useState<Partial<Account>>({ type: 'checking' });

    const handleAdd = () => {
        if (!newAccount.name || newAccount.balance === undefined) return alert("Preencha os campos.");
        setAccounts([...accounts, { ...newAccount, id: Date.now().toString() } as Account]);
        setIsAdding(false);
        setNewAccount({ type: 'checking' });
    };

    const handleDelete = (id: string) => {
        if (confirm("Remover conta?")) setAccounts(accounts.filter(a => a.id !== id));
    };

    const getTypeIcon = (type: string) => {
        switch(type) {
            case 'credit': return <CreditCardIcon className="w-5 h-5 text-purple-600" />;
            case 'cash': return <WalletIcon className="w-5 h-5 text-emerald-600" />;
            default: return <LandmarkIcon className="w-5 h-5 text-blue-600" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <LandmarkIcon className="w-6 h-6 text-primary" />
                        Contas e Cartões
                    </h2>
                    <p className="text-sm text-slate-500">Gerencie suas contas bancárias e caixas.</p>
                </div>
                <button 
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors"
                >
                    <PlusIcon className="w-4 h-4" /> Nova Conta
                </button>
            </div>

            {isAdding && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4 animate-in slide-in-from-top-2">
                    <input 
                        className="px-3 py-2 rounded border border-slate-300" 
                        placeholder="Nome da Conta" 
                        value={newAccount.name || ''} 
                        onChange={e => setNewAccount({...newAccount, name: e.target.value})} 
                    />
                    <select 
                        className="px-3 py-2 rounded border border-slate-300"
                        value={newAccount.type}
                        onChange={e => setNewAccount({...newAccount, type: e.target.value as any})}
                    >
                        <option value="checking">Conta Corrente</option>
                        <option value="savings">Poupança</option>
                        <option value="cash">Caixa Físico</option>
                        <option value="credit">Cartão de Crédito</option>
                    </select>
                    <input 
                        type="number" 
                        className="px-3 py-2 rounded border border-slate-300" 
                        placeholder="Saldo Inicial" 
                        value={newAccount.balance || ''} 
                        onChange={e => setNewAccount({...newAccount, balance: parseFloat(e.target.value)})} 
                    />
                    <button onClick={handleAdd} className="bg-primary text-white rounded font-bold hover:bg-sky-600 transition-colors">Salvar</button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accounts.map(acc => (
                    <div key={acc.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${acc.type === 'credit' ? 'bg-purple-50' : acc.type === 'cash' ? 'bg-emerald-50' : 'bg-blue-50'}`}>
                                    {getTypeIcon(acc.type)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">{acc.name}</h3>
                                    <p className="text-xs text-slate-500 capitalize">{acc.type === 'checking' ? 'Conta Corrente' : acc.type === 'credit' ? 'Cartão Crédito' : acc.type}</p>
                                </div>
                            </div>
                            <button onClick={() => handleDelete(acc.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Saldo Atual</p>
                                <p className={`text-2xl font-bold ${acc.balance < 0 ? 'text-red-500' : 'text-slate-900'}`}>
                                    R$ {acc.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                            {acc.lastDigits && <span className="text-xs text-slate-400 font-mono">•••• {acc.lastDigits}</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AccountsManager;
