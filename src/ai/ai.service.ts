import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AiService {
    private readonly logger = new Logger(AiService.name);
    private readonly apiUrl = 'https://proxy.kelazz.my.id/v1/chat/completions';

    constructor(private configService: ConfigService) { }

    private get apiKey() {
        return this.configService.get<string>('AI_PROXY_KEY') || '';
    }

    private get model() {
        return this.configService.get<string>('AI_MODEL') || 'gemini-2.5-flash';
    }

    async ask(question: string): Promise<string> {
        try {
            this.logger.log(`Asking AI: ${question}`);

            const response = await axios.post(
                this.apiUrl,
                {
                    model: this.model,
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an expert aquatic pet assistant named Obi Assistant. Your goal is to help the user manage their fighter fish (Betta fish) named Obi. Provide concise, helpful, and empathetic advice based on best practices for Betta fish care in small tanks (2.6L). Keep the tone friendly and use emojis where appropriate. Respond in the same language as the user (Indonesian/English).'
                        },
                        {
                            role: 'user',
                            content: question
                        }
                    ],
                    temperature: 0.7,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            return response.data.choices[0].message.content;
        } catch (error: any) {
            const errorDetail = error.response?.data ? JSON.stringify(error.response.data) : error.message;
            this.logger.error(`AI Proxy Error: ${errorDetail}`);
            return 'Maaf, saya sedang mengalami kendala teknis untuk menjawab saat ini. Silakan coba lagi nanti ya! 🐠';
        }
    }

    async generateNotification(context: string): Promise<string> {
        try {
            const response = await axios.post(
                this.apiUrl,
                {
                    model: this.model,
                    messages: [
                        {
                            role: 'system',
                            content: `You are Obi's Personal Assistant. Your job is to send a friendly WhatsApp reminder to the Master. 
                            The message should feel personal, empathetic, and specific to the context provided. 
                            Use the Master's language (Indonesian/English) and include relevant emojis. 
                            Keep it short and punchy, like a chat message. 
                            Example context: "Feeding time". Example response: "Halo Master! Jangan lupa kasih makan Obi biar dia tetap semangat ya! 🍽️🐠"`
                        },
                        {
                            role: 'user',
                            content: `Create a personalized reminder for this context: ${context}`
                        }
                    ],
                    temperature: 0.8,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            return response.data.choices[0].message.content;
        } catch (error) {
            return `Halo Master! Waktunya ${context} untuk Obi ya! 🐠`;
        }
    }

    async predictSituation(history: string): Promise<string> {
        try {
            const response = await axios.post(
                this.apiUrl,
                {
                    model: this.model,
                    messages: [
                        {
                            role: 'system',
                            content: `You are Obi's Health Analyst. Based on the provided history of activities and logs, predict Obi's current situation and provide advice. 
                            Keep it concise (1-2 sentences). Be realistic but positive. Use Indonesian.`
                        },
                        {
                            role: 'user',
                            content: `Here is Obi's recent history: ${history}. What is the current situation?`
                        }
                    ],
                    temperature: 0.6,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            return response.data.choices[0].message.content;
        } catch (error) {
            return 'Obi terlihat baik-baik saja, tapi saya perlu data lebih lanjut untuk memberikan prediksi akurat. 🕵️‍♂️';
        }
    }
}

