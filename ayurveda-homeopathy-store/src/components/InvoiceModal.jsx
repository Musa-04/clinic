// Keep the legacy import path working while sharing the maintained invoice UI.
// The previous component was truncated mid-render, which left a print handler
// inside JSX and prevented linting the application.
import TaxInvoiceModal from "./TaxInvoiceModal";

export default TaxInvoiceModal;
