import { cpf, cnpj } from 'cpf-cnpj-validator';

/**
 * Type of document - CPF or CNPJ
 */
export enum DocumentType {
    CPF = 'CPF',
    CNPJ = 'CNPJ',
    UNKNOWN = 'UNKNOWN'
}

/**
 * Validates if a document is a valid CPF or CNPJ
 * @param document The document number to validate (can include or not include formatting)
 * @returns True if the document is valid, false otherwise
 */
export const isValidDocument = (document: string): boolean => {
    if (!document) return false;

    // Remove all non-numeric characters
    const cleanDocument = document.replace(/\D/g, '');

    // Check if it's a valid CPF
    if (cleanDocument.length <= 11) {
        return cpf.isValid(cleanDocument);
    }

    // Check if it's a valid CNPJ
    if (cleanDocument.length <= 14) {
        return cnpj.isValid(cleanDocument);
    }

    return false;
};

/**
 * Determines the type of document (CPF or CNPJ)
 * @param document The document number to check
 * @returns The type of document
 */
export const getDocumentType = (document: string): DocumentType => {
    if (!document) return DocumentType.UNKNOWN;

    // Remove all non-numeric characters
    const cleanDocument = document.replace(/\D/g, '');

    // Check if it's a valid CPF
    if (cleanDocument.length <= 11 && cpf.isValid(cleanDocument)) {
        return DocumentType.CPF;
    }

    // Check if it's a valid CNPJ
    if (cleanDocument.length <= 14 && cnpj.isValid(cleanDocument)) {
        return DocumentType.CNPJ;
    }

    return DocumentType.UNKNOWN;
};

/**
 * Formats a document (CPF or CNPJ) with proper mask
 * @param document The document number to format
 * @returns Formatted document string or the original if invalid
 */
export const formatDocument = (document: string): string => {
    if (!document) return '';

    // Remove all non-numeric characters
    const cleanDocument = document.replace(/\D/g, '');

    // Check and format as CPF
    if (cleanDocument.length <= 11 && cpf.isValid(cleanDocument)) {
        return cpf.format(cleanDocument);
    }

    // Check and format as CNPJ
    if (cleanDocument.length <= 14 && cnpj.isValid(cleanDocument)) {
        return cnpj.format(cleanDocument);
    }

    return document;
}; 