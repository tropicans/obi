import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';

export interface SendMessageResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

@Injectable()
export class FonnteService {
    private readonly logger = new Logger(FonnteService.name);
    private readonly apiUrl = 'https://api.fonnte.com/send';

    constructor(private configService: ConfigService) { }

    async sendMessage(
        target: string,
        message: string,
        options?: {
            delay?: string;
            typing?: boolean;
            schedule?: number;
        },
    ): Promise<SendMessageResult> {
        const apiKey = this.configService.get<string>('FONNTE_API_KEY');

        if (!apiKey) {
            this.logger.error('FONNTE_API_KEY not configured');
            return { success: false, error: 'API key not configured' };
        }

        try {
            // Remove leading + if present and ensure country code
            const cleanTarget = target.replace(/^\+/, '');

            const payload: Record<string, unknown> = {
                target: cleanTarget,
                message,
                countryCode: '62',
                typing: options?.typing ?? true,
                delay: options?.delay ?? '1-3',
            };

            if (options?.schedule) {
                payload['schedule'] = options.schedule;
            }

            this.logger.log(`Sending message to ${cleanTarget}`);

            const response = await axios.post(this.apiUrl, payload, {
                headers: {
                    Authorization: apiKey,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            const data = response.data;

            if (data.status === true) {
                this.logger.log(`Message sent successfully, ID: ${data.id?.[0]}`);
                return {
                    success: true,
                    messageId: data.id?.[0]?.toString(),
                };
            } else {
                this.logger.error(`Fonnte error: ${data.reason || data.detail}`);
                return {
                    success: false,
                    error: data.reason || data.detail || 'Unknown error',
                };
            }
        } catch (error) {
            const axiosError = error as AxiosError;
            const errorMessage = axiosError.response?.data || axiosError.message;
            this.logger.error(`Failed to send message: ${JSON.stringify(errorMessage)}`);
            return {
                success: false,
                error: typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage),
            };
        }
    }

    formatReminderMessage(title: string, body: string, petName: string): string {
        return `*${title.replace('{petName}', petName)}*\n\n${body}`;
    }
}
