
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Package } from '../types';
import { PackageIcon, PlusIcon, CheckCircleIcon, TrashIcon, PencilIcon } from './Icons';
import NewPackageModal from './NewPackageModal';

interface PackagesListProps {
    onNewPackage?: () => void;
    lastUpdate?: number;
}

const PackagesList: React.FC<PackagesListProps> = ({ onNewPackage, lastUpdate }) => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const data = await api.packages.list();
      setPackages(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [lastUpdate]);

  const handleDelete = async (id: string) => {
      if (confirm('Tem certeza que deseja excluir este pacote?')) {
          await api.packages.delete(id);
          fetchPackages();
      }
  };

  const handleToggleStatus = async (pkg: Package) => {
      await api.packages.update(pkg.id, { isActive: !pkg.isActive });
      fetchPackages();
  };

  const handleEdit = (pkg: Package) => {
      setEditingPackage(pkg);
      setIsModalOpen(true);
  };

  const handleModalSubmit = async (data: any) => {
      if (editingPackage) {
          await api.packages.update(editingPackage.id, {
              name: data.name,
              sessionsCount: data.sessionsCount,
              price: data.price,
              validityDays: data.validityDays
          });
      } else {
          await api.packages.create({
              name: data.name,
              sessionsCount: data.sessionsCount,
              price: data.price,
              validityDays: data.validityDays
          });
      }
      fetchPackages();
      setIsModalOpen(false);
      setEditingPackage(null);
  };

  if (loading) return <div className="p-12 text-center text-slate-400">Carregando pacotes...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <div>
           <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
             <PackageIcon className="w-6 h-6 text-primary" />
             Gestão de Pacotes
           </h2>
           <p className="text-sm text-slate-500 mt-1">Configure planos e pacotes de sessões para venda.</p>
        </div>
        <button 
            onClick={() => {
                setEditingPackage(null);
                onNewPackage ? onNewPackage() : setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-sky-600 transition-colors shadow-sm"
        >
           <PlusIcon className="w-4 h-4" />
           Novo Pacote
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {packages.map((pkg) => (
             <div key={pkg.id} className={`relative bg-white p-6 rounded-2xl border ${pkg.isActive ? 'border-slate-200' : 'border-slate-100'} shadow-sm hover:shadow-md transition-all group`}>
                
                {/* Delete Button Overlay */}
                <button 
                    onClick={() => handleDelete(pkg.id)}
                    className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
                    title="Excluir Pacote"
                >
                    <TrashIcon className="w-4 h-4" />
                </button>

                <div className="flex justify-between items-start mb-2 pr-6">
                    <button 
                        onClick={() => handleToggleStatus(pkg)}
                        className={`text-xs font-bold px-2 py-1 rounded cursor-pointer transition-colors ${
                            pkg.isActive ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' : 'text-slate-400 bg-slate-100 hover:bg-slate-200'
                        }`}
                    >
                        {pkg.isActive ? 'Ativo' : 'Inativo'}
                    </button>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-1">{pkg.name}</h3>
                <div className="text-3xl font-extrabold text-slate-900 mb-4">
                    R$ {pkg.price.toFixed(2)}
                </div>

                <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm border-b border-slate-50 pb-2">
                        <span className="text-slate-500">Sessões</span>
                        <span className="font-semibold text-slate-800">{pkg.sessionsCount}</span>
                    </div>
                    <div className="flex justify-between text-sm border-b border-slate-50 pb-2">
                        <span className="text-slate-500">Valor/Sessão</span>
                        <span className="font-semibold text-slate-800">R$ {(pkg.price / pkg.sessionsCount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm border-b border-slate-50 pb-2">
                        <span className="text-slate-500">Validade</span>
                        <span className="font-semibold text-slate-800">{pkg.validityDays} dias</span>
                    </div>
                </div>

                <button 
                    onClick={() => handleEdit(pkg)}
                    className="w-full py-2 bg-slate-50 text-slate-600 font-semibold rounded-lg hover:bg-slate-100 transition-colors text-sm flex items-center justify-center gap-2"
                >
                    <PencilIcon className="w-3 h-3" /> Editar Detalhes
                </button>
             </div>
         ))}
      </div>

      <NewPackageModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editingPackage}
      />
    </div>
  );
};

export default PackagesList;
