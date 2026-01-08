
// ... existing imports ...
import { 
  // ... existing icons ...
  ClipboardListIcon,
  // ...
  SparklesIcon
} from './Icons';

// ... Inside Sidebar component ...

// Find the 'registers' item in menuStructure and ensure it looks like this:
/* 
    { 
        id: 'registers', 
        label: 'Cadastros', 
        icon: ClipboardListIcon,
        subItems: [
            { id: 'reg-staff', label: 'Equipe & RH', icon: UsersIcon },
            { id: 'reg-equipments', label: 'Equipamentos', icon: ActivityIcon },
            { id: 'reg-services', label: 'Serviços' },
            { id: 'rep-assessment-templates', label: 'Modelos de Avaliação', icon: SparklesIcon }, // ADDED HERE
            { id: 'reg-forms', label: 'Fichas Simples' },
            { id: 'reg-providers', label: 'Fornecedores' },
            { id: 'reg-holidays', label: 'Feriados' },
            { id: 'reg-docs', label: 'Atestados' },
            { id: 'reg-contracts', label: 'Contratos' },
            { id: 'reg-templates', label: 'Templates Evolução' },
            { id: 'reg-goals', label: 'Objetivos' },
        ]
    },
*/
// ... rest of file ...
