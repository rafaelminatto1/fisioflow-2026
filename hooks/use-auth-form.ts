
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn, signUp } from '@/lib/auth-client';
import { loginSchema, registerSchema, type LoginFormValues, type RegisterFormValues } from '@/lib/validations/auth';

export const useAuthForm = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [globalError, setGlobalError] = useState('');
    const [globalSuccess, setGlobalSuccess] = useState('');
    const router = useRouter();

    const loginForm = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const registerForm = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
        },
    });

    const handleLogin = async (data: LoginFormValues) => {
        setGlobalError('');
        setGlobalSuccess('');
        try {
            const { error } = await signIn.email({
                email: data.email,
                password: data.password,
            });

            if (error) throw error;

            router.push('/');
        } catch (err: any) {
            console.error("Login error:", err);
            if (err?.code === 'INVALID_EMAIL_OR_PASSWORD' || err?.code === 'INVALID_PASSWORD') {
                setGlobalError('Email ou senha incorretos.');
            } else {
                setGlobalError(err?.message || 'Falha ao entrar. Tente novamente.');
            }
        }
    };

    const handleRegister = async (data: RegisterFormValues) => {
        setGlobalError('');
        setGlobalSuccess('');
        try {
            const { error } = await signUp.email({
                email: data.email,
                password: data.password,
                name: data.name,
            });

            if (error) throw error;

            // Auto-login logic is handled by 'autoSignIn: true' in auth.ts config on server,
            // but client usually needs to handle redirect.
            // If server returns session, better-auth client updates state.

            // We can also try explicit sign in if needed, but let's trust autoSignIn first 
            // or duplicate the logic from the original file to be safe.
            const { error: signInError } = await signIn.email({
                email: data.email,
                password: data.password
            });

            if (signInError) {
                setGlobalSuccess('Conta criada! Faça login para continuar.');
                setIsLogin(true);
                return;
            }

            setGlobalSuccess('Conta criada com sucesso! Entrando...');
            router.push('/');
        } catch (err: any) {
            console.error("Register error:", err);
            if (err?.code === 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL' || err?.body?.code === 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL') {
                setGlobalError('Email já está em uso.');
            } else {
                setGlobalError(err?.message || 'Falha ao criar conta.');
            }
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setGlobalError('');
        setGlobalSuccess('');
        loginForm.reset();
        registerForm.reset();
    };

    return {
        isLogin,
        toggleMode,
        globalError,
        globalSuccess,
        loginForm,
        registerForm,
        handleLogin: loginForm.handleSubmit(handleLogin),
        handleRegister: registerForm.handleSubmit(handleRegister),
        isSubmitting: loginForm.formState.isSubmitting || registerForm.formState.isSubmitting,
    };
};
