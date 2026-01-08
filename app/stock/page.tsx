
'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Product } from '../../types';
import { BoxIcon, PlusIcon, TrashIcon, WarningIcon } from '../../components/Icons';

export default function StockPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
        const data = await api.stock.list();
        setProducts(data);
        setLoading(false);
    };
    load();
  }, []);

  const handleAdd = async () => {
      const name = prompt("Nome do produto:");
      if (!name) return;
      await api.stock.create({ name, category: 'Geral', quantity: 10, minQuantity: 5, unit: 'unid', lastRestock: new Date().toLocaleDateString() });
      const data = await api.stock.list();
      setProducts(data);
  };

  const handleDelete = async (id: string) => {
      if(confirm("Remover item?")) {
          await api.stock.delete(id);
          setProducts(prev => prev.filter(p => p.id !== id));
      }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Carregando estoque...</div>;

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <BoxIcon className="w-6 h-6 text-primary" />
                    Controle de Estoque
                </h2>
                <p className="text-sm text-slate-500">Gerencie insumos e materiais da clínica.</p>
            </div>
            <button onClick={handleAdd} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-sky-600 transition-colors shadow-sm">
                <PlusIcon className="w-4 h-4" /> Novo Item
            </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4">Item</th>
                        <th className="px-6 py-4">Categoria</th>
                        <th className="px-6 py-4">Quantidade</th>
                        <th className="px-6 py-4">Última Reposição</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {products.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-slate-900">{p.name}</td>
                            <td className="px-6 py-4 text-slate-500">{p.category}</td>
                            <td className="px-6 py-4">
                                <span className="font-bold">{p.quantity}</span> <span className="text-xs text-slate-400">{p.unit}</span>
                            </td>
                            <td className="px-6 py-4 text-slate-500">{p.lastRestock}</td>
                            <td className="px-6 py-4">
                                {p.quantity <= p.minQuantity ? (
                                    <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-bold w-fit">
                                        <WarningIcon className="w-3 h-3" /> Baixo
                                    </span>
                                ) : (
                                    <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs font-bold">Normal</span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button onClick={() => handleDelete(p.id)} className="text-slate-400 hover:text-red-500 p-2">
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
}
