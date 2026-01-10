
export interface Notification {
    id: string;
    type: 'success' | 'warning' | 'error' | 'info' | 'financial' | 'agenda';
    title: string;
    message: string;
    time: string;
    read: boolean;
}

export const MOCK_NOTIFICATIONS: Notification[] = [
    { id: '1', type: 'agenda', title: 'Agendamento Confirmado', message: 'Ana Silva confirmou presença para hoje às 14h.', time: '5 min atrás', read: false },
    { id: '2', type: 'warning', title: 'Estoque Baixo', message: 'Gel Condutor (5L) atingiu o nível mínimo.', time: '1 hora atrás', read: false },
    { id: '3', type: 'info', title: 'Novo Lead', message: 'Roberto se cadastrou via Instagram.', time: '2 horas atrás', read: false },
    { id: '4', type: 'financial', title: 'Pagamento Recebido', message: 'Pix de R$ 350,00 recebido de Carlos.', time: '3 horas atrás', read: true },
    { id: '5', type: 'error', title: 'Falha no Backup', message: 'Não foi possível sincronizar com o Drive.', time: '1 dia atrás', read: true },
];
