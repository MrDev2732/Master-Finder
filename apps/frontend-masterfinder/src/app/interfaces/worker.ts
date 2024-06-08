export interface Worker {
    id: string;
    enabled: boolean;
    created_date: string;
    modified_date: string;
    first_name: string;
    last_name: string;
    rut: string;
    contact_number: string;
    email: string;
    subscription: boolean;
    profile_description?: string;
    password: string;
}