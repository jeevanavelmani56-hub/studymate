declare module "pdf-parse" {
  type PdfData = { text?: string; numpages?: number };
  type PdfOptions = { max?: number };
  function pdfParse(data: Buffer, options?: PdfOptions): Promise<PdfData>;
  export default pdfParse;
}
