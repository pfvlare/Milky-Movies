import * as yup from 'yup';

export type RegisterType = {
    email: string;
    password: string;
    firstname: string;
    lastname: string;
    phone: string;
    address: string;
    plan: 'basic' | 'intermediary' | 'complete'; // ✅ novo campo
};

export const registerSchema = yup.object().shape({
    email: yup.string().email().required(),
    password: yup.string().min(6).required(),
    firstname: yup.string().required(),
    lastname: yup.string().required(),
    phone: yup.string().required(),
    address: yup.string().required(),
    plan: yup.string().oneOf(['basic', 'intermediary', 'complete']).required(), // ✅
});
