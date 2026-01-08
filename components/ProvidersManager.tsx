
import React, { useState } from 'react';
import { TruckIcon, PlusIcon, PencilIcon, TrashIcon, CheckCircleIcon, XIcon, PhoneIcon, MailIcon, FilterIcon } from './Icons';

interface Provider {
    id: string;
    name: string;
    category: string;
    contactPerson: string;
    email: string;
    phone: string;
    status: 'active' | 'inactive';
}

const MOCK_PROVIDERS: Provider[] = [
    { id: '1', name: 'Dental Speed', category: 'Descartáveis', contactPerson: 'Juliana', email: 'vendas@dental.com', phone: '(11) 3003-0000', status: 'active' },
    { id: '2', name: 'Shop Fisio', category: 'Equipamentos', contactPerson: 'Ricardo', email: 'contato@shopfisio.com', phone: '(19) 3500-1000', status: 'active' },
    { id: '3', name: 'TechManute', category: 'Serviços', contactPerson: 'Carlos', email: 'carlos@techmanute.com', phone: '(11) 99999-8888', status: 'inactive' },
];

const CATEGORIES = ['Descartáveis', 'Equipamentos', 'Serviços', 'Papelaria', 'Outros'];

const ProvidersManager = () => {
    const [providers, setProviders] = useState<Provider[]>(MOCK_PROVIDERS);
    const [isEditing, setIsEditing] = useState(false);
    const [currentProvider, setCurrentProvider] = useState<Partial<Provider>>({});
    const [searchTerm, setSearchTerm] = useState('');

    const handleSave = () => {
        if (!currentProvider.name || !currentProvider.category) return alert("Preencha os campos obrigatórios.");
        
        if (currentProvider.id) {
            setProviders(prev => prev.map(p => p.id === currentProvider.id ? { ...p, ...currentProvider } as Provider : p));
        } else {
            setProviders(prev => [...prev, { ...currentProvider, id: Date.now().toString(), status: 'active' } as Provider]);
        }
        setIsEditing(false);
        setCurrentProvider({});
    };

    const handleDelete = (id: string) => {
        if (confirm("Excluir fornecedor?")) {
            setProviders(prev => prev.filter(p => p.id !== id));
        }
    };

    const filteredProviders = providers.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <TruckIcon className="w-6 h-6 text-primary" />
                        Fornecedores e Parceiros
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Gerencie contatos para compras e manutenções.</p>
                </div>
                
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <input 
                            type="text" 
                            placeholder="Buscar fornecedor..." 
                            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="absolute left-3 top-2.5 text-slate-400">
                            <FilterIcon className="w-4 h-4" />
                        </div>
                    </div>
                    <button 
                        onClick={() => { setCurrentProvider({ status: 'active' }); setIsEditing(true); }}
                        className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm whitespace-nowrap"
                    >
                        <PlusIcon className="w-4 h-4" />
                        Novo
                    </button>
                </div>
            </div>

            {isEditing && (
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-slate-800">{currentProvider.id ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h3>
                        <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600"><XIcon className="w-5 h-5" /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 mb-1">Razão Social / Nome</label>
                            <input 
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary" 
                                placeholder="Ex: Distribuidora XYZ"
                                value={currentProvider.name || ''}
                                onChange={e => setCurrentProvider(p => ({ ...p, name: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Categoria</label>
                            <select 
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary bg-white"
                                value={currentProvider.category || ''}
                                onChange={e => setCurrentProvider(p => ({ ...p, category: e.target.value }))}
                            >
                                <option value="">Selecione...</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Contato (Pessoa)</label>
                            <input 
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary" 
                                placeholder="Ex: João"
                                value={currentProvider.contactPerson || ''}
                                onChange={e => setCurrentProvider(p => ({ ...p, contactPerson: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Telefone/WhatsApp</label>
                            <input 
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary" 
                                placeholder="(00) 00000-0000"
                                value={currentProvider.phone || ''}
                                onChange={e => setCurrentProvider(p => ({ ...p, phone: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">E-mail</label>
                            <input 
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary" 
                                placeholder="contato@empresa.com"
                                value={currentProvider.email || ''}
                                onChange={e => setCurrentProvider(p => ({ ...p, email: e.target.value }))}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-200 rounded-lg">Cancelar</button>
                        <button onClick={handleSave} className="px-6 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-sky-600 flex items-center gap-2">
                            <CheckCircleIcon className="w-4 h-4" /> Salvar
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredProviders.map(provider => (
                    <div key={provider.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-slate-900">{provider.name}</h3>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border ${provider.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                    {provider.status === 'active' ? 'Ativo' : 'Inativo'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium border border-slate-200">
                                    {provider.category}
                                </span>
                                <span className="text-xs text-slate-500">
                                    Ref: {provider.contactPerson}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                                {provider.phone && (
                                    <div className="flex items-center gap-1.5">
                                        <PhoneIcon className="w-3.5 h-3.5 text-slate-400" />
                                        {provider.phone}
                                    </div>
                                )}
                                {provider.email && (
                                    <div className="flex items-center gap-1.5">
                                        <MailIcon className="w-3.5 h-3.5 text-slate-400" />
                                        {provider.email}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex gap-2 self-end md:self-center">
                            <button 
                                onClick={() => { setCurrentProvider(provider); setIsEditing(true); }} 
                                className="p-2 text-slate-400 hover:text-amber-500 bg-slate-50 hover:bg-amber-50 rounded-lg transition-colors"
                            >
                                <PencilIcon className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => handleDelete(provider.id)} 
                                className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProvidersManager;
