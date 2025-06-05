import axios from 'axios';

// URL do ngrok (atualize quando necessário)
const NGROK_URL = "https://wholly-lenient-man.ngrok-free.app";

export const api = axios.create({
    baseURL: process.env.BACKEND_URL || NGROK_URL,
    timeout: 15000, // 15 segundos para ngrok
    headers: {
        'Content-Type': 'application/json',
        // Header necessário para ngrok gratuito
        'ngrok-skip-browser-warning': 'true',
        // Headers adicionais para CORS
        'Access-Control-Allow-Origin': '*',
    },
});

// Log da URL que está sendo usada
console.log('🌐 API Base URL:', api.defaults.baseURL);

// Interceptors para debug e tratamento de erros do ngrok
if (__DEV__) {
    api.interceptors.request.use(
        (config) => {
            console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);

            // Log dos headers para debug
            if (config.headers) {
                console.log('📋 Request headers:', config.headers);
            }

            return config;
        },
        (error) => {
            console.error('❌ Request error:', error);
            return Promise.reject(error);
        }
    );

    api.interceptors.response.use(
        (response) => {
            console.log(`✅ API Response: ${response.status} - ${response.config.url}`);
            return response;
        },
        (error) => {
            const url = error.config?.url || 'unknown';
            const status = error.response?.status || 'Network Error';

            console.error(`❌ API Error: ${status} - ${url}`);
            console.error('Error details:', error.response?.data || error.message);

            // Tratamento específico para erros do ngrok
            if (error.code === 'NETWORK_ERROR' || error.message === 'Network request failed') {
                console.error('🔴 Erro de rede com ngrok! Verifique se:');
                console.error('1. O ngrok está rodando e conectado');
                console.error('2. A URL do ngrok está atualizada');
                console.error('3. O backend está rodando na porta correta');
                console.error(`4. Tente acessar ${NGROK_URL} no navegador`);
            }

            // Erro 403 comum do ngrok
            if (error.response?.status === 403) {
                console.error('🔴 Erro 403: Possível problema de CORS ou ngrok');
            }

            return Promise.reject(error);
        }
    );
}

// Função para testar conectividade específica do ngrok
export const testNgrokConnection = async (): Promise<{
    success: boolean;
    status?: number;
    error?: string;
}> => {
    try {
        console.log('🔍 Testando conexão com ngrok...');

        const response = await api.get('/health', {
            timeout: 10000,
            headers: {
                'ngrok-skip-browser-warning': 'true'
            }
        });

        console.log('✅ Ngrok connection successful');
        return { success: true, status: response.status };

    } catch (error: any) {
        console.error('❌ Ngrok connection failed:', error);

        return {
            success: false,
            error: error.response?.data || error.message
        };
    }
};

// Função para verificar se a URL do ngrok mudou
export const checkNgrokUrl = async (): Promise<void> => {
    try {
        const response = await fetch(NGROK_URL, {
            method: 'HEAD',
            headers: {
                'ngrok-skip-browser-warning': 'true'
            }
        });

        if (!response.ok) {
            console.warn('⚠️ A URL do ngrok pode ter mudado. Verifique o terminal do ngrok.');
        }
    } catch (error) {
        console.error('❌ Não foi possível verificar a URL do ngrok:', error);
    }
};