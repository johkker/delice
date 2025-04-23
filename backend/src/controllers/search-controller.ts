import { FastifyRequest, FastifyReply } from 'fastify';
import { integratedSearch, IntegratedSearchOptions } from '@services/search-service';

export const searchHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const searchOptions = request.query as IntegratedSearchOptions;
        const results = await integratedSearch(searchOptions);

        return {
            success: true,
            data: results,
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Ocorreu um erro inesperado';
        return reply.status(400).send({
            success: false,
            error: {
                message,
            },
        });
    }
}; 