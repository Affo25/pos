import { API_BASE } from '../config/apiBase';
import { responseJson } from '../config/apiBase';

/**
 * Request invoice PDF preview from print API. Validates response is a PDF blob.
 * @returns {Promise<Blob>}
 */
export async function fetchInvoicePdfBlob(invoice, template, token) {
  if (!token) {
    throw new Error('Please sign in');
  }
  if (!invoice) {
    throw new Error('No invoice data');
  }
  if (!template) {
    throw new Error('No PDF template selected');
  }

  const res = await fetch(`${API_BASE}/print/preview`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ invoice, template }),
  });

  const contentType = (res.headers.get('content-type') || '').toLowerCase();

  if (!res.ok) {
    let detail = `Preview failed (HTTP ${res.status})`;
    try {
      if (contentType.includes('application/json')) {
        const err = await responseJson(res);
        detail = err.error || err.detail || detail;
      } else {
        const text = await res.text();
        if (text && !text.trim().startsWith('<')) {
          detail = text.slice(0, 200);
        }
      }
    } catch {
      /* use default */
    }
    throw new Error(detail);
  }

  const blob = await res.blob();

  if (!blob || blob.size < 80) {
    throw new Error('PDF preview was empty. Check that the print API is running.');
  }

  let isPdf = contentType.includes('application/pdf') || blob.type === 'application/pdf';
  if (!isPdf && blob.size > 4) {
    const buf = await blob.slice(0, 4).arrayBuffer();
    const b = new Uint8Array(buf);
    isPdf = b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46;
  }

  if (!isPdf) {
    try {
      const text = await blob.text();
      if (text.trim().startsWith('{')) {
        const err = JSON.parse(text);
        throw new Error(err.error || err.detail || 'Preview returned an error');
      }
      if (text.trim().startsWith('<')) {
        throw new Error(
          'Preview returned HTML instead of PDF. Verify REACT_APP_API_URL points to your Node API.',
        );
      }
    } catch (e) {
      if (e.message && !e.message.includes('JSON')) throw e;
    }
    throw new Error('Preview did not return a valid PDF file');
  }

  return blob;
}

export function createPdfObjectUrl(blob) {
  return URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
}

/** Trigger a browser download for a PDF blob */
export function downloadPdfBlob(blob, filename = 'document.pdf') {
  const safe = String(filename || 'document.pdf').replace(/[<>:"/\\|?*\s]+/g, '-');
  const name = safe.toLowerCase().endsWith('.pdf') ? safe : `${safe}.pdf`;
  const pdfBlob = blob instanceof Blob ? blob : new Blob([blob], { type: 'application/pdf' });
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 200);
}

/**
 * Save preview PDF without printing. Uses cached object URL when available.
 */
export async function saveInvoicePdfFromPreview({
  objectUrl,
  invoice,
  template,
  token,
  filename,
}) {
  let blob;
  if (objectUrl) {
    const res = await fetch(objectUrl);
    blob = await res.blob();
  } else if (invoice && template && token) {
    blob = await fetchInvoicePdfBlob(invoice, template, token);
  } else {
    throw new Error('No PDF to save. Wait for preview to load or refresh the PDF.');
  }
  downloadPdfBlob(blob, filename);
}
