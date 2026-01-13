
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
        mode: 'onChange',
    });

    const registerForm = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
        },
        mode: 'onChange',
    });

    const handleLogin = async (data: LoginFormValues) => {
        setGlobalError('');
        setGlobalSuccess('');
        try {
            console.log('[AUTH] Attempting login for:', data.email);
            const result = await signIn.email({
                email: data.email,
                password: data.password,
                callbackURL: '/',
            });

            console.log('[AUTH] Login result:', result);

            if (result.error) {
                console.error('[AUTH] Login error:', result.error);
                throw result.error;
            }

            console.log('[AUTH] Login successful, redirecting...');
            router.push('/');
        } catch (err: any) {
            console.error('[AUTH] Login exception:', err);
            console.error('[AUTH] Error code:', err?.code);
            console.error('[AUTH] Error message:', err?.message);
            console.error('[AUTH] Full error:', JSON.stringify(err, null, 2));

            if (err?.status === 429) {
                setGlobalError('Muitas tentativas. Aguarde alguns segundos e tente novamente.');
            } else if (err?.code === 'INVALID_EMAIL_OR_PASSWORD' || err?.code === 'INVALID_PASSWORD') {
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
            setGlobalSuccess('Conta criada com sucesso! Faça login para continuar.');
            loginForm.setValue('email', data.email);
            setIsLogin(true);
            registerForm.reset();
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
