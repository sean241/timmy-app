import { db } from './db';
import { Employee } from '@/types';

export const seedEmployees = async () => {
    const dummyEmployees: Employee[] = [
        { id: '1', first_name: 'Moussa', last_name: 'Diop', pin_code: '1234', organization_id: 'org_1' },
        { id: '2', first_name: 'Aminata', last_name: 'Sow', pin_code: '5678', organization_id: 'org_1' },
        { id: '3', first_name: 'Jean', last_name: 'Kouassi', pin_code: '0000', organization_id: 'org_1' },
    ];

    await db.local_employees.bulkPut(dummyEmployees);
    console.log('Seeding complete: 3 employees added.');
};
